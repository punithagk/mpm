<?php
 if($block->region == 'preface_first' || $block->region  == 'preface_middle' || $block->region  == 'preface_last') :
?>
<div class="col4 homepage-text-box-fixed unknown-box">
<div class="box rounded-corners-5 video-text-box">
<?php  endif;?>
<div id="block-<?php print $block->module .'-'. $block->delta; ?>" class="clear-block block block-<?php print $block->module ?>">

<?php if (!empty($block->subject)): ?>
  <h2><?php print $block->subject ?></h2>
<?php endif;?>

  <div class="content"><?php print $block->content ?></div>
</div>
<?php
 if($block->region == 'preface_first' || $block->region  == 'preface_middle' || $block->region  == 'preface_last') :
?>
</div>
</div>
<?php  endif;?>
