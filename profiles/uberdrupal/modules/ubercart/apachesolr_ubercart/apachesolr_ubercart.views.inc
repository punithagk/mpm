<?php
/**
 * Implementation of hook_views_data_alter()
 *
 * Exposes Ubercart fields and sorts to apachesolr views
 */
function apachesolr_ubercart_views_data_alter(&$data) {
  $data['apachesolr_node']['fs_uc_sell_price'] = array(
    'title' => t('Product Sell Price'),
    'help' => t('Product Sell Price'),
    'argument' => array(
      'handler' => 'apachesolr_views_handler_argument',
    ),
    'sort' => array(
      'handler' => 'apachesolr_views_handler_sort',
    ),
  );
  $data['apachesolr_node']['fs_uc_list_price'] = array(
    'title' => t('Product List Price'),
    'help' => t('Product List Price'),
    'argument' => array(
      'handler' => 'apachesolr_views_handler_argument',
    ),
    'sort' => array(
      'handler' => 'apachesolr_views_handler_sort',
    ),
  );
  $data['apachesolr_node']['ss_uc_sku'] = array(
    'title' => t('Product Model (SKU)'),
    'help' => t('Product Model'),
    'argument' => array(
      'handler' => 'apachesolr_views_handler_argument',
    ),
    'sort' => array(
      'handler' => 'apachesolr_views_handler_sort',
    ),
  );
  $data['apachesolr_node']['fs_uc_weight'] = array(
    'title' => t('Product Weight'),
    'help' => t('Product Weight'),
    'argument' => array(
      'handler' => 'apachesolr_views_handler_argument',
    ),
    'sort' => array(
      'handler' => 'apachesolr_views_handler_sort',
    ),
  );
  $data['apachesolr_node']['fs_uc_length'] = array(
    'title' => t('Product Length'),
    'help' => t('Product Length'),
    'argument' => array(
      'handler' => 'apachesolr_views_handler_argument',
    ),
    'sort' => array(
      'handler' => 'apachesolr_views_handler_sort',
    ),
  );
  $data['apachesolr_node']['fs_uc_width'] = array(
    'title' => t('Product Width'),
    'help' => t('Product Width'),
    'argument' => array(
      'handler' => 'apachesolr_views_handler_argument',
    ),
    'sort' => array(
      'handler' => 'apachesolr_views_handler_sort',
    ),
  );
  $data['apachesolr_node']['fs_uc_height'] = array(
    'title' => t('Product Height'),
    'help' => t('Product Height'),
    'argument' => array(
      'handler' => 'apachesolr_views_handler_argument',
    ),
    'sort' => array(
      'handler' => 'apachesolr_views_handler_sort',
    ),
  );
  $data['apachesolr_node']['fs_uc_position'] = array(
    'title' => t('Product List Position'),
    'help' => t('Product List Position'),
    'argument' => array(
      'handler' => 'apachesolr_views_handler_argument',
    ),
    'sort' => array(
      'handler' => 'apachesolr_views_handler_sort',
    ),
  );
}
