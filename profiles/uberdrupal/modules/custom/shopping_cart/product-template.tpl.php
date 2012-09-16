<?php 
global $base_url;
if(count($data[0]) > 0) { ?>
	<h4>Templates:</h4>
	<?php foreach($data as $node) {  ?>
		<?php 
		if(!empty($node['title'])){
			echo $node['title'].":";
		}?>
		<?php $template_not_set = true;
		if(!empty($node['psd_template']['filepath'])) {?>
			<a href="<?php echo $base_url.'/'.$node['psd_template']['filepath']?>">PSD</a> | 
			<?php $template_not_set = false;
		}
		if(!empty($node['ai_template']['filepath'])) {?>
			<a href="<?php echo $base_url.'/'.$node['ai_template']['filepath']?>">AI</a> | 
			<?php $template_not_set = false;
		}
		if(!empty($node['eps_template']['filepath'])) {?>
			<a href="<?php echo $base_url.'/'.$node['eps_template']['filepath']?>">EPS</a> | 
			<?php $template_not_set = false;
		}
		if(!empty($node['pdf_template']['filepath'])) {?>
			<a href="<?php echo $base_url.'/'.$node['pdf_template']['filepath']?>">PDF</a>
			<?php $template_not_set = false;
		}
		if($template_not_set) { ?>
   			<span>No Templates Available</span>
		<?php }?>
		<br>
	<?php }
}
