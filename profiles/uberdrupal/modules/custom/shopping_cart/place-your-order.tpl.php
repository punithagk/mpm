<style type="text/css">
.price-prefixes {
 display:none;
}
.uc-price-cost {
 text-decoration:line-through
}
.product, .uc-price-product {
display:inline;
}
.uc-price-display {
width:55px;
}

<?php
$browser = get_browser(null, true);
if (strpos($browser,'Chrome') !== false) {
?>
	.mpm-price-display  spam{
		margin-top: -20px;
	}
	
<?php	
}
?>

</style>

<h4>Place Your Order:</h4>
<?php echo $form; ?>
	<div class="node" id="node-<?php echo $nid?>">
		
		<div id="priceandadd">
			<div id="priceaddleft">
				<h4 id="price">
					Your Low Price:
						<span class="product-info product cost"><span class="uc-price-product uc-price-cost uc-price"><?php echo $cost_price?></span></span>
						<span class="mpm-price-display uc-price-product uc-price-display uc-price">
							<?php echo $sell_price?>
						</span>
				</h4>		
			</div>						
		</div>
		
	</div>
