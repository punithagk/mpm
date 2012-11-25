<?php

/**
 * @file
 * Poll callback handler for chatblock.
 *
 * Serves as a callback handler for uncritical chatblock
 * operations. Reduces server load as it catches most
 * JS initiated requests and only bootstraps Drupal as
 * far as really necessary.
 */

/**
 * Some pre-checks. No service unless passed!
 */
if (
  @$_POST['maxId'] === NULL
  ||
  @$_POST['mp'] === NULL
  ||
  @$_POST['cid'] === NULL
  ||
  @$_POST['session'] === NULL
  ||
  $_POST['maxId'] < 0
  ||
  (int) $_POST['maxId'] != $_POST['maxId']
  ||

  // Overflow protection.

  // Bigint unsigned would never exceed this size.
  strlen($_POST['maxId']) > 20

  ||
  strlen($_POST['mp']) > 256
  ||
  strlen($_POST['cid']) > 256

  // Session name is alwas 36 byte in D6 (md5 + "SESS").
  ||
  strlen($_POST['session']) != 36
) {
  exit;
}

$_chatblock_cache_path = 'sites/' . $_POST['mp'] . '/modules/chatblock/cache';

if (is_dir($_chatblock_cache_path)) {
  $client_max_id = (int) $_POST['maxId'];
  require_once($_chatblock_cache_path . '/apc.inc');

  define('CHATBLOCK_CACHE_ID', preg_replace('/[^a-zA-Z0-9]/', '', $_POST['cid']));

  $server_max_id = chatblock_cache_get('max_id', TRUE);

  if ($server_max_id !== FALSE && $server_max_id > $client_max_id) {
    // The client is not up-to-date.

    if (chatblock_cache_get('mc_last_built')) {
      // Check if user is authenticated (valid token can only exist if user
      // has recently successfully authenticated vs. Drupal).
      if (
        @$_POST['token'] != ''
        &&
        @$_POST['tokentime'] != ''
        &&
        intval(@$_POST['tokentime']) > time() - CHATBLOCK_CACHE_TOKEN_TTL
      ) {

        // Check for server token.
        $server_token = chatblock_cache_get('servertoken');

        // Validate client token cs. server token.
        if ($server_token !== FALSE) {
          $client_token = md5($_COOKIE[$_POST['session']] + $server_token);
          if ($client_token == $_POST['token']) {
            $authenticated = TRUE;
          }
          else {
            // Server token times out regularly. As client can not know, when,
            // the challenge "how old is your token" is an additional barrier.
            // Revalidation will only happen if this test is passed.
            $server_tokentime = chatblock_cache_get('servertokentime');
            if (
              $server_tokentime === FALSE
              ||
              $server_tokentime > intval(abs($_POST['tokentime']))
            ) {
              // Server token seems to have timed out. Revalidation is needed.
              // Indicate that we need a new one (by unsetting) and use Drupal.
              unset($_POST['token']);
              $use_drupal = TRUE;
            }
            else {
              // Remember that we tell the client he is not welcome.
              // At least those who do not manipulate our script will accept.
              $not_welcome = TRUE;
            }
          }
        }
        else {
          // Server token seems to have timed out. Revalidation is needed.
          // Indicate that we need a new one (by unsetting) and use Drupal.
          unset($_POST['token']);
          $use_drupal = TRUE;
        }

        if ($authenticated) {
          // If there are cached messages.
          chatblock_callback_process_cache($client_max_id);
        }
      }
    }
    else {
      // No RAM cache available. Use Drupal instead.
      $use_drupal = TRUE;
    }
  }

  // We will only get here unless the above was run successfully
  // as it directly prints the json result and exits on success.
  if ($server_max_id === FALSE || @$use_drupal) {
    // The client is not up-to-date or no cache is available.
    // Prepare to run Drupal.
    $_POST['q'] = $_GET['q'] = 'js/chatblock/view';

    if (file_exists('./js.php')) {
      // Try with JS callback handler first.
      require_once './js.php';
    }
    else {
      // Start Drupal the standard way.
      require_once './index.php';
    }
  }
  else {
    // No further action is necessary. Send back an empty json object
    // to prevent client errors.
    header('Content-type: text/javascript');
    print @$not_welcome ? '{}' : '{"ok":true}';
  }
}

/**
 * Read RAM cache and, on success, print results directly to the client.
 *
 * @param $max_id
 *   Client's last received message ID.
 */
function chatblock_callback_process_cache($max_id) {
  // Never start from below the oldest cached message.
  $min_id = (int) chatblock_cache_get('min_id');
  // But also not from lower than one after the client's max.
  $start = max($min_id, $max_id + 1);
  $last = (int) chatblock_cache_get('max_id');
  if ($last < $start) {
    // This may happen if, whysoever, max_id is NULL.
    // (Which, of course, must never happen.)
    $last = $start;
  }
  if ($start > 0) {
    $cache_success = TRUE;
    $messages_cached = array();
    for ($i = $start; $i <= $last; $i++) {
      $row = chatblock_cache_get('msg_' . $i);
      if ($row !== FALSE) {
        $messages_cached[] = $row;

        // Remember latest timestamp.
        if ($i == $last) {
          $lastTimestamp = $row->t;
        }
      }
      elseif (!empty($messages_cached)) {
        // If a message is not in the cache while within the
        // current id limits, this would indicate a cache problem
        // and the need to force a rebuild.
        $cache_success = FALSE;
        break;
      }
      else {
        // min_id cannot be smaller than the next higher id.
        // May happen by ttl timeout of messages.
        $new_start = $i+1;
      }
    }
  }
  if (isset($new_start) && $new_start > $min_id) {
    chatblock_cache_set('min_id', $new_start);
  }
  if ($cache_success) {
    $result = array(
      'maxId'    => $last,
      'lastTimestamp' => $lastTimestamp,
      'messages' => $messages_cached,
      'ok' => TRUE,
    );
    header('Content-type: text/javascript');
    print chatblock_to_js($result);
    exit;
  }
}

/**
 * Clones drupal_to_js from common.inc.
 *
 * D6 relies on PHP4 which we don't want to break here.
 * Also, even PHP provides json_encode() not before 5.2.0.
 *
 * @param $var
 *   The data to encode.
 *
 * @return string
 *   A json string representation of $var.
 *
 * @todo Replace with json_encode in a Drupal version that requires PHP >= 5.2
 */
function chatblock_to_js($var) {
  switch (gettype($var)) {
    case 'boolean':
      // Lowercase necessary!
      return $var ? 'true' : 'false';
    case 'integer':
    case 'double':
      return $var;
    case 'resource':
    case 'string':
      return '"' . str_replace(
        array("\r", "\n", "<", ">", "&"),
        array('\r', '\n', '\x3c', '\x3e', '\x26'),
        addslashes($var)
      ) . '"';
    case 'array':
      // Arrays in JSON can't be associative. If the array is empty or if it
      // has sequential whole number keys starting with 0, it's not associative
      // so we can go ahead and convert it as an array.
      if (empty ($var) || array_keys($var) === range(0, sizeof($var) - 1)) {
        $output = array();
        foreach ($var as $v) {
          $output[] = chatblock_to_js($v);
        }
        return '[ '. implode(', ', $output) .' ]';
      }
      // Otherwise, fall through to convert the array as an object.
    case 'object':
      $output = array();
      foreach ($var as $k => $v) {
        $output[] = chatblock_to_js(strval($k)) .': '. chatblock_to_js($v);
      }
      return '{ '. implode(', ', $output) .' }';
    default:
      return 'null';
  }
}
