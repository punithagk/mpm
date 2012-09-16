<?php
/**
 * @file
 * Callbacks & helper functions for the adminisration pages of uc_conditional_attributes.
 */

/**
 * Generates the form to display when adding or editing a definition.
 */
function uc_conditional_attributes_admin_general_form() {
  drupal_add_css(drupal_get_path('module', 'uc_conditional_attributes') . '/uc_conditional_attributes.css');
  drupal_add_js(drupal_get_path('module', 'uc_conditional_attributes') . '/uc_conditional_attributes.js');

  $form = array();
  $product_classes = uc_conditional_attributes_get_product_classes();
  foreach ($product_classes as $pcid => $name) {
    $form[$pcid] = array(
      '#type' => 'fieldset',
      '#title' => check_plain($name),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
    );
    $options = uc_conditional_attributes_get_parent_attributes();
    $form[$pcid]['parent_attr_' . $pcid] = array(
      '#type' => 'select',
      '#title' => t('Select parent attribute'),
      '#options' => $options,
      '#attributes' => array('onchange' => 'uc_conditional_attributes_filter_attr_options(this.value, ' . '\'parent_attr_options_' . $pcid . '\')'),
    );
    $option_keys = array_reverse(array_keys($options), TRUE);
    $form[$pcid]['parent_attr_options_' . $pcid] = array(
      '#type' => 'select',
      '#title' => t('Select parent attribute\'s option'),
      '#options' => uc_conditional_attributes_get_attribute_options(array_pop($option_keys)),
      '#multiple' => TRUE,
    );
    $form[$pcid]['type_' . $pcid] = array(
      '#type' => 'radios',
      '#title' => t('Type of dependency'),
      '#options' => array('disable' => t('Disable'), 'enable' => t('Enable')),
      '#default_value' => 'disable',
      '#description' => t('Hold ctrl + click to select multiple values.'),
    );
    $form[$pcid]['dependent_attr_' . $pcid] = array(
      '#type' => 'select',
      '#title' => t('Select dependent attributes'),
      '#options' => uc_conditional_attributes_get_all_attributes(),
      '#multiple' => TRUE,
      '#description' => t('Hold ctrl + click to select multiple values.'),
    );
  }
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save Definitions'),
  );
  return $form;
}
function uc_conditional_attributes_admin_general_form_submit($form, $form_state) {
  $values = $form_state['values'];
  $product_classes = uc_conditional_attributes_get_product_classes();
  $invalid_dependency = FALSE;
  $multiple_dependency = FALSE;
  foreach ($product_classes as $pcid => $name) {
    $aid = $values['parent_attr_' . $pcid];
    $oid_arr = $values['parent_attr_options_' . $pcid];
    $type = $values['type_' . $pcid];
    foreach ($values['dependent_attr_' . $pcid] as $dependent_aid) {
      //if this definition does not already exist
      if ($aid != $dependent_aid) {
        foreach ($oid_arr as $oid => $oid_name) {
          $parent_aid = db_result(db_query("SELECT aid FROM {uc_conditional_attributes} WHERE dependent_aid = '%d' AND pcid = '%s'", $dependent_aid , $pcid));
          if (!$parent_aid) {
            db_query("INSERT INTO {uc_conditional_attributes} (aid, oid, dependent_aid, type, pcid) VALUES('%d', '%d', '%d', '%s', '%s')", $aid, $oid, $dependent_aid, $type, $pcid);
          }
          elseif ($parent_aid == $aid) {
            if (!db_result(db_query("SELECT def_id FROM {uc_conditional_attributes} WHERE dependent_aid = '%d' AND oid = '%d' AND pcid = '%s'", $dependent_aid, $oid , $pcid))) {
              db_query("INSERT INTO {uc_conditional_attributes} (aid, oid, dependent_aid, type, pcid) VALUES('%d', '%d', '%d', '%s', '%s')", $aid, $oid, $dependent_aid, $type, $pcid);
            }
          }
          else {
            $multiple_dependency = TRUE;
          }
        }
      }
      else {
        $invalid_dependency = TRUE;
      }
    }
  }
  drupal_set_message(t('Definitions updated successfully.'));
  if ($invalid_dependency) {
    drupal_set_message(t('Some definitions could not be added because same attributes can not be dependent on each other.'), 'warning');
  }
  if ($multiple_dependency) {
    drupal_set_message(t('One attribute can not be dependent on multiple attributes.'), 'warning');
  }
}
/**
 * Display currently defined chained attributes
 */
function uc_conditional_attributes_definitions() {
  drupal_add_css(drupal_get_path('module', 'uc_conditional_attributes') . '/uc_conditional_attributes.css');
  drupal_add_js(drupal_get_path('module', 'uc_conditional_attributes') . '/uc_conditional_attributes.js');

  $product_classes = uc_conditional_attributes_get_product_classes();
  foreach ($product_classes as $pcid => $name) {
    $form[$pcid] = array(
      '#type' => 'fieldset',
      '#title' => check_plain($name),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
    );
    $form[$pcid][$name] = array(
      '#type' => 'item',
      '#value' => uc_conditional_attributes_definitions_grid($pcid),
    );
  }
  // rendering the output as form just because to show multiple product class with in fieldsets
  return drupal_render($form);
}
/**
 * return definitions grid of a specific product class
 * @pcid : product class id
 */
function uc_conditional_attributes_definitions_grid($pcid) {
  $result = db_query("SELECT c.def_id, a1.label AS parent_attr, a2.label AS dependent_attr, o.name, c.pcid, c.type
                    FROM {uc_conditional_attributes} c
                    INNER JOIN {uc_attributes} a1 ON a1.aid = c.aid
                    INNER JOIN {uc_attributes} a2 ON a2.aid = c.dependent_aid
                    INNER JOIN {uc_attribute_options} o ON o.oid = c.oid
                    WHERE c.pcid = '%s'", $pcid);
  $rows = array();
  $head = array(
    t('Parent Attribute'),
    t('Parent Attribute\'s Option'),
    t('Dependent Attribute'),
    t('Type'),
    t('Actions'),
  );
  while ($rec = db_fetch_object($result)) {
    $rows[] = array(
      $rec->parent_attr,
      $rec->name,
      $rec->dependent_attr,
      $rec->type,
      l(t('Delete'), 'admin/store/settings/uc_conditional_attributes/definitions/delete/' . $rec->def_id, array('query' => 'destination=' . 'admin/store/settings/uc_conditional_attributes/definitions')),
    );
  }
  return theme('table', $head, $rows);
}
function uc_conditional_attributes_delete_definition() {
  if (!arg(6) || !is_numeric(arg(6))) {
    drupal_access_denied();
    exit;
  }
  return drupal_get_form("uc_conditional_attributes_delete_definition_confirm_form");
}
function uc_conditional_attributes_delete_definition_confirm_form() {
  return confirm_form(array(), t('Are you sure you want to delete this definition?'), $_REQUEST['destination'], NULL, t('Delete'), t('Cancel'), 'confirm');
}
function uc_conditional_attributes_delete_definition_confirm_form_submit($form, $form_state) {
  db_query("DELETE FROM {uc_conditional_attributes} WHERE def_id = '%d'", arg(6));
  drupal_set_message(t('Definition has been deleted successfully.'));
}
