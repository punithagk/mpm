<?php 
global $base_url;
$checkout_items = uc_cart_get_contents();
?>
<br>
Nothing to upload? Skip to
<a class="cartoptionbtn"  href="<?php echo $base_url."/cart/checkout";?>">Shipping &amp; Billing</a><br><br>
<div id="cart">
					<table width="100%">
						<tbody><tr id="cartheading">
							<td width="250px" align="left" style="margin-right: 25px;">
								Product:</td>
							<td width="375px" align="left" style="margin-right: 25px;"></td>
							<td width="105px" align="left" style="margin-right: 5px;">
							</td>
							
							<td width="110px" align="left">File:</td>
						</tr>
						<tr>
							<td height="1px" style="border-top: 1px solid #dadada;" colspan="5"></td>
						</tr>
	
					<?php 
					
					foreach($checkout_items as $item){					
					if(!empty($item->data["shippable"])) {
					?>
			
						<tr>
							
							<td width="375px" valign="top" align="left" style="margin-right: 25px; padding-bottom: 25px;"><?php echo $item->title?> <br>
							</td>
							<td width="105px" valign="top" align="left" style="margin-right: 5px;"></td>
							<td width="105px" valign="top" align="left" style="margin-right: 5px;"></td>
							<td width="110px" valign="top" align="left">
								<input type="file" name="files[file_1_<?php echo $item->cart_item_id?>]"><br>
								<input type="file" name="files[file_2_<?php echo $item->cart_item_id?>]">
								<input type="hidden" name="cart_item_id[]" value="<?php echo $item->cart_item_id?>">
								<input type="hidden" name="product_nid[]" value="<?php echo $item->nid?>">
								<input type="hidden" name="product_title[]" value="<?php echo $item->title?>">
								
							</td>
						</tr>
					<?php }}?>
	
						<tr>
							<td height="1px" style="border-top: 1px solid #dadada;" colspan="5"></td>
						</tr>
						<tr>
							<td height="1px" style="" colspan="5" align="right" ><br><?php echo drupal_render($form['upload'])?></td>
						</tr>
						<tr id="cartfooter">
							<td width="625px" align="left" colspan="2" style="margin-right: 50px;"></td>
							<td width="3120px" align="right" colspan="3" style="margin-right: 0px;"></td>
						</tr>
					</tbody></table>
				</div><br><br><?php echo drupal_render($form)?>
