<?php

/**
* Registers overrides for various functions.
*
* In this case, overrides three user functions
*/
function printmarket_theme() {
  return array(
    'user_login' => array(
      'template' => 'user-login',
      'arguments' => array('form' => NULL),
    ),
    'user_login_block' => array(
      'template' => 'user-login-block',
      'arguments' => array('form' => NULL),
    ),
    'user_register' => array(
      'template' => 'user-register',
      'arguments' => array('form' => NULL),
    ),
    'user_pass' => array(
      'template' => 'user-pass',
      'arguments' => array('form' => NULL),
    ),
  );
}

/**
 * Sets the body-tag class attribute.
 *
 * Adds 'sidebar-left', 'sidebar-right' or 'sidebars' classes as needed.
 */
function phptemplate_body_class($left, $right) {
  if ($left != '' && $right != '') {
    $class = 'sidebars';
  }
  else {
    if ($left != '') {
      $class = 'sidebar-left';
    }
    if ($right != '') {
      $class = 'sidebar-right';
    }
  }

  if (isset($class)) {
    print ' class="'. $class .'"';
  }
}

/**
 * Return a themed breadcrumb trail.
 *
 * @param $breadcrumb
 *   An array containing the breadcrumb links.
 * @return a string containing the breadcrumb output.
 */
function phptemplate_breadcrumb($breadcrumb) {
  if (!empty($breadcrumb)) {
    return '<div class="breadcrumb">'. implode(' › ', $breadcrumb) .'</div>';
  }
}


function printmarket_preprocess_user_login(&$variables) {
  $variables['intro_text'] = t('This is my awesome login form');
  //$variables['rendered'] = drupal_render($variables['form']);
  //$variables['username'] = drupal_render($variables['form']['name']);
  //$variables['password'] = drupal_render($variables['form']['pass']);
}

function printmarket_preprocess_user_login_block(&$variables) {
  $form = $variables['form'];
  unset($form['links']);
  $variables['rendered'] = drupal_render($form);
}


function printmarket_preprocess_user_register(&$variables) {
  $variables['intro_text'] = t('This is my super awesome reg form');
  $variables['rendered'] = drupal_render($variables['form']);
}

function printmarket_preprocess_user_pass(&$variables) {
  $variables['intro_text'] = t('This is my super awesome insane password form');
  $variables['rendered'] = drupal_render($variables['form']);
} 

/**
 * Override or insert PHPTemplate variables into the templates.
 */
function phptemplate_preprocess_page(&$vars) {
  $vars['tabs2'] = menu_secondary_local_tasks();

  // Hook into color.module
  if (module_exists('color')) {
    _color_page_alter($vars);
  }
}

/**
 * Add a "Comments" heading above comments except on forum pages.
 */
function printmarket_preprocess_comment_wrapper(&$vars) {
  if ($vars['content'] && $vars['node']->type != 'forum') {
    $vars['content'] = '<h2 class="comments">'. t('Comments') .'</h2>'.  $vars['content'];
  }
}

/**
 * Returns the rendered local tasks. The default implementation renders
 * them as tabs. Overridden to split the secondary tasks.
 *
 * @ingroup themeable
 */
function phptemplate_menu_local_tasks() {
  return menu_primary_local_tasks();
}

/**
 * Returns the themed submitted-by string for the comment.
 */
function phptemplate_comment_submitted($comment) {
  return t('!datetime — !username',
    array(
      '!username' => theme('username', $comment),
      '!datetime' => format_date($comment->timestamp)
    ));
}

/**
 * Returns the themed submitted-by string for the node.
 */
function phptemplate_node_submitted($node) {
  return t('!datetime — !username',
    array(
      '!username' => theme('username', $node),
      '!datetime' => format_date($node->created),
    ));
}

/**
 * Generates IE CSS links for LTR and RTL languages.
 */
function phptemplate_get_ie_styles() {
  global $language;

  $iecss = '<link type="text/css" rel="stylesheet" media="all" href="'. base_path() . path_to_theme() .'/fix-ie.css" />';
  if ($language->direction == LANGUAGE_RTL) {
    $iecss .= '<style type="text/css" media="all">@import "'. base_path() . path_to_theme() .'/fix-ie-rtl.css";</style>';
  }

  return $iecss;
}

function printmarket_addthis_button() {
  if (variable_get('addthis_dropdown_disabled', '0')) {
    return ( sprintf('
      <a href="http://www.addthis.com/bookmark.php"
        onclick="addthis_url   = location.href; addthis_title = document.title; return addthis_click(this);">
      <img src="%s" width="%d" height="%d" %s /></a>
      ',
      $_SERVER['HTTPS'] == 'on' ? addslashes(variable_get('addthis_image_secure', 'https://secure.addthis.com/button1-share.gif')) : addslashes(variable_get('addthis_image', 'http://s9.addthis.com/button1-share.gif')),
      addslashes(variable_get('addthis_image_width', '125')),
      addslashes(variable_get('addthis_image_height', '16')),
      addslashes(variable_get('addthis_image_attributes', 'alt=""'))
    ));
  }
  else { //customized code to display big add this buttons via text decoration
    //$options=explode(',',variable_get('addthis_options','facebook,pinterest1,twitter,youtube'));
        $html .= '<td><a class="addthis_button_facebook" target="_blank" href="http://www.facebook.com/MyPrintMarket"><img src="'.base_path().path_to_theme().'/images/socialme/facebook.jpg" height="32" width="27" alt="facebook"/></a></td>';    
        $html .= '<td><a class="addthis_button_pinterest1" target="_blank" href="http://pinterest.com/myprintmarket/"><img src="'.base_path().path_to_theme().'/images/socialme/pinterest1.jpg" height="32" width="23" alt="pinterest1"/></a></td>';    
        $html .= '<td><a class="addthis_button_twitter" target="_blank" href="https://twitter.com/#!/myprintmarket"><img src="'.base_path().path_to_theme().'/images/socialme/twitter.jpg" height="32" width="22" alt="twitter"/></a></td>';    
        $html .= '<td><a class="addthis_button_youtube" target="_blank" href="youtube"><img src="'.base_path().path_to_theme().'/images/socialme/youtube.jpg" height="32" width="25" alt="youtube"/></a></td>';    
    return (sprintf('
<!-- AddThis Button BEGIN -->
<div class="addthis_toolbox">
<div class="custom_images">
%s
</div>
</div>

<!-- AddThis Button END -->
    ',
   $html
    ));
  } // end custom code
}

function printmarket_preprocess_node(&$vars) {
  unset($vars['node']->links['blog_usernames_blog']);  
  // update the themed links
  $vars['links'] = theme_links($vars['node']->links, array('class' => 'links inline'));
}
