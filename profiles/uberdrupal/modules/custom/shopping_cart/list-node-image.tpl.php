<?php 
global $base_url;
if(count($data[0]) > 0) {
?>
	<div id="thumbnailImages" style="width: 1000px; height: 150px; margin: 15px 0px 15px 0px; display: block;">
		<table id="Table_01" border="0" cellpadding="0" cellspacing="0" height="150" width="1000" style="border-collapse:separate">
			<tbody><tr>
						<?php foreach($data as $images) { ?>
						<td>
						<a href="<?php echo $base_url.'/'.$images['path']?>">
							<img src="<?php echo $base_url.'/'.$images['image']['filepath']?>">
						</a>
						</td><td></td>
						<?php }?>
					</tr>
		</tbody></table>
	</div>
<?php }