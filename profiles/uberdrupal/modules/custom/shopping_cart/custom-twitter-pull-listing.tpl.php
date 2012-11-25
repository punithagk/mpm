<?php
// $Id: twitter-pull-listing.tpl.php,v 1.1.2.5 2011/01/11 02:49:38 inadarei Exp $

/**
 * @file
 * Theme template for a list of tweets.
 *
 * Available variables in the theme include:
 *
 * 1) An array of $tweets, where each tweet object has:
 *   $tweet->id
 *   $tweet->username
 *   $tweet->userphoto
 *   $tweet->text
 *   $tweet->timestamp
 *
 * 2) $twitkey string containing initial keyword.
 *
 * 3) $title
 *
 */
 
 global $base_path;
$image_icons = drupal_get_path("module", 'shopping_cart');
?>


<?php

drupal_add_css('profiles/uberdrupal/themes/printmarket/css/widget.css');

?>

<div id="twitter">
<div id="heading"><img src="<?php echo $base_path.$image_icons ?>/images/twitter-bird.jpg"><br>
<?php if (!empty($title)): ?>
    <?php print $title; ?>
  <?php endif; ?></div>
<div id="twtr-widget-1" class="twtr-widget twtr-widget-profile">
 <div style="width: 405px;" class="twtr-doc">
 <?php if (is_array($tweets)): ?>
    <?php $tweet_count = count($tweets); ?>
    
    <ul class="tweets-pulled-listing">
    <?php foreach ($tweets as $tweet_key => $tweet): ?>
      <li>
        <span class="tweet-author"><?php print l($tweet->username, 'http://twitter.com/' . $tweet->username); ?></span>
        <span class="tweet-text"><?php print twitter_pull_add_links($tweet->text); ?></span>
        <div class="tweet-time"><?php print l($tweet->time_ago, 'http://twitter.com/' . $tweet->username . '/status/' . $tweet->id);?></div>

        <?php if ($tweet_key < $tweet_count - 1): ?>
          <div class="tweet-divider"></div>
        <?php endif; ?>
        
      </li>
    <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</div></div>
<div id="footing"><a target="_blank" href="http://twitter.com/#!/MyPrintMarket">Follow Us On Twitter @MyPrintMarket</a></div>
</div>

