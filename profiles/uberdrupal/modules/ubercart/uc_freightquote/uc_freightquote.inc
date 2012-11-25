<?php
/**
 * @file Helper function for freightquote
 */

/**
 *
 * @param type $origin
 * @param type $destination
 * @param type $products
 * @return type 
 */
function uc_freightquote_quote($origin, $destination, $products) {
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
      'PickupDate' => __uc_freightquote_pickup_date(),
      'SortAndSegregate' => FALSE,
      'UseStackableFlag' => FALSE,
      'ShipmentLocations' => array('Location' => array($Origin, $Destination)),
      'ShipmentProducts' => array('Product' => __uc_freightquote_products($products)),
      'ShipmentContacts' => array('ContactAddress' => array()),
      ));

  $params['user'] = array(
    'Name' => variable_get('uc_freightquote_username', 'xmltest@freightquote.com'),
    'Password' => variable_get('uc_freightquote_password', 'xml')
  );

  $options = array();
  $options['proxy_host'] = variable_get('uc_freightquote_proxy_host', NULL);
  $options['proxy_port'] = variable_get('uc_freightquote_proxy_port', NULL);
  $client = new SoapClient(FREIGHTQUOTE_SERVICE_URL . '?wsdl', $options);
  $response = $client->__soapCall('GetRatingEngineQuote', array($params));

  if (isset($response->GetRatingEngineQuoteResult)) {
    $response = $response->GetRatingEngineQuoteResult;

    if (isset($response->QuoteCarrierOptions->CarrierOption)) {
      $quotes = array();
      $quote_id = $response->QuoteId;
      foreach (__uc_freightquote_array($response->QuoteCarrierOptions->CarrierOption) as $option) {
        $option_id = $option->CarrierOptionId;
        $id = "{$quote_id}-{$option_id}";
        $accessorials[] = $option->CarrierName;
        $option_label = strpos($option->CarrierName, 'Freightquote') === FALSE;
        $option_label = $option_label ? sprintf('Freightquote » %s', $option->CarrierName) : $option->CarrierName;
        $quotes[] = array(
          'option_label' => $option_label,
          'rate' => uc_freightquote_markup($option->QuoteAmount),
          'notes' => $option->IsGuaranteed ? 'Guaranteed: Yes' : '',
        );
      }

      $_SESSION['uc_freightquote_accessorials'] = $accessorials;

      return $quotes;
    }

    if (isset($response->ValidationErrors->B2BError)) {
      foreach (__uc_freightquote_array($response->ValidationErrors->B2BError) as $error) {
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

function __uc_freightquote_products($products) {
  $Products = array();
  foreach ($products as $product) {
    if ($product->nid && isset($product->freightquote)) {
      $freightquote = $product->freightquote;

      for ($i = 1; $i <= $product->qty; ++$i) {
        $Products[] = array(
          'Class' => (int)$freightquote['class'],
          'Weight' => $product->weight,
          'Length' => $product->length,
          'Width' => $product->width,
          'Height' => $product->height,
          'ProductDescription' => $product->title,
          'PackageType' => $freightquote['package_type'],
          'IsStackable' => TRUE,
          'DeclaredValue' => 0.0,
          'CommodityType' => $freightquote['commodity_type'],
          'ContentType' => $freightquote['content_type'],
          'IsHazardousMaterial' => FALSE,
          'DimWeight' => 0,
          'EstimatedWeight' => $product->weight,
          'PieceCount' => $product->pkg_qty,
          'ItemNumber' => $i,
          'STC' => 0);
      }
    }
  }

  return $Products;
}

/**
 * Helper function to get the pickup date.
 * 
 * @return string - Formatted date.
 */
function __uc_freightquote_pickup_date() {
  $pickupdate = uc_freightquote_get_next_working_day();
  $pickupdate = date('Y-m-d\TH:i:s', $pickupdate);
  return $pickupdate;
}

function __freighquote_location_destination($destination = NULL) {
  if (!empty($destination)) {
    $_SESSION['uc_freightquote_destination'] = $destination;
  }
  else {
    $destination = $_SESSION['uc_freightquote_destination'];
  }

  return array(
    'LocationType' => 'Destination',
    'RequiresArrivalNotification' => FALSE,
    'HasLoadingDock' => FALSE,
    'IsConstructionSite' => FALSE,
    'RequiresInsideDelivery' => FALSE,
    'IsTradeShow' => FALSE,
    'IsResidential' => FALSE,
    'RequiresLiftgate' => FALSE,
    'ContactName' => "{$destination['first_name']} {$destination['last_name']}",
    'ContactPhone' => $destination['phone'],
    'NotificationMethod' => 'None',
    'HasDeliveryAppointment' => FALSE,
    'IsLimitedAccess' => FALSE,
    'LocationAddress' => array(
      'StreetAddress' => $destination['street1'],
      'AdditionalAddress' => $destination['street2'],
      'City' => $destination['city'],
      'PostalCode' => $destination['postal_code'],
      'CountryCode' => 'US'),
    'AdditionalServices' => array());
}

function __freighquote_location_origin($origin) {
  return array(
    'LocationType' => 'Origin',
    'RequiresArrivalNotification' => FALSE,
    'HasLoadingDock' => FALSE,
    'IsConstructionSite' => FALSE,
    'RequiresInsideDelivery' => FALSE,
    'IsTradeShow' => FALSE,
    'IsResidential' => FALSE,
    'RequiresLiftgate' => FALSE,
    'ContactName' => "{$origin->first_name} {$origin->last_name}",
    'ContactPhone' => $origin->phone,
    'NotificationMethod' => 'None',
    'HasDeliveryAppointment' => FALSE,
    'IsLimitedAccess' => FALSE,
    'LocationAddress' => array(
      'AddressName' => $origin->company,
      'StreetAddress' => $origin->street1,
      'AdditionalAddress' => $origin->street2,
      'City' => $origin->city,
      'PostalCode' => $origin->postal_code,
      'CountryCode' => 'US'),
    'AdditionalServices' => array());
}

function __uc_freightquote_array($data) {
  if (!is_array($data)) {
    return array($data);
  }
  
  return $data;
}

/**
 * Helper function to get next workding day.
 */
function uc_freightquote_get_next_working_day($date = null) {
  $time = is_string($date) ? strtotime($date) : (is_int($date) ? $date : time());
  $y = date('Y', $time);
  // calculate federal holidays
  $holidays = array();
  // month/day (jan 1st). iteration/wday/month (3rd monday in january)

  $hdata[] = '1/1'; # newyr
  $hdata[] = '7/4'; # jul4
  $hdata[] = '11/11'; # vet
  $hdata[] = '12/25'; # xmas
  $hdata[] = '3/1/1'; # mlk
  $hdata[] = '3/1/2'; # pres
  $hdata[] = '5/1/5'; # memo
  $hdata[] = '1/1/9'; # labor
  $hdata[] = '2/1/10'; # col
  $hdata[] = '4/4/11'; # thanks
  foreach ($hdata as $h1) {
    $h = explode('/', $h1);
    if (sizeof($h)==2) { // by date
      $htime = mktime(0, 0, 0, $h[0], $h[1], $y); // time of holiday
      $w = date('w', $htime); // get weekday of holiday
      $htime += $w==0 ? 86400 : ($w==6 ? -86400 : 0); // if weekend, adjust
    }
    else { // by weekday
      $htime = mktime(0, 0, 0, $h[2], 1, $y); // get 1st day of month
      $w = date('w', $htime); // weekday of first day of month
      $d = 1+($h[1]-$w+7)%7; // get to the 1st weekday
      for ($t=$htime, $i=1; $i<=$h[0]; $i++, $d+=7) { // iterate to nth weekday
        $t = mktime(0, 0, 0, $h[2], $d, $y); // get next weekday
        if (date('n', $t)>$h[2]) break; // check that it's still in the same month
        $htime = $t; // valid
      }
    }
    $holidays[] = $htime; // save the holiday
  }

  for ($i = 0; $i < 5; $i++, $time += 86400) { // 5 days should be enough to get to workday
    if (in_array(date('w', $time), array(0, 6))) {
      continue; // skip weekends
    }

    foreach ($holidays as $h) { // iterate through holidays
      if ($time >= $h && $time < $h+86400) {
        continue 2; // skip holidays
      }
    }
    break; // found the workday
  }

  return $time;
}

/**
 * Modify the rate received from UPS before displaying to the customer.
 * @see uc_ups_markup().
 */
function uc_freightquote_markup($rate) {
  $markup = variable_get('uc_freightquote_markup', '0');
  $type = variable_get('uc_freightquote_markup_type', '%');
  if (is_numeric(trim($markup))) {
    switch ($type) {
      case '%':
        return $rate + $rate * floatval(trim($markup)) / 100;
      case 'x':
        return $rate * floatval(trim($markup));
      case '$':
        return $rate + floatval(trim($markup));
    }
  }
  return $rate;
}
