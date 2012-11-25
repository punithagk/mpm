<?php

/**
 * Generate a form for the admin settings
 */
function uc_discounts_admin_settings() {
  $form['discount'] = array(
    '#type' => 'fieldset',
    '#title' => t('Discount settings'),
  );
  $form['discount']['apply_stage'] = array(
    '#type' => 'radios',
    '#title' => t('Stage at which to apply discounts'),
    '#description' => t("This module can either apply discounts when a product is added to a user's shopping cart or at checkout. Please choose which fits your store better."),
    '#options' => array('order' => t('At checkout/to the order'), 'cart' => t('When a product is added to the cart')),
    '#default_value' => variable_get('uc_discounts_apply_stage', 'order'),
  );
  $form['discount']['discount_price'] = array(
    '#type' => 'checkbox',
    '#title' => t('Show discounted product price'),
    '#description' => t('Show the discounted price of products before checkout.'),
    '#default_value' => variable_get('uc_discounts_product_discount_price', 0),
  );
  $form['discount']['full_price'] = array(
    '#type' => 'checkbox',
    '#title' => t('Also show the full price'),
    '#description' => t('If the discounted product price is displayed, then also show the normal sales price of the item.'),
    '#default_value' => variable_get('uc_discounts_product_full_price', 0),
  );
  $form['discount']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );
  return $form;
}

function uc_discounts_admin_settings_submit($form, &$form_state) {
  variable_set('uc_discounts_apply_stage', $form_state['values']['apply_stage']);
  variable_set('uc_discounts_product_discount_price', $form_state['values']['discount_price']);
  variable_set('uc_discounts_product_full_price', $form_state['values']['full_price']);
}

/**
 * Generate a page which shows all of the discounts
 */
function uc_discounts_show_discounts() {
  // check status and display an error message if no good
  $status = uc_discounts_store_status();
  if (!empty($status)) {
    return t('One or more problems have been detected with your installation of UC Discounts. Please check the status messages on the <a href="!url">Store administration</a> page.', array('!url' => url('admin/store')));
  }

  $discounts = uc_discounts_table();
  $discounts .= l('Add Discount', 'admin/store/discounts/add');

  $element = array(
    '#title' => t('Discounts'),
    '#children' => $discounts,
  );

  return theme('fieldset', $element);
}

/**
 * View the information for a discount
 *
 * @param $discount_id
 * @return
 *   formatted block with discount info
 */
function uc_discounts_discount_view($discount_id) {
  $discount = uc_discounts_load_discount($discount_id);

  // must be a valid discount
  if ($discount->id == 0) {
    drupal_goto('/admin/store/discounts');
  }

  drupal_set_title($discount->name);
  $output = uc_discounts_discount_info($discount);
  $output .= uc_discounts_conditions_table($discount->id);
  $output .= uc_discounts_actions_table($discount->id);

  return $output;
}

/**
 * Format the information for the list of discounts in a table.
 *
 * @return
 *   themed table
 */
function uc_discounts_table() {
  $header = array(
    t('Name'),
    t('Active'),
    t('Weight'),
    t('End Processing'),
    t('Exclusive'),
    t('Start Time'),
    t('End Time'),
    //array('data' => t('Actions'), 'colspan' => 3),
  );

  $caption = t('Discounts');

  $rows = array();
  $discount_list = uc_discounts_get_discounts(TRUE);
  foreach ($discount_list as $discount) {
    $rows[] = array(
      l($discount->name, 'admin/store/discounts/'. $discount->id),
      $discount->is_active ? UC_DISCOUNTS_YES : UC_DISCOUNTS_NO,
      $discount->weight,
      $discount->do_end_processing ? UC_DISCOUNTS_YES : UC_DISCOUNTS_NO,
      $discount->is_exclusive ? UC_DISCOUNTS_YES : UC_DISCOUNTS_NO,
      format_date($discount->start_time),
      format_date($discount->end_time),
      //l(t('View'), 'admin/store/discounts/'.$discount->id),
      //l(t('Edit'), 'admin/store/discounts/'.$discount->id.'/edit'),
      //l(t('Delete'), 'admin/store/discounts/'.$discount->id.'/delete'),
    );
  }
  $table = theme('table', $header, $rows);

  return $table;
}

/**
 * Format discount information
 *
 * @param $discount
 * @return
 *   formatted block of discount info
 */
function uc_discounts_discount_info($discount) {
  $rows = array(
    array(
      'label' => 'Name',
      'value' => $discount->name,
    ),
    array(
      'label' => 'Description',
      'value' => $discount->description,
    ),
    array(
      'label' => 'Max Discounts',
      'value' => $discount->max_discounts,
    ),
    array(
      'label' => 'End Processing',
      'value' => $discount->do_end_processing ? UC_DISCOUNTS_YES : UC_DISCOUNTS_NO,
    ),
    array(
      'label' => 'Exclusive',
      'value' => $discount->is_exclusive ? UC_DISCOUNTS_YES : UC_DISCOUNTS_NO,
    ),
    array(
      'label' => 'Weight',
      'value' => $discount->weight,
    ),
    array(
      'label' => 'Start Time',
      'value' => format_date($discount->start_time),
    ),
    array(
      'label' => 'End Time',
      'value' => format_date($discount->end_time),
    ),
    array(
      'label' => 'Active',
      'value' => $discount->is_active ? UC_DISCOUNTS_YES : UC_DISCOUNTS_NO,
    ),
  );

  $output = theme('uc_discounts_list', $rows);

  return $output;
}

/**
 * Provides the basic discount form
 *
 * Loads the specified discount id, and pre-populated the form based on this.
 * If this is for a new discount, 0 is passed, getting default values.
 *
 * @param $discount_id
 */
function uc_discounts_discount_form($form_state, $discount_id = 0) {
  $discount = uc_discounts_load_discount($discount_id);

  $start_time = getdate($discount->start_time);
  $default_start_time = array(
    'month' => $start_time['mon'],
    'day' => $start_time['mday'],
    'year' => $start_time['year'],
  );

  $end_time = getdate($discount->end_time);
  $default_end_time = array(
    'month' => $end_time['mon'],
    'day' => $end_time['mday'],
    'year' => $end_time['year'],
  );

  if ($discount->id == 0) {
    drupal_set_title(t('New Discount'));
  }
  else {
    drupal_set_title($discount->name);
  }

  $form['discount_id'] = array(
    '#type' => 'value',
    '#value' => $discount->id,
  );
  $form['discount_name'] = array(
    '#title' => t('Discount Name'),
    '#type' => 'textfield',
    '#description' => t('Name of this discount.'),
    '#required' => TRUE,
    '#default_value' => $discount->name,
  );
  $form['description'] = array(
    '#title' => t('Description'),
    '#type' => 'textfield',
    '#description' => t('A brief description.  This will also show up on invoices.'),
    '#required' => TRUE,
    '#default_value' => $discount->description,
  );
  $form['max_discounts'] = array(
    '#title' => t('Max Discounts'),
    '#type' => 'textfield',
    '#description' => t('This discount can be applied up to this many times in a single order.  Set to 0 for unlimited.'),
    '#default_value' => 1,
    '#size' => 4,
    '#required' => TRUE,
    '#default_value' => $discount->max_discounts,
  );
  $form['do_end_processing'] = array(
    '#title' => t('End Processing'),
    '#type' => 'checkbox',
    '#description' => t('If set and this discount matches, no further discounts will be processed.'),
    '#default_value' => $discount->do_end_processing,
  );
  $form['is_exclusive'] = array(
    '#title' => t('Exclusive'),
    '#type' => 'checkbox',
    '#description' => t('If checked, this discount will not be processed if any other discounts before this have matched.  If no other discounts have matched and this one matches, no further discounts will be processed.'),
    '#default_value' => $discount->is_exclusive,
  );
  $form['weight'] = array(
    '#title' => t('Weight'),
    '#type' => 'weight',
    '#description' => t('Determines the order in which discounts are applied.'),
    '#default_value' => 0,
    '#size' => 4,
    '#required' => TRUE,
    '#default_value' => $discount->weight,
  );
  $form['start_time'] = array(
    '#title' => t('Start Date'),
    '#type' => 'date',
    '#description' => 'Start date for this discount.',
    '#required' => TRUE,
    '#default_value' => $default_start_time,
  );
  $form['end_time'] = array(
    '#title' => t('End Date'),
    '#type' => 'date',
    '#description' => 'End date for this discount.',
    '#required' => TRUE,
    '#default_value' => $default_end_time,
  );
  $form['is_active'] = array(
    '#title' => t('Active'),
    '#type' => 'checkbox',
    '#description' => 'If not active, the discount is not available regardless of the start and end times.',
    '#default_value' => 1,
    '#default_value' => $discount->is_active,
  );
  if ($discount->id == 0) {
    $form['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Save'),
    );
  }
  else {
    $form['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Update'),
    );
    $form['delete_button'] = array(
      '#type' => 'submit',
      '#name' => 'delete',
      '#value' => t('Delete'),
    );
  }
  return $form;
}

/**
 * discounts form submission
 */
function uc_discounts_discount_form_submit($form, &$form_state) {
   $start_time = mktime(0, 0, 0,
    $form_state['values']['start_time']['month'],
    $form_state['values']['start_time']['day'],
    $form_state['values']['start_time']['year']
  );
  $end_time = mktime(23, 59, 59,
    $form_state['values']['end_time']['month'],
    $form_state['values']['end_time']['day'],
    $form_state['values']['end_time']['year']
  );

  if ($form_state['values']['discount_id'] == 0) {
    $sql = "INSERT INTO {uc_discounts}
      (name, description, max_discounts, do_end_processing, is_exclusive,
      weight, start_time, end_time, is_active)
      VALUES ('%s', '%s', %d, %d, %d, %d, %d, %d, %d)";
    db_query($sql,
      $form_state['values']['discount_name'],
      $form_state['values']['description'],
      $form_state['values']['max_discounts'],
      $form_state['values']['do_end_processing'],
      $form_state['values']['is_exclusive'],
      $form_state['values']['weight'],
      $start_time,
      $end_time,
      $form_state['values']['is_active']);

    $id = db_last_insert_id('{uc_discounts}', 'id');
  }
  else {
    $id = $form_state['values']['discount_id'];
    $sql = "UPDATE {uc_discounts} SET name='%s', description='%s',
      max_discounts=%d, do_end_processing=%d, is_exclusive=%d, weight=%d,
      start_time=%d, end_time=%d, is_active=%d WHERE id=%d";
    db_query(
      $sql,
      $form_state['values']['discount_name'],
      $form_state['values']['description'],
      $form_state['values']['max_discounts'],
      $form_state['values']['do_end_processing'],
      $form_state['values']['is_exclusive'],
      $form_state['values']['weight'],
      $start_time,
      $end_time,
      $form_state['values']['is_active'],
      $id);
  }

  $form_state['redirect'] = "admin/store/discounts/$id";
}

/**
 * discounts form validation
 */
function uc_discounts_discount_form_validate($form, &$form_state) {
  if (isset($form_state['values']['delete'])) {
    drupal_goto('admin/store/discounts/'. $form_state['values']['discount_id'] .'/delete');
  }
  if (!isset($form_state['values']['discount_id'])) {
    drupal_set_message(t('Invalid form submission'), 'error');
    drupal_goto('admin/store/discounts');
  }
  $start_time = mktime(0, 0, 0,
    $form_state['values']['start_time']['month'],
    $form_state['values']['start_time']['day'],
    $form_state['values']['start_time']['year']
  );
  $end_time = mktime(23, 59, 59,
    $form_state['values']['end_time']['month'],
    $form_state['values']['end_time']['day'],
    $form_state['values']['end_time']['year']
  );
  $today = time();
  if ($end_time <= $start_time) {
    form_set_error('end_time', t('End date can not be before the start date. If your server is a 32bits System, the maximum valid year is 2038. see <a href="http://fr.php.net/mktime">here</a> for more informations.'));
  }
  if ($end_time < $today) {
    form_set_error('end_time', t('Setting the end date in the past is pointless.'));
  }
}


/**
 * Discount deletion form.
 *
 * @param $discount_id
 *   Must be a valid and existing discount
 */
function uc_discounts_discount_delete_form($form_state, $discount_id = 0) {

 $discount = uc_discounts_load_discount($discount_id);

 if ($discount == 0) {
   drupal_goto('admin/store/discounts');
  }
  if (!$discount) {
    drupal_goto('admin/store/discounts');
  }

  drupal_set_title(t('Delete !name', array('!name' => $discount->name)));

  $form['discount_id'] = array(
    '#type' => 'value',
    '#value' => $discount->id,
  );
  $form['discount_name'] = array(
    '#type' => 'value',
    '#value' => $discount->name,
  );
  $form['discount_info'] = array(
    '#value' => uc_discounts_discount_info($discount),
  );
  $output = confirm_form($form,
    t('Delete !name?', array('!name' => $discount->name)),
    'admin/store/discounts/'. $discount->id,
    '',
    t('Delete'),
    t('Cancel')
  );

  return $output;
}

/**
 * discounts deletion form submissions
 */
function uc_discounts_discount_delete_form_submit($form, $form_state) {
  if ($form_state['values']['confirm']) {
    db_query('DELETE FROM {uc_discounts} WHERE id=%d', $form_state['values']['discount_id']);
    db_query('DELETE FROM {uc_discounts_conditions} WHERE discount_id=%d', $form_state['values']['discount_id']);
    db_query('DELETE FROM {uc_discounts_actions} WHERE discount_id=%d', $form_state['values']['discount_id']);

    drupal_set_message(t('Discount "!name" has been deleted', array('!name' => $form_state['values']['discount_name'])));
  }

  return 'admin/store/discounts';
}

/**
 * Format the information for the list of conditions in a table.
 *
 * @param $discount_id
 * @return
 *   themed table
 */
function uc_discounts_conditions_table($discount_id) {
  $condition_list = uc_discounts_get_discount_conditions($discount_id);

  $header = array(
    t('Group'),
    t('Weight'),
    t('Property'),
    t('Op'),
    t('Item'),
    t('Value'),
    array('data' => t('Actions'), 'colspan' => 2),
  );

  $properties = _uc_discounts_get_condition_form_values();
  $condition_info = _uc_discounts_get_conditions();
  $rows = array();
  $base_url = 'admin/store/discounts/'. $discount_id .'/conditions';
  foreach ($condition_list as $condition) {
    // get item name
    if (isset($condition_info[$condition->property]['item_name_callback'])) {
      $item_name_callback = $condition_info[$condition->property]['item_name_callback'];
      $item = $item_name_callback($condition->item_id);
    }
    else {
      $item = '';
    }
    // get product type
    if (isset($condition_info[$condition->property]['product_class_callback'])) {
      $product_class_callback = $condition_info[$condition->property]['product_class_callback'];
      $class = $product_class_callback($condition->item_id);
    }
    else {
      $class = '';
    }
    $value = $condition->value;
    // format value
    $rows[] = array(
      $condition->condition_group,
      $condition->weight,
      $properties[$condition->property],
      $condition->op,
      $item,
      $value,
      l(t('edit'), $base_url .'/'. $condition->id),
      l(t('delete'), $base_url .'/'. $condition->id .'/delete'),
    );
  }
  $table = theme('table', $header, $rows);
  $table .= l('Add Condition', $base_url .'/add');

  $element = array(
    '#title' => t('Conditions'),
    '#collapsible' => TRUE,
    '#children' => $table,
  );

  return theme('fieldset', $element);
}

/**
 * Provides the discount condition form
 *
 * Loads the specified condition id, and pre-populated the form based on this.
 * If this is for a new condition, 0 is passed, getting default values.
 * Otherwise, this checks to make sure that the condition belongs to the
 * specified discount.
 *
 * @param $discount_id
 * @param $condition_id
 */
function uc_discounts_condition_form($form_state, $discount_id, $condition_id = 0) {
  $condition = uc_discounts_load_condition($condition_id);
  if (!$condition) {
    drupal_goto('admin/store/discounts');
  }

  // make sure condition belongs to the right discount
  if ($condition_id > 0 && $condition->discount_id != $discount_id) {
    drupal_goto('admin/store/discounts');
  }

  $discount = uc_discounts_load_discount($discount_id);
  $properties = _uc_discounts_get_condition_form_values();

  // get condition property if set
  if (!empty($condition->property)) {
    $condition_property = $condition->property;
  }
  elseif (isset($form_state['values']['property'])) {
    $condition_property = $form_state['values']['property'];
  }
  else {
    $condition_property = '';
  }

  // make sure condition property is valid
  $condition_info = _uc_discounts_get_conditions();
  if ($condition_property && !isset($condition_info[$condition_property])) {
    $condition_property = '';
  }

  // set page title
  if ($condition_id == '') {
    drupal_set_title(t('@name - Add Condition', array('@name' => $discount->name)));
  }
  else {
    drupal_set_title(t('@name - Edit Condition', array('@name' => $discount->name)));
  }

  // values for all stages
  $form['condition_id'] = array(
    '#type' => 'value',
    '#value' => $condition->id,
  );
  $form['discount_id'] = array(
    '#type' => 'value',
    '#value' => $discount_id,
  );

  if (empty($form_state['storage']['step'])) {
    // we are coming in without a step, so default to step 1
    $form_state['storage']['step'] = 1;
  }

  switch ($form_state['storage']['step']) {
    // First Step
    case 1:
      $form['property'] = array(
        '#type' => 'select',
        '#title' => t('Property'),
        '#options' => $properties,
      );
      $form['submit'] = array(
        '#type' => 'submit',
        '#value' => t('Next'),
      );
    break;
    // Second Step
    case 2:
      // get item field fields for specific condition types
      if (isset($condition_info[$condition_property]['value_field_callback'])) {
        $value_field_callback = $condition_info[$condition_property]['value_field_callback'];
        $value_field = $value_field_callback();
      }
      else {
        $value_field = array(
          '#type' => 'value',
          '#value' => '',
        );
      }

    // item field is not required
    if (isset($condition_info[$condition_property]['item_field_callback'])) {
      $item_field_callback = $condition_info[$condition_property]['item_field_callback'];
      $item_field = $item_field_callback();
    }
    else {
      $item_field = array(
        '#type' => 'value',
        '#value' => 0,
      );
    }

    $form['property'] = array(
      '#type' => 'value',
      '#value' => $condition_property,
    );
    $form['display_property'] = array(
      '#type' => 'item',
      '#title' => t('Property'),
      '#value' => $properties[$condition_property],
    );
    $form['weight'] = array(
      '#type' => 'weight',
      '#title' => t('Weight'),
      '#default_value' => $condition->weight,
    );
    $form['condition_group'] = array(
      '#type' => 'select',
      '#title' => t('Condition Group'),
      '#description' => t('All conditions in a condition group must be satisfied in order to match.  At least one condition group must be satisfied for the discount to be applied.'),
      '#options' => drupal_map_assoc(range(1, 10)),
      '#default_value' => $condition->condition_group,
    );
    $form['comparison'] = array(
      '#type' => 'select',
      '#title' => t('Comparison Operator'),
      '#options' => _uc_discounts_get_comparisons($condition_info[$condition_property]['compare_type']),
      '#default_value' => $condition->op,
    );
    if (isset($condition->item)) {
      $form['item'] = $item_field;
      $form['item']['#default_value'] = $condition->item;
    }
    else {
      $form['item'] = $item_field;
      $form['item']['#default_value'] = $condition->item_id;
    }
    $form['value'] = $value_field;
    $form['value']['#default_value'] = $condition->value;

    $form['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Submit'),
    );
    break;
  }
  return $form;
}

/**
 * conditions form validation
 */
function uc_discounts_condition_form_validate($form, &$form_state) {
  if($form_state['storage']['step'] >= 2) {

    if (!is_numeric($form_state['values']['amount']) && $form_state['values']['amount']!=null) {
      form_set_error('value', t('Amount must be a number'));
    }
    // check if operator is valid for this property
    $property = $form_state['values']['property'];
    $op = $form_state['values']['comparison'];
    $condition_info = _uc_discounts_get_conditions();

    $valid_compare_types = _uc_discounts_get_comparisons($condition_info[$property]['compare_type']);

    if (!in_array($op, $valid_compare_types)) {
      form_set_error('comparison', t('@property may not have a comparison operator of @op', array('@property' => $property, '@op' => $op)));
    }

    // check value based on compare_type
    switch ($condition_info[$property]['compare_type']) {
      case 'integer':
        // this will also catch negative integers, but that's okay here
        if (!ctype_digit($form_state['values']['value'])) {
          form_set_error('value', t('Value must be an integer'));
        }
        break;
      case 'numeric':
        if (!is_numeric($form_state['values']['value'])) {
          form_set_error('value', t('Value must be a number'));
        }
        break;
      case 'money':
        $pattern = '/^\d*(\.\d{2})?$/';
        if (!is_numeric($form_state['values']['value']) || !preg_match($pattern, $form_state['values']['value'])) {
          form_set_error('value', t('Value must be a valid monetary number, with no commas'));
        }
        break;
      // no validation for text values
    }
  }
}

/**
 * conditions form submission
 */
function uc_discounts_condition_form_submit($form, &$form_state) {
  $form_state['storage']['values'][$form_state['storage']['step']] = $form_state['values'];
  $form_state['storage']['step']++;

  if($form_state['storage']['step'] >= 3) {

    if (is_array($form_state['values']['item'])) {
      // encode the array into a serialized string.
      $ids = array();
      foreach ($form_state['values']['item'] as $id => $value) {
        if ($value) { $ids[] = $id; }
      }
      $form_state['values']['item'] = serialize($ids);
    }

    if ($form_state['values']['condition_id'] == 0) {
      $sql = "INSERT INTO {uc_discounts_conditions}
        (discount_id, condition_group, property, op, item_id, value, weight)
        VALUES (%d, %d, '%s', '%s', '%s', '%s', %d)";
      db_query($sql,
        $form_state['values']['discount_id'],
        $form_state['values']['condition_group'],
        $form_state['values']['property'],
        $form_state['values']['comparison'],
        $form_state['values']['item'],
        $form_state['values']['value'],
        $form_state['values']['weight']
      );
      drupal_set_message(t('Condition successfully added'));
    } else {
      $id = $form_state['values']['condition_id'];
      $sql = "UPDATE {uc_discounts_conditions} SET
        discount_id=%d, condition_group=%d, property='%s', op='%s',
        item_id='%s', value='%s', weight=%d WHERE id=%d";
      db_query($sql,
        $form_state['values']['discount_id'],
        $form_state['values']['condition_group'],
        $form_state['values']['property'],
        $form_state['values']['comparison'],
        $form_state['values']['item'],
        $form_state['values']['value'],
        $form_state['values']['weight'],
        $id
      );
      drupal_set_message(t('Condition successfully edited'));
    }

    $form_state['redirect'] = 'admin/store/discounts/'. $form_state['values']['discount_id'];
    // defining a $form_state['redirect'] don't redirect after submitting...??? So we use drupal_goto
    drupal_goto('admin/store/discounts/'. $form_state['values']['discount_id']);
  } else {
    $form_state['rebuild'] = TRUE;
  }
}

/**
 * Condition deletion form.
 *
 * @param $discount_id
 *   Must be a valid and existing discount
 * @param $condition_id
 *   Must be a valid condition which belongs to the specified discount
 */
function uc_discounts_condition_delete($discount_id, $condition_id) {
  // must be a valid condition, belonging to the specified discount
  $condition = uc_discounts_load_condition($condition_id);
  if (!$condition || $condition->discount_id != $discount_id) {
    drupal_goto('admin/store/discounts');
  }

  db_query("DELETE FROM {uc_discounts_conditions} WHERE id=%d", $condition_id);
  drupal_set_message(t('Condition successfully deleted.'));
  drupal_goto("admin/store/discounts/$discount_id");
}

/**
 * Format the information for the list of actions in a table.
 *
 * @param $discount_id
 * @return
 *   themed table
 */
function uc_discounts_actions_table($discount_id) {
  $action_list = uc_discounts_get_discount_actions($discount_id);
  $properties = _uc_discounts_get_action_form_values();
  $action_info = _uc_discounts_get_actions();

  $header = array(
    t('Property'),
    t('Weight'),
    t('Item'),
    t('Qty'),
    t('Amount'),
    array('data' => t('Actions'), 'colspan' => 2),
  );

  $rows = array();
  $base_url = "admin/store/discounts/$discount_id/actions/";
  foreach ($action_list as $action) {
    // get item name
    if (isset($action_info[$action->property]['item_name_callback'])) {
      $item_name_callback = $action_info[$action->property]['item_name_callback'];
      $item = $item_name_callback($action->item_id);
    }
    else {
      $item = $action->item_id;
    }

    // get class name
    if (isset($action_info[$action->property]['product_class_callback'])) {
      $class_name_callback = $action_info[$action->property]['product_class_callback'];
      $class = $class_name_callback($action->item_id);
    }
    else {
      $class = $action->item_id;
    }

    // format amount
    if (isset($action_info[$action->property]['amount_callback'])) {
      $amount_callback = $action_info[$action->property]['amount_callback'];
      $amount = $amount_callback($action->amount);
    }
    else {
      $amount = $action->amount;
    }

    $rows[] = array(
      $properties[$action->property],
      $action->weight,
      $item,
      $action->qty == 0 ? '' : $action->qty,
      $amount,
      l(t('edit'), $base_url . $action->id),
      l(t('delete'), $base_url . $action->id .'/delete'),
    );
  }
  $table = theme('table', $header, $rows);
  $table .= l('Add Action', $base_url .'add');

  $element = array(
    '#title' => t('Actions'),
    '#collapsible' => TRUE,
    '#children' => $table,
  );

  return theme('fieldset', $element);
}

/**
 * Provides the discount action form
 *
 * Loads the specified action  id, and pre-populated the form based on this.
 * If this is for a new action, 0 is passed, getting default values.
 * Otherwise, this checks to make sure that the action belongs to the
 * specified discount.
 *
 * @param $discount_id
 * @param $action_id
 */
function uc_discounts_action_form($form_state, $discount_id, $action_id = 0) {
  $action = uc_discounts_load_action($action_id);
  if (!$action) {
    drupal_goto('admin/store/discounts');
  }

  // make sure action belongs to the right discount
  if ($action_id > 0 && $action->discount_id != $discount_id) {
    drupal_goto('admin/store/discounts');
  }

  $discount = uc_discounts_load_discount($discount_id);
  $properties = _uc_discounts_get_action_form_values();

  // get action property if set
  if (!empty($action->property)) {
    $action_property = $action->property;
  }
  elseif (isset($form_state['values']['property'])) {
    $action_property = $form_state['values']['property'];
  }
  else {
    $action_property = '';
  }

  // make sure action property is valid
  $action_info = _uc_discounts_get_actions();
  if ($action_property && !isset($action_info[$action_property])) {
    $action_property = '';
  }

  // set page title
  if ($action_id == 0) {
    drupal_set_title(t('@name - Add Action', array('@name' => $discount->name)));
  }
  else {
    drupal_set_title(t('@name - Edit Action', array('@name' => $discount->name)));
  }

  // values for all stages
  $form['action_id'] = array(
    '#type' => 'value',
    '#value' => $action->id,
  );
  $form['discount_id'] = array(
    '#type' => 'value',
    '#value' => $discount_id,
  );

  if (empty($form_state['storage']['step'])) {
    // we are coming in without a step, so default to step 1
    $form_state['storage']['step'] = 1;
  }

  switch ($form_state['storage']['step']) {
    case 1:

      $form['property'] = array(
        '#type' => 'select',
        '#title' => t('Property'),
        '#options' => $properties,
      );
      $form['submit'] = array(
        '#type' => 'submit',
        '#value' => t('Next'),
      );

    break;

    case 2:
      if (isset($action_info[$action_property]['item_field_callback'])) {
        $item_field_callback = $action_info[$action_property]['item_field_callback'];
        $item_field = $item_field_callback();
        #$item_field['#default_value'] = $action->item_id;
      }
      else {
        $item_field = array(
          '#type' => 'value',
          '#value' => 0,
        );
      }

      // does this form have a qty field
      if (empty($action_info[$action_property]['has_qty_field'])) {
        $qty_field = array(
          '#type' => 'value',
          '#value' => 0,
        );
      }
      else {
        $qty_field = array(
          '#type' => 'textfield',
          '#title' => t('Qty'),
          '#maxlength' => 4,
          '#size' => 4,
          '#default_value' => $action->qty > 0 ? $action->qty : '',
        );
      }

      $form['property'] = array(
        '#type' => 'value',
        '#value' => $action_property,
      );
      $form['display_property'] = array(
        '#type' => 'item',
        '#title' => t('Property'),
        '#value' => $properties[$action_property],
      );
      $form['weight'] = array(
        '#type' => 'weight',
        '#title' => t('Weight'),
        '#default_value' => $action->weight,
      );
      if (isset($action->item)) {
        $form['item'] = $item_field;
        $form['item']['#default_value'] = $action->item;
      }
      else {
        $form['item'] = $item_field;
        $form['item']['#default_value'] = $action->item_id;
      }
      $form['qty'] = $qty_field;
      $form['amount'] = array(
        '#type' => 'textfield',
        '#title' => t('Amount'),
        '#maxlength' => 10,
        '#size' => 10,
        '#required' => TRUE,
        '#description' => t('Enter either a dollar amount or a percentage'),
        '#default_value' => $action->amount,
      );
      $form['submit'] = array(
        '#type' => 'submit',
        '#value' => t('Submit'),
      );

    break;
  }

  return $form;
}

/**
 * action form submission
 */
function uc_discounts_action_form_submit($form, &$form_state) {
  $form_state['storage']['values'][$form_state['storage']['step']] = $form_state['values'];
  $form_state['storage']['step']++;

  if($form_state['storage']['step'] >= 3) {
    // If string (only one item), convert it into an array to have the same behavior than multiple items.

    if (is_array($form_state['values']['item'])) {
    // encode the array into a serialized string.
      $ids = array();
      foreach ($form_state['values']['item'] as $id => $value) {
        if ($value) { $ids[] = $id; }
      }
      $form_state['values']['item'] = serialize($ids);
    }


      if ($form_state['values']['action_id'] == 0) {
        $sql = "INSERT INTO {uc_discounts_actions}
          (discount_id, property, item_id, qty, amount, weight)
          VALUES (%d, '%s', '%s', %d, '%s', %d)";
        db_query($sql,
          $form_state['values']['discount_id'],
          $form_state['values']['property'],
          $form_state['values']['item'],
          $form_state['values']['qty'],
          $form_state['values']['amount'],
          $form_state['values']['weight']
        );
        drupal_set_message(t('Action successfully added'));
      } else {
        $id = $form_state['values']['action_id'];
        $sql = "UPDATE {uc_discounts_actions} SET
          discount_id=%d, property='%s', item_id='%s', qty=%d,
          amount='%s', weight=%d WHERE id=%d";
        db_query($sql,
          $form_state['values']['discount_id'],
          $form_state['values']['property'],
          $form_state['values']['item'],
          $form_state['values']['qty'],
          $form_state['values']['amount'],
          $form_state['values']['weight'],
          $id
        );
        drupal_set_message(t('Action successfully edited'));
      }

      $form_state['redirect'] = 'admin/store/discounts/'. $form_state['values']['discount_id'];
      // defining a $form_state['redirect'] don't redirect after submitting...??? So we use drupal_goto
      drupal_goto('admin/store/discounts/'. $form_state['values']['discount_id']);

    } else {
      $form_state['rebuild'] = TRUE;
    }
}

/**
 * Action deletion form.
 *
 * @param $discount_id
 *   Must be a valid and existing discount
 * @param $action_id
 *   Must be a valid action which belongs to the specified discount
 */
function uc_discounts_action_delete($discount_id, $action_id) {
  $action = uc_discounts_load_action($action_id);
  if (!$action || $action->discount_id != $discount_id) {
    drupal_goto('admin/store/discounts');
  }

  db_query('DELETE FROM {uc_discounts_actions} WHERE id=%d', $action_id);
  drupal_set_message(t('Action successfully deleted.'));
  drupal_goto('admin/store/discounts/'. $discount_id);
}

/**
 * Format an "item: value" list, with item being <strong>
 *
 * @param $items
 *   Array of items, with each item having "label" and "value"
 * @ingroup themeable
 */
function theme_uc_discounts_list($items) {
  $output = '<div class="border">';
  foreach ($items as $item) {
    if (!isset($item['label']) || !isset($item['value'])) {
      continue;
    }
    $output .= '<strong>'. t($item['label']) .'</strong>: ';
    $output .= check_plain($item['value']);
    $output .= "<br />\n";
  }
  $output .= "</div>\n";

  $element = array(
    '#children' => $output,
  );

  return theme('fieldset', $element);
}
