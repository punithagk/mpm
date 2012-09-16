<?php include 'page.header.inc'; ?>
	
<!--<div id="pageheading">--><?php //if ($title): print  $title ; endif; ?><!--</div>-->
<div id="pagecontent">
<div>
        <?php if($slider) : ?>
                <div id="productslideshow">
                        <?php echo $slider;?>
                </div>
        	<div style="height: 40px; display: block;">&nbsp;</div>
                <br>
                <br>
        <?php endif; ?>
</div>

	<?php if ($show_messages && $messages): print $messages; endif; ?>
	<?php if ($product_body) : ?>
		<?php print $product_body ?>
	<?php endif; ?>
	<?php if ($product_sku) : ?>
		<div id="thumbnailImages" style="width: 1000px; height: 150px; margin: 15px 0px 15px 0px; display: block;">
			<?php print $product_sku ?>
		</div>
	<?php endif; ?>

	<?php if ($product_template ||	$product_attr || $newsletters || $twitterhome) : ?>
		<div id="purchase">
			<?php if ($product_template) : ?>
				<div id="left">	
					<?php print $product_template;?>
				</div>
			<?php endif; ?>
			<?php if ($product_attr	) : ?>
				<div id="right">	
					<?php print $product_attr;?>
				</div>
			<?php endif; ?>	
                        <?php if ($newsletters) : ?>
                                <div id="newsletters">
                                        <?php echo $newsletters?>
                                </div><!--<br> <br>-->
                        <?php endif; ?>
                        <?php if ($twitterhome) : ?>
                                <div id="twitterhome">
                                        <?php echo $twitterhome?>
                                </div><br> <br>
                        <?php endif; ?>
			
			<div class="clear"></div>
		</div>
	<?php endif; ?>
	<div id="mpmhomepage">
		<!--<div id="content" style="width: 1000px; display: inline-block;" >-->
		<div id="content" style="display: inline-block;" >
			<?php print $content ?>
		</div>
		<?php if ($rightsidder) : ?>			
				<div id="sidebar">
				<?php echo $rightsidder?>			
				</div>
		<?php endif; ?>	
	</div>
	<br>
	<br>
<?php include 'page.footer.inc'; ?>
	
</div>
