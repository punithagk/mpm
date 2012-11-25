<?php
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php print $language->language ?>" lang="<?php print $language->language
 ?>" dir="<?php print $language->dir ?>">
<head>
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-33466885-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
	<?php print $head ?>
	<title><?php print $head_title ?></title>
	<?php print $styles ?>
	<?php print $scripts ?>
</head>

<body data-twttr-rendered="true">
	<div id="container">
		<div>
			<div id="header">
			        <div id="left">
					<a href="<?php print $base_path ?>" title="<?php print t('Home') ?>"><img src="<?php print $logo ?>" alt="<?php print
t('Home') ?>"/></a>
				</div>
				<div id="right">
				<?php if (isset($secondary_links)) : ?>
					<?php 
					foreach ($secondary_links as $key => $val) { 
					    //print_r($val);
						if(user_is_logged_in()) {
							if($val['href'] == 'logout') { 
									$secondary_links[$key]['title'] = 'Sign Out';
							} 							
							if($val['href'] == 'my-profile') { 
								global $user;
								$secondary_links[$key]['title'] = 'Hello '.$user->name;
							} 
						}
						else {
							
							if($val['title'] == 'login') {
								$secondary_links[$key]['title'] = 'Sign In'; 
							} 
						}
					}
					print theme('links', $secondary_links,array('class' => 'links secondary-links')) 
					?>
					<?php endif; ?>
					<?php if($sociallinks) : ?>
						<table id="sociallinks" border="0" cellpadding="0" cellspacing="0" height="32" width="97">
						<tbody>
							<tr><?php echo $sociallinks;?></tr>
						</tbody>
						</table>
					<?php endif; ?>
				</div>
				<div class="clear"></div>
			</div>
			<?php if (isset($primary_links)) : ?>
				<div id="navigation">
					<?php print theme('links', $primary_links, array('class' => 'links primary-links')) ?>

				</div>
			<?php endif; ?>
		</div>

