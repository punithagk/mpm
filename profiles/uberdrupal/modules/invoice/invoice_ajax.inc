<?php
// $Id: invoice_ajax.inc,v 1.1.2.6 2010/10/02 16:50:44 pvogelaar Exp $

/**
 * @file
 * Invoice module
 * 
 * This module was developed by Platina Designs, http://www.platinadesigns.nl
 *
 * @author Pieter Vogelaar <ps.vogelaar@platinadesigns.nl>
 */

/**
 * Set the chosen invoice when creating a node
 */
function invoice_set_template() {
  $template = check_plain($_GET['value']);
  $_SESSION['invoice_template'] = $template;
  $a_items['vat'] = _invoice_get_variable($template, 'vat');
  drupal_json($a_items);
  exit();
}

/**
 * Search if the customer already exists
 */
function invoice_search_customer($value) {
  $a_items = array();
  $customer_value = check_plain($value);

  $result = db_query("SELECT * FROM {invoice_customers} ic
    LEFT JOIN {invoice_invoices} ii ON ic.invoice_id=ii.iid  
    WHERE (company_name LIKE '%%". $customer_value ."%' OR lastname LIKE '%%". $customer_value ."%' OR firstname LIKE '%%". $customer_value ."%')
    GROUP BY vat_number,coc_number,company_name,country,city,zipcode,building_number,lastname,firstname
    ORDER BY company_name, lastname, firstname, invoice_id DESC");

  while ($row = db_fetch_object($result)) {
    $key = $row->cid;
    $value = NULL;
    if (!empty($row->company_name)) {
      $value = $row->company_name;
      $value = !empty($row->zipcode) ? $value ." - ". $row->zipcode : $value;
      $value = !empty($row->building_number) ? $value ." - ". $row->building_number : $value;
      $value = !empty($row->city) ? $value ." - ". $row->city : $value;
      $value = !empty($row->country) ? $value ." - ". $row->country : $value;
      $value = !empty($row->vat_number) ? $value ." - ". $row->vat_number : $value;
      $value = !empty($row->coc_number) ? $value ." - ". $row->coc_number : $value;
      $value = !empty($row->lastname) ? $value ."\n    ". $row->lastname : $value;
      $value = !empty($row->firstname) ? $value ."\n    ". $row->firstname : $value;
    }
    else {
      $value = $row->lastname . (!empty($row->firstname) ? ', '. $row->firstname : '');
    }
    $a_items[$key] = check_plain($value); 
  }
  
  drupal_json($a_items);
  exit();
}

/**
 * Get customer info
 */
function invoice_get_customer_info() {
  // Create alias
  $fv =& $_GET;
  
  $a_data = db_fetch_array(db_query("SELECT company_name,firstname,lastname,street,building_number,zipcode,city,country,coc_number,vat_number,ic.description
    FROM {invoice_customers} ic
    LEFT JOIN {invoice_invoices} ii ON ic.invoice_id=ii.iid  
    WHERE ic.cid=%d
    ORDER BY company_name DESC, lastname DESC, firstname DESC, ic.invoice_id DESC
    LIMIT 1",
    $fv['value']
  ));
  
  if (count($a_data) == 0) {
    $a_data['set_empty'] = TRUE;
  }
  else {
    $a_data['search_customer'] = !empty($a_data['company_name']) ? $a_data['company_name'] : $a_data['lastname'] . (!empty($a_data['firstname']) ? ', '. $a_data['firstname'] : '');
  }
  
  drupal_json($a_data);
  exit;
}

/**
 * Add an invoice item
 */
function invoice_save_item() {
  $fv =& $_POST;
  $a_data = array();

  // Check user admin access for this invoice
  if (!_invoice_user_has_admin_access_to_invoice($fv['invoice_number'])) {
    $a_data['error'] = t('You are not the owner of this item id!');
    drupal_json($a_data);
    exit;
  }

  // Set locale so money has the right format for the preferred culture
  if (intval($fv['invoice_number']) == 0) {
    if ($locale = _invoice_get_variable(_invoice_get_chosen_template(), 'locale')) {
      setlocale(LC_MONETARY, $locale);
    }
    $active_template = _invoice_get_chosen_template();
  }
  else {
    if ($template = db_result(db_query("SELECT it.name FROM {invoice_invoices} ii LEFT JOIN {invoice_templates} it ON ii.tid=it.tid WHERE ii.iid=%d", $fv['invoice_number']))) {
      if ($locale = _invoice_get_variable($template, 'locale')) {
        setlocale(LC_MONETARY, $locale);
      }
      $active_template = $template;
    }
  }
  
  // Display error if price_wihtout_vat and price_with_vat are both not filled in
  if (empty($fv['price_without_vat']) && empty($fv['price_with_vat'])) {
    $a_data['error'] = t('Error') .': '. t('You have to fill in either "Price without VAT" or "Price with VAT"!');  
  }
  
  if (!empty($a_data['error'])) {
    drupal_json($a_data);
    exit;
  }
  
  // Typecast strings to doubles and replace comma with a dot
  $fv['quantity'] = (double) str_replace(',', '.', $fv['quantity']);
  $fv['price_without_vat'] = (double) str_replace(',', '.', $fv['price_without_vat']);
  $fv['price_with_vat'] = (double) str_replace(',', '.', $fv['price_with_vat']);
  
  // Get the price without VAT
  if (!empty($fv['price_without_vat'])) {
    $unitcost = $fv['price_without_vat'];
  }
  else {
    $unitcost = $fv['price_with_vat'] / _invoice_vat_percent_to_decimal(variable_get('invoice_vat', 0));
  }
  
  // Round the price to 3 decimals
  $unitcost = round($unitcost, 3);
  
  // Round quantity to 2 decimals
  $fv['quantity'] = round($fv['quantity'], 2);
  
  if (intval($fv['iid']) > 0) {
    // item id is greater than zero, so we are saving an existing invoice item
    db_query("UPDATE {invoice_items}
      SET description='%s', vat='%f', quantity='%f', unitcost='%f' WHERE iid=%d AND uid=%d AND invoice_id=%d",
      $fv['description'],
      $fv['vat'],
      $fv['quantity'],
      $unitcost,
      $fv['iid'],
      $GLOBALS['user']->uid,
      $fv['invoice_number']
    );
  }
  else {
    // Insert invoice item into the invoice items table
    db_query("INSERT INTO {invoice_items}
      (description,vat,quantity,unitcost,invoice_id,uid,created) VALUES ('%s',%f,%f,%f,%d,%d,'%s')",
      $fv['description'],
      $fv['vat'],
      $fv['quantity'],
      $unitcost,
      $fv['invoice_number'],
      $GLOBALS['user']->uid,
      date('Y-m-d H:i:s')
    );
  }

  // Count the added items and calculate invoice totals
  $count = db_result(db_query("SELECT COUNT(*) as count FROM {invoice_items} WHERE uid=%d AND invoice_id=%d",
    $GLOBALS['user']->uid,
    $fv['invoice_number']
  ));

  if (intval($fv['iid']) > 0) {
    // item id is greater than zero, so we are dealing with an existing invoice item
    $a_data['iid']          = check_plain($fv['iid']);
    $a_data['description']  = nl2br(check_plain($fv['description']));
    $a_data['vat']          = check_plain($fv['vat']) .'%';
    $a_data['quantity']     = check_plain($fv['quantity']);
    $a_data['exunitcost']   = _invoice_round_and_format_money($unitcost, 3);
    $a_data['incunitcost']  = _invoice_round_and_format_money($unitcost * _invoice_vat_percent_to_decimal($fv['vat']), 2);
    $a_data['exsubtotal']   = _invoice_round_and_format_money($fv['quantity'] * $unitcost, 2);
    $a_data['incsubtotal']  = _invoice_round_and_format_money($fv['quantity'] * $unitcost * _invoice_vat_percent_to_decimal($fv['vat']), 2);
    $a_data['actionvalue']  = t('Add item');
  }
  else {
    // Set row class name
    $class = 'item-'. db_last_insert_id('invoice_item', 'iid') .' invoice-item draggable';
    
    // Compose content to send back to the browser
    $a_data['content'] = sprintf('<tr class="%s"><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td class="actions">%s</td></tr>',
      $count & 1 ? $class .' odd' : $class .' even',
      nl2br(check_plain($fv['description'])),
      check_plain($fv['vat']) .'%',
      check_plain($fv['quantity']),
      _invoice_round_and_format_money($unitcost, 3),
      _invoice_round_and_format_money($unitcost * _invoice_vat_percent_to_decimal($fv['vat']), 2),
      _invoice_round_and_format_money($fv['quantity'] * $unitcost, 2),
      _invoice_round_and_format_money($fv['quantity'] * $unitcost * _invoice_vat_percent_to_decimal($fv['vat']), 2),
      _invoice_get_icon('edit', NULL, array(
        'class' => 'action-button edit-action mouse-pointer',
        'title' => t('Edit'),
      ))
      . 
      _invoice_get_icon('delete', NULL, array(
        'class' => 'action-button delete-action mouse-pointer',
        'title' => t('Delete'),
      ))
    );
  
    // Remove the empty from the page
    $a_data['remove_empty_row'] = TRUE;
  }
  
  // Define active vat value to put back on the resetted item form
  $a_data['activevat'] = _invoice_get_variable($active_template, 'vat');
  
  // Get invoice totals
  $a_totals = _invoice_get_invoice_totals($fv['invoice_number'], $GLOBALS['user']->uid);
  
  // Set total
  $a_data['extotal'] = _invoice_round_and_format_money($a_totals['extotal'], 2);
  $a_data['inctotal'] = _invoice_round_and_format_money($a_totals['inctotal'], 2);

  drupal_json($a_data);
  exit;
}

/**
 * Edit an invoice item
 */
function invoice_edit_item() {
  $fv =& $_GET;
  $a_data = array();

  // Check user admin access for this invoice
  if (!_invoice_user_has_admin_access_to_invoice($fv['invoice_number'])) {
    $a_data['error'] = t('You are not the owner of this item id!');
    drupal_json($a_data);
    exit;
  }

  // Check if the item to delete exists
  $a_invoice = db_fetch_object(db_query("SELECT *, COUNT(*) AS count
    FROM {invoice_items}
    WHERE iid=%d AND invoice_id=%d GROUP BY iid",
    $fv['iid'],
    $fv['invoice_number']
  ));

  if ($a_invoice->count == 0) {
    $a_data['error'] = t('This item id does not exist!');
  }
  else {
    $a_data['description'] = $a_invoice->description;
    $a_data['vat'] = $a_invoice->vat;
    $a_data['quantity'] = $a_invoice->quantity;
    $a_data['exunitcost'] = $a_invoice->unitcost;
    $a_data['incunitcost'] = $a_invoice->unitcost * _invoice_vat_percent_to_decimal(variable_get('invoice_vat', 0));
    $a_data['actionvalue']  = t('Save item');
  }
  
  drupal_json($a_data);
  exit;
}

/**
 * Delete an invoice item
 */
function invoice_delete_item() {
  $fv =& $_GET;
  $a_data = array();

  // Check user admin access for this invoice
  if (!_invoice_user_has_admin_access_to_invoice($fv['invoice_number'])) {
    $a_data['error'] = t('You are not the owner of this item id!');
    drupal_json($a_data);
    exit;
  }

  // Set locale so money has the right format for the preferred culture
  if (intval($fv['invoice_number']) == 0) {
    if ($locale = _invoice_get_variable(_invoice_get_chosen_template(), 'locale')) {
      setlocale(LC_MONETARY, $locale);
    }
  }
  elseif ($template = db_result(db_query("SELECT it.name FROM {invoice_invoices} ii LEFT JOIN {invoice_templates} it ON ii.tid=it.tid WHERE ii.iid=%d", $fv['invoice_number']))) {
    if ($locale = _invoice_get_variable($template, 'locale')) {
      setlocale(LC_MONETARY, $locale);
    }
  }

  // Check if the item to delete exists and is owned by this owner
  $a_invoice = db_fetch_object(db_query("SELECT COUNT(*) AS count FROM {invoice_items} WHERE iid=%d AND invoice_id=%d GROUP BY iid",
    $fv['iid'],
    $fv['invoice_number']
  ));

  if ($a_invoice->count == 0) {
    $a_data['error'] = t('This item id does not exist, does not belong to this invoice or you are not the owner!');
  }
  else {
    db_query("DELETE FROM {invoice_items} WHERE iid=%d AND uid=%d AND invoice_id=%d",
      $fv['iid'],
      $GLOBALS['user']->uid,
      $fv['invoice_number']
    );

    // Get invoice totals
    $a_totals = _invoice_get_invoice_totals($fv['invoice_number'], $GLOBALS['user']->uid);

    // Set total
    $a_data['extotal'] = _invoice_round_and_format_money($a_totals['extotal'], 2);
    $a_data['inctotal'] = _invoice_round_and_format_money($a_totals['inctotal'], 2);
  }
   
  drupal_json($a_data);
  exit;
}