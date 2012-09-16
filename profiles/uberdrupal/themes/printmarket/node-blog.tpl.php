<?php
?>
<div id="node-<?php print $node->nid; ?>" class="node<?php if ($sticky) { print ' sticky'; } ?><?php if (!$status) { print ' node-unpublished'; } ?>">
<div class="blogpost" style="width:<?php if(drupal_is_front_page()) {echo '525px';} else { echo '750px';}?>">
	<?php if ($page == 0): ?>
		<a href="<?php print $node_url ?>" title="<?php print $title ?>"><?php print $title ?></a><br/>
	<?php endif; ?>
	 <div class="content clear-block">
		<?php print $content ?>
	</div>
	<?php if ($links): ?>
      <div class="links"><?php print $links; ?></div>
	  <div class="clear"></div>
    <?php endif; ?>
</div>

</div>

