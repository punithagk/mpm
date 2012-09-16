<?php
/**
 * @file Provides theme functions for user_files module
*/

/**
 * Default implementaion of theme_user_files_file_list
*/
function theme_user_files_file_list($form) {
  drupal_set_title('Files');
  $files_exist = isset($form['name']) && is_array($form['name']);
  $delete_exists = isset($form['delete']) && is_array($form['delete']);
  $header = array(t('Preview'), t('Name'), t('Type'), t('Size'), t('View'));
  $colspan = 4;
  
  if ($delete_exists) {
    $header[] = t('Delete');
    $colspan++;
  }
  $output = '<p>'. t('The following files are found in your private file repository.') .'</p>';
  $rows = array();

  if ($files_exist) {
    foreach (element_children($form['name']) as $key) {
      $row = array();
      $row[] = drupal_render($form['thumb'][$key]);
      $row[] = drupal_render($form['name'][$key]);
      $row[] = drupal_render($form['mime'][$key]);
      $row[] = drupal_render($form['size'][$key]);
      $row[] = drupal_render($form['view'][$key]);
      if ($delete_exists) {
        $row[] = drupal_render($form['delete'][$key]);
      }
      $rows[] = $row;
    }
  }
  else {
    $rows[] = array(array('data' => t('No files exist.'), 'colspan' => $colspan));
  }

  $output .= theme('table', $header, $rows);
  $output .= drupal_render($form);
  $output .= l('Upload a file', 'user/upload-file');
  return $output;

}

/**
 * Default implementation of theme_user_files_anon_upload_blurb
*/
function theme_user_files_anon_upload_blurb() {
  return '<p>'. t(
    'Please note that you are free to upload images but they will only be stored
    temporarily until you !signin or !register',
    array(
      '!signin' => l(t('Sign-in'), 'user', array('query' => array('destination' => 'user/upload-file'))),
      '!register' => l(t('Register'), 'user/register', array('query' => array('destination' => 'user/upload-file')))
    )
  ) .'</p>'; 
}

/**
 * Default implementation of theme_user_files_upload_form_ajax
*/
function theme_user_files_upload_form_ajax($form) {
  //we need to setup the form_token/build_id/id for js to retrieve
  //and generate these fields with js
  $vars = array(
    'form_build_id' => $form['form_build_id']['#value'],
    'form_id' => $form['form_id']['#value'],
    'form_token' => $form['form_token']['#value'],
    'path' => 'user/upload-file/ajax'
  );
  if ($form['fid']) {
    //we've submitted - hand these back to js for usage
    $vars['fid'] = $form['fid']['#value'];
    $vars['filename'] = $form['filename']['#value'];
  }
  
  drupal_add_js(array(
    'user_files' => $vars
  ), 'setting');  
  return '<div id="upload-target"></div>';
}