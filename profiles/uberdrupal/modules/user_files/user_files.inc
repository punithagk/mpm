<?php
/**
 * @file provides various internal functions for user_files module
*/

/**
 * Analyse image and determine number of colours, store to database, generate some thumbs
 * @param $image object as returned by imageapi_image_open
 * @param $file object std drupal file object
 * @return boolean success/false
*/
function user_files_prepare_image($image, $file) {
  //get image dimensions
  $w = $image->info['width'];
  $h = $image->info['height'];
  if (function_exists('imagecolorat') && $image->resource) {
    //iterate pixels
    $channels = range(0, (int)variable_get('user_files_distinct_colours', 12) - 1); //we split the color wheel into 12 colours
    $channels = array_map('is_object', $channels); //now our keys are 0-11 and our values are all FALSE
    for ($x = 1; $x <= $w; $x++) {
      for ($y = 1; $y <= $h; $y++) {
      //get pixel rgb
        $rgb = imagecolorat($image->resource, $x, $y);
      //convert to hsl
        list($hue, $s, $l) = user_files_rgb_to_hsl($image->resource, $rgb);
        if ($s < 0.125 || $l > 0.875 || $l < 0.125) {
          continue; //this color is so grey (s) or white (l) we ignore it
        }
      //determine channels
        $channels = user_files_hsl_channels($image->resource, $hue, $channels, $rgb, $x, $y, $file);
        
      //if four colours, break
        if (user_files_channel_count($channels) >= 4) {
          break 2;
        }
      }
    }
    $record = array(
      'fid' => $file->fid,
      'details' => serialize(array_merge((array)$file, $image->info,
        array('channels' => user_files_channel_count($channels),
              'channel_info' => $channels)))
    );
    drupal_write_record('user_files_image_info', $record);
    return $record;
  }
}


/**
 * Utility to return array of cmyk from rgb hex
 * @param $rgb string hex rgb code
 * @return array (c=>, m=>, y=>, k=>)
*/
function user_files_rgb_to_cmyk($rgb, $manual_convert = FALSE) {
  if ($manual_convert) {
    //convert rgb hex to numbers
    $r = base_convert(substr($rgb, 0, 2), 16, 10);
    $g = base_convert(substr($rgb, 2, 2), 16, 10);
    $b = base_convert(substr($rgb, 4, 2), 16, 10);
  }
  else {
    //convert rgb hex to numbers
    list($r, $g, $b) = user_files_rgb_to_values($rgb);
  }
  $cyan = 1 - ($r / 255);
  $magenta = 1 - ($g / 255);
  $yellow = 1 - ($b / 255);

  $min = min($cyan, $magenta, $yellow);
  
  if ($min == 1) {
    //is black
    return array(
      'c' => 0,
      'm' => 0,
      'y' => 0,
      'k' => 1
    );
  }

  $K = $min;
  $black = 1 - $K;

  return array (
    'c' => ($cyan - $K) / $black,
    'm' => ($magenta- $K) / $black,
    'y' => ($yellow - $K) / $black,
    'k' => $K
  );
}


/**
 * Utility to split rgb code into r, g and b channels
 * @param $rgb rgb value as returned by imagecolorat
 * @return array($red, $green, $blue)
*/
function user_files_rgb_to_values($image, $rgb) {
  return imagecolorsforindex($image, $rgb);
}

/**
 * Utility to convert rgb color to hsl degrees
 * we split colors into variable_get('user_files_distinct_colours', 12) spectrums from hsl model
 * @param $rgb hex value of rgb as returned by imagecolorat
 * @return array($h, $s, $l)
*/
function user_files_rgb_to_hsl($image, $rgb) {
  $vals = user_files_rgb_to_values($image, $rgb);
  list($r, $g, $b, $a) = array_values($vals);
  $r = $r / 255;
  $g = $g / 255;
  $b = $b / 255;
  $min = min($r, $g, $b);
  $max = max($r, $g, $b);
  $delta = $max - $min;

  $l = ($max + $min) / 2;

  if ($delta == 0) {
    $h = 0;
    $s = 0;
  }
  else {
    if ($l < 0.5) {
      $s = $delta / ($max + $min);
    }
    else {
      $s = $delta / (2 - $max - $min);
    }

    $delta_r = ((($max - $r) / 6) + ($delta / 2)) / $delta;
    $delta_g = ((($max - $g) / 6) + ($delta / 2)) / $delta;
    $delta_b = ((($max - $b) / 6) + ($delta / 2)) / $delta;

    if ($r == $max) {
      $h = $delta_b - $delta_g;
    }
    elseif ($g == $max) {
      $h = (1 / 3) + $delta_r - $delta_b;
    }
    elseif ($b == $max) {
      $h = (2 / 3) + $delta_g - $delta_r;
    }

    if ($h < 0) {
      $h += 1;
    }

    if ($h > 1) {
      $h -= 1;
    }
  }

  return array($h, $s, $l);
}

/**
 * Utility to return number of channels in cmyk color
 * @param $cmyk array of cmyk values
 * @param $channels flags as they stand
 * @param $rgb hex rgb value
 * @param $x int x value of pixel
 * @param $y int y value of pixel
 * @param $file object file object from files api
 * @return array of new channel flags
*/
function user_files_cmyk_channels($cmyk, $channels,
                                  $rgb, $x, $y, $file) {
  $new_channels = array();
  foreach($cmyk as $channel => $value) {
    $new_channels[$channel] = (($value > (float)variable_get('user_files_threshold', 0.005)) || $channels[$channel]);
    if ($value > (float)variable_get('user_files_threshold', 0.005) && !$channels[$channel] && variable_get('user_files_cmyk_debug', FALSE)) {
      //convert rgb hex to numbers
      list($r, $g, $b) = user_files_rgb_to_values($rgb);
      //this is the first pixel for this channel
      watchdog('user_files', 'First instance of !channel channel in file !file
               at pixel (!x,!y) where RGB is (!rgb) - value is !value', array(
                '!x' => $x,
                '!value' => $value,
                '!y' => $y,
                '!rgb' => implode(', ', array($r, $g, $b)),
                '!file' => $file->filename,
                '!channel' => $channel
               ));
  }
  }
  return $new_channels;
}

/**
 * Utility to return number of channels in cmyk color
 * @param $h int hue value of color
 * @param $channels flags as they stand
 * @param $rgb hex rgb value
 * @param $x int x value of pixel
 * @param $y int y value of pixel
 * @param $file object file object from files api
 * @return array of new channel flags
*/
function user_files_hsl_channels($image, $h, $channels,
                                  $rgb, $x, $y, $file) {
  //convert hue to a value between 0 and variable_get('user_files_distinct_colours', 12);
  $degrees = 360 * $h;
  //segment 0 goes from -15 to 15 so we add 15 (when it is 12)
  $correction = 360 / ((int)variable_get('user_files_distinct_colours', 12) * 2);
  $degrees += $correction;
  $channel = floor($degrees * (int)variable_get('user_files_distinct_colours', 12)/ 360) % 12;
  if (!$channels[$channel]) {
    $channels[$channel] = TRUE;
    if (variable_get('user_files_cmyk_debug', FALSE)) {
      //convert rgb hex to numbers
      list($r, $g, $b) = user_files_rgb_to_values($image, $rgb);
      //this is the first pixel for this channel
      watchdog('user_files', 'First instance of channel !channel in file !file
               at pixel (!x,!y) where RGB is (!rgb) - value is !value, hue is !hue.
               Color was <div style="width:10px;height:10px;background-color:rgb(!rgb)">&nbsp;</div>', array(
                '!x' => $x,
                '!value' => $value,
                '!y' => $y,
                '!hue' => round($h * 360, 3),
                '!rgb' => implode(', ', array($r, $g, $b)),
                '!file' => $file->filename,
                '!channel' => $channel
               ));
    }
  }
  return $channels;
}

/**
 * Utility to return number of set channel flags
 * @param $channels array
 * @return int
*/
function user_files_channel_count($channels) {
  $active_channels = 0;
  foreach($channels as $state) {
    if ($state) {
      $active_channels++;
    }
  }
  return $active_channels;
}

/**
 * Handle the ajax submit of a file upload
*/
function user_files_upload_ajax() {
  //do some ajax handling and add it to the cart
  $response = array('success' => TRUE);
  $form_state = array('storage' => NULL, 'submitted' => FALSE);
  $form_build_id = $_POST['form_build_id'];
  //get the form from the cache
  $form = form_get_cache($form_build_id, $form_state);
  if (!$form) {
    $response['general'][] = t('Could not retreive form from cache');
    $response['success'] = FALSE;
    echo json_encode($response);
    exit;
  }
  //standard ahah form manipulation
  $args = $form['#parameters'];
  $form_id = array_shift($args);//remove the form_id
  $form['#post'] = $_POST;
  $form['#redirect'] = FALSE;
  $form['#programmed'] = FALSE;
  $form_state['post'] = $_POST;
  $files = $_FILES;
  //process includes validate
  drupal_process_form($form_id, $form, $form_state);
  //get a new version of the form that takes into account our ahah submissions/form state
  $form = drupal_rebuild_form($form_id, $form_state, $args, $form_build_id);
  //we want the status messages from validation
  $messages = drupal_get_messages('error', FALSE);
  if (count($messages) && count($messages['error'])) {
    //we have errors!
    //clear the messages
    $clear = drupal_get_messages();
    $response['success'] = false;
    $response['errors'] = array();
    foreach($messages['error'] as $error) {
      $error = check_plain(strip_tags($error)); //strip tags etc
      if (strpos($error, '!!!') !== FALSE) {
        //specific error
        //we encode the error messages in format fieldname!!!message for json parsing
        $chunks = explode('!!!', $error);
        $field = $chunks[0];
        $message = $chunks[1];
        $response['errors'][$field] = $message;
        //also add a general error w/ assoc key to reduce duplicates
        $response['general'][$message] = $message;
      }
      else {
        //general error w/ assoc key to reduce dupes
        $response['general'][$error] = $error;
      }
    }
  }
  if (count($response['general'])) {
    //strip the assoc keys so json parses as array not obj
    $response['general'] = array_values($response['general']);
  }
  //we also want the resets for the field
  $response['resets']['form_build_id'] = $form['form_build_id']['#value'];
  $response['resets']['form_token'] = $form['form_token']['#value'];
  //and we want the details of the file if success
  if ($form['fid']) {
    $response['file_details']['fid'] = $form['fid']['#value'];
    $response['file_details']['filename'] = $form['filename']['#value'];
  }
  echo json_encode($response);
  exit;
}
