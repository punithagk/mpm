<?php
/**
 * @file Helper functions and classes for better packing.
 *
 * Usage:
 * 
 *   module_load_include('packing.inc', 'freightquote');
 *
 *   if ($items = uc_cart_get_contents()) {
 *     try {
 *       $packing = new FreightQuotePacking($items);
 *       $pallets = $packing->package();
 *     }
 *     catch (Exception $e) {
 *       drupal_set_message($e->getMessage(), 'error');
 *     }
 *   }
 */

class FreightQuoteException extends Exception {
  private $debug;
  public function __construct ($message, $debug = NULL) {
    if (!empty($debug)) {
      $this->debug = $debug;
    }
    parent::__construct($message);
  }
  public function getDebug() {
    return $this->debug;
  }
}

/**
 * Helper class to repackaging the cart items before requesting for shipping quote.
 */
class FreightQuotePacking {
  var $items_queue = array();
  var $items_done  = array();
  var $pallets_results = array();
  var $pallets_available = array(
    array('length' => 120, 'width' => 120, 'type' => 'Pallets_120x120'),
    array('length' => 120, 'width' => 100, 'type' => 'Pallets_120x100'),
    array('length' => 120, 'width' =>  80, 'type' => 'Pallets_120x80'),
    array('length' =>  48, 'width' =>  48, 'type' => 'Pallets_48x48'),
    array('length' =>  60, 'width' =>  48, 'type' => 'Pallets_60x48'),
  );

  /**
   * Constructor.
   */
  public function __construct($items = array()) {
    foreach ($items as $item) {
      if ($node = node_load($item->nid)) {
        if (FALSE !== $this->isItemGood($node)) {
          if ($node = $this->convertProductUnits($node)) {
            for ($i = 0; $i < $item->qty; ++$i) {
              $this->items_queue["{$item->nid}_{$i}"] = $node;
            }
          }
          else {
            throw new Exception("Product <strong>{$node->title}</strong> has invalid dimension.");
          }
        }
        else {
          throw new Exception("Invalid product: {$node->title}");
        }
      }
    }
  }

  /**
   * Check is an item a good product node, has enough fields: length, weight, ...
   * @param nodeObject $node
   * @return bool.
   */
  private function isItemGood($node) {
    if ($item->type === 'product') {
      $checks = array('height', 'width', 'weight', 'length', 'weight_units', 'length_units');
      foreach ($checks as $check) {
        if (!isset($node->{$check})) {
          return FALSE;
        }
      }
    }

    // 60” height is the max on a pallette
    if ($node->height > 60) {
      throw new Exception('Max height on a pallette is 60”.');
    }

    // 4,000 lbs is maximum weight on a pallette
    if ($node->weight > 4000) {
      $message  = 'Max weight on a pallette is 4,000 lbs. ';
      $message .= l($node->title, "node/{$node->nid}") . ' is ' . uc_weight_format($node->weight, 'lb');
      throw new Exception($message);
    }

    return TRUE;
  }

  /**
   * Convert to same units so we can compare to values.
   * @param node $node
   * @return node
   */
  private function convertProductUnits($node) {
    $length_ratio = uc_length_conversion($node->length_units, 'in');
    $weight_ratio = uc_weight_conversion($node->weight_units, 'lb');
    $node->length *= $length_ratio;
    $node->height *= $length_ratio;
    $node->width  *= $length_ratio;
    $node->weight *= $weight_ratio;
    return $node;
  }

  /**
   * Main method to re-packing the items.
   */
  public function package() {
    if (count($this->items_queue) > 0) {
      $this->_package();
    }
    $counter = count($this->pallets_results);
    if ($counter <= 6) {
      return $this->pallets_results;
    }
    throw new FreightQuoteException('Max pallets number is 6, but we need ' . $counter, $this->pallets_results);
  }

  /**
   * Recursive function to packaging the items.
   */
  private function _package($try = 0) {
    if ($try <= 100) {
      if (count($this->items_done) < count($this->items_queue)) { # there are still items in queue.
        if ($item_id = $this->findLongestItemId()) { # found longest item
          if ($this->pallets_results[$item_id] = $this->findBestPallet($item_id)) {
            if ($this->fillPallet($item_id)) {
              return $this->_package(++$try);
            }
          }
          else {
            $item = $this->items_queue[$item_id];
            $message = 'There is not pallet available for %s (%dx%d). Max pallet is (inch): 120x120';
            $message = sprintf($message, $item->title, $item->length, $item->width);
            throw new FreightQuoteException($message, $item);
          }
        }
      }
    }
  }

  /**
   * Find longest item.
   * @return int
   */
  private function findLongestItemId() {
    $longest = $longest_item_id = 0;
    foreach ($this->items_queue as $item_id => $item) {
      if (!isset($this->items_done[$item_id])) {
        if ($item->length > $longest) {
          $longest = $item->length;
          $longest_item_id = $item_id;
        }
      }
    }
    return $longest_item_id;
  }

  /**
   * Find best pallet for a product.
   * @param int $item_id Product item ID.
   * @return array or FALSE.
   */
  private function findBestPallet($item_id) {
    $best_pallet = FALSE;
    $item_length = $this->items_queue[$item_id]->length;
    foreach ($this->pallets_available as $pallet) {
      if ($pallet['length'] >= $item_length) {
        if (FALSE === $best_pallet || ($pallet['length'] <= $best_pallet['length'])) {
          $best_pallet = $pallet;
        }
      }
    }
    if (!empty($best_pallet)) {
      $best_pallet = array_merge($best_pallet, array(
        'free_length' => $best_pallet['length'],
        'free_width'  => $best_pallet['width'],
        'free_height' => 60,
        'free_weight' => 4000,
        'items'       => array(),
      ));
      return (object)$best_pallet;
    }
    return FALSE;
  }

  /**
   * Fill the pallet.
   * @param int $item_id First item ID.
   */
  private function fillPallet($item_id) {
    $pallet_id = $item_id;
    $this->putItemToPallet($pallet_id, $item_id);
    foreach ($this->items_queue as $sub_item_id => $item) {
      if (!$this->isPalletFull($item_id)) {
        if (!isset($this->items_done[$item->nid])) {
          if ($this->isPalletAvailableForAnItem($pallet_id, $sub_item_id)) {
            if ($this->putItemToPallet($pallet_id, $sub_item_id)) {
              continue;
            }
          }
        }
      }
    }
    return TRUE;
  }

  /**
   * Put an item to the package.
   * @param int $pallet_nid
   * @param int $item_nid.
   */
  private function putItemToPallet($pallet_nid, $item_nid) {
    $this->items_done[$item_nid] = TRUE;
    if (isset($this->pallets_results[$pallet_nid])) {
      $pallet = &$this->pallets_results[$pallet_nid];
      $item   = &$this->items_queue[$item_nid];

      $pallet->free_length -= $item->length;
      $pallet->free_width  -= $item->width;
      $pallet->free_weight -= $item->weight;
      $pallet->free_height -= $item->height;
      $pallet->items[$item_nid] = $item;

      return TRUE;
    }

    return FALSE;
  }

  /**
   * Method to check is the pallet fulled.
   * @param int $pallet_nid ID of pallet.
   * @return boolean
   */
  private function isPalletFull($pallet_nid) {
    $pallet = &$this->pallets_results[$pallet_nid];
    if ($pallet->free_length <= 0 || $pallet->free_width <= 0 || $pallet->free_weight <= 0) {
      return TRUE;
    }
    return FALSE;
  }

  /**
   * Check is a pallet still available to put an item or not.
   */
  private function isPalletAvailableForAnItem($pallet_id, $item_id) {
    if (isset($this->pallets_results[$pallet_id])) {
      $pallet = &$this->pallets_results[$pallet_id];
      $item   = &$this->items_queue[$item_id];
      
      if ($pallet->free_length >= $item->length) {
        if ($pallet->free_width >= $item->width) {
          if ($pallet->free_weight >= $item->weight) {
            if ($pallet->free_height >= $item->height) {
              return TRUE;
            }
          }
        }
      }
    }
    return FALSE;
  }
}

class FreightQuoteHelper {
  public static function palletDim($pallet, $k) {
    $sum = 0;
    foreach ($pallet->items as $item) $sum += $item->{$k};
    return $sum;
  }
  public static function palletLength($pallet) { return self::palletDim($pallet, 'length'); }
  public static function palletHeight($pallet) { return self::palletDim($pallet, 'height'); }
  public static function palletWidth($pallet)  { return self::palletDim($pallet, 'width');  }
  public static function palletWeight($pallet) { return self::palletDim($pallet, 'weight'); }
  public static function palletDescription($pallet) {
    foreach ($pallet->items as $item) $items[] = $item->nid;
    return sprintf('Items: ', implode(', ', $items));
  }
  public static function palletClass($pallet) {
    foreach ($pallet->items as $item)
      if (isset($item->freightquote))
        if (isset($item->freightquote['class']))
          return (int)$item->freightquote['class'];
  }
  public static function palletCommodityType($pallet) {
    foreach ($pallet->items as $item)
      if (isset($item->freightquote))
        if (isset($item->freightquote['commodity_type']))
          return $item->freightquote['commodity_type'];
  }
  public static function palletContentType($pallet) {
    foreach ($pallet->items as $item)
      if (isset($item->freightquote))
        if (isset($item->freightquote['content_type']))
          return $item->freightquote['content_type'];
  }
  public static function palletPieceCount($pallet) {
    return count($pallet->items);
  }
}

function uc_uc_freightquote_better_quote($origin, $destination, $products) {
  try {
    $packing = new FreightQuotePacking($products);
    $pallets = $packing->package();
    return _uc_uc_freightquote_better_quote($origin, $destination, $pallets);
  }
  catch (FreightQuoteException $e) {
    $message = $e->getMessage();
    if (user_access('administer store')) {
      $message .= '<div>Debug:<textarea style="width: 95%; height: 200px;">' . print_r($e->getDebug(), TRUE) . '</textarea></div>';
    }
    return array(array(
      'option_label' => t('Error'),
      'notes' => $message,
    ));
  }
}

function _uc_uc_freightquote_better_quote($origin, $destination, $pallets) {
  module_load_include('inc', 'freightquote');
  $Origin = __freighquote_location_origin($origin);
  $Destination = __freighquote_location_destination($destination);

  $params['request'] = array(
    'CustomerId' => 0,
    'QuoteType' => 'B2B',
    'ServiceType' => 'LTL',
    'QuoteShipment' => array(
      'IsBlind' => FALSE,
      'HazardousMaterialContactName' => 'HazardousMaterialContactName',
      'HazardousMaterialContactPhone' => '555-555-5555',
      'PickupDate' => __uc_uc_freightquote_pickup_date(),
      'SortAndSegregate' => FALSE,
      'UseStackableFlag' => FALSE,
      'ShipmentLocations' => array('Location' => array($Origin, $Destination)),
      'ShipmentProducts' => array('Product' => __uc_uc_freightquote_pallets($pallets)),
      'ShipmentContacts' => array('ContactAddress' => array()),
     ),
    'BillCollect' => 'NONE',
  );

  $params['user'] = array(
    'Name' => variable_get('uc_uc_freightquote_username', 'xmltest@freightquote.com'),
    'Password' => variable_get('uc_uc_freightquote_password', 'xml')
  );

  $options = array();
  $options['proxy_host'] = variable_get('uc_uc_freightquote_proxy_host', NULL);
  $options['proxy_port'] = variable_get('uc_uc_freightquote_proxy_port', NULL);
  $client = new SoapClient(FREIGHTQUOTE_SERVICE_URL . '?wsdl', $options);
  $response = $client->__soapCall('GetRatingEngineQuote', array($params));

  if (isset($response->GetRatingEngineQuoteResult)) {
    $response = $response->GetRatingEngineQuoteResult;

    if (isset($response->QuoteCarrierOptions->CarrierOption)) {
      $quotes       = array();
      $quote_id     = $response->QuoteId;
      $lowest_id    = 0;
      $lowest_value = 0;
      foreach (__uc_uc_freightquote_array($response->QuoteCarrierOptions->CarrierOption) as $i => $option) {
        $amount = $option->QuoteAmount;
        $accessorials = array();
        if (!empty($option->CarrierAccessorials)) {
          foreach ($option->CarrierAccessorials as $accessorial) {
            $amount += $accessorial->AccessorialCharge;
            $accessorials[] = t(
              'Accessorial: %description (%amount)',
              array(
                '%description' => $accessorial->AccessorialDescription,
                '%amount' => '$' . $accessorial->AccessorialCharge)
            );
          }
        }

        if (!$lowest_value || ($amount < $lowest_value)) {
          $lowest_id = $i;
          $lowest_value = $amount;

          $option_id = $option->CarrierOptionId;
          $id = "{$quote_id}-{$option_id}";
          # $option_label  = $option->CarrierName;
          $option_label  = t('Freightquote');
          if (!empty($option->IsGuaranteed)) {
            $accessorials[] = t('Guaranteed: Yes');
          }
          if (!empty($accessorials)) {
            $note = sprintf('<div class="description">%s</div>', theme('item_list', $accessorials));
          }
          $quote = array(
            'option_label' => $option_label,
            'rate' => uc_uc_freightquote_markup($amount),
            'note' => !empty($note) ? $note : '',
          );
        }
      }

      $_SESSION['uc_uc_freightquote_carier_options'] = array($quote);

      return array($quote);
    }

    if (isset($response->ValidationErrors->B2BError)) {
      foreach (__uc_uc_freightquote_array($response->ValidationErrors->B2BError) as $error) {
        $notes[] = "{$error->ErrorType}: {$error->ErrorMessage}";
      }

      $quote = array(
        'option_label' => t('FreightQuote Error'),
        'notes' => theme('item_list', $notes),
      );

      return array($quote);
    }
  }

  return FALSE;
}

function __uc_uc_freightquote_pallets($pallets) {
  $Products = array();
  foreach ($pallets as $i => $pallet) {
    $Products[] = array(
      'Class'               => FreightQuoteHelper::palletClass($pallet),
      'Weight'              => FreightQuoteHelper::palletWeight($pallet),
      'Length'              => FreightQuoteHelper::palletLength($pallet),
      'Width'               => FreightQuoteHelper::palletWidth($pallet),
      'Height'              => FreightQuoteHelper::palletHeight($pallet),
      'ProductDescription'  => FreightQuoteHelper::palletDescription($pallet),
      'PackageType'         => $pallet->type,
      'IsStackable'         => TRUE,
      'DeclaredValue'       => 0.0,
      'CommodityType'       => FreightQuoteHelper::palletCommodityType($pallet),
      'ContentType'         => FreightQuoteHelper::palletContentType($pallet),
      'IsHazardousMaterial' => FALSE,
      'DimWeight'           => 0,
      'EstimatedWeight'     => FreightQuoteHelper::palletWeight($pallet),
      'PieceCount'          => FreightQuoteHelper::palletPieceCount($pallet),
      'ItemNumber'          => $i,
      'STC'                 => 0);
  }

  return $Products;
}
