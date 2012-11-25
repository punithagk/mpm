<?php
// $Id: uc_price_visibility.admin.inc,v 1.2 2010/11/18 16:17:37 joelstein Exp $

/**
 * Settings form.
 */
function uc_price_visibility_settings(&$form_state) {
  $form['uc_price_visibility_roles'] = array(
    '#type' => 'checkboxes',
    '#options' => user_roles(),
    '#title' => t("Allow the following roles to view this product's price and add it to the cart (default values)"),
    '#default_value' => variable_get('uc_price_visibility_roles', array()),
  );
  $form['uc_price_visibility_message'] = array(
    '#type' => 'textarea',
    '#title' => t('Message to be shown when price is hidden'),
    '#default_value' => variable_get('uc_price_visibility_message', ''),
  );
  $form['uc_price_visibility_message_field'] = array(
    '#type' => 'select',
    '#title' => t('Field displaying the "hidden price" message'),
    '#options' => array(
      'display_price' => t('Display price'),
      'sell_price' => t('Sell price'),
      'add_to_cart' => t('Add to card button'),
    ),
    '#default_value' => variable_get('uc_price_visibility_message_field', 'sell_price'),
  );
  return system_settings_form($form);
}
