<?php
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php print $language->language ?>" lang="<?php print $language->language ?>" dir="<?php print $language->dir ?>">
  <head>
    <?php print $head ?>
    <title><?php print $head_title ?></title>
    <?php print $styles ?>
    <?php print $scripts ?>
    <!--[if lt IE 7]>
      <?php print phptemplate_get_ie_styles(); ?>
    <![endif]-->
	<style type='text/css'>
		.megamenu-skin-minimal {
			background-color:#FFFFFF;
		}
		.megamenu-skin-minimal .megamenu-bin {
			background-color: #FFFFFF;
			border: 2px groove #FFFFFF;
			border-radius: 0.583em 0.583em 0.583em 0.583em;
		}
		.megamenu-skin-minimal .megamenu-slot-title, .megamenu-skin-minimal .megamenu-slot-title a {
			color: #FF6600;
			background-color: #FFFFFF;
			text-align: left;
			text-transform: none;
		}
		.megamenu-skin-minimal .megamenu-slot {
			border-bottom:1px solid #FFFFFF
		}
	</style>
  </head>
  <body id="htmlBody" class="theme-orange">
        <!-- Start of DoubleClick Floodlight Tag --> 
                
        
                <div id="divHeaderWrapper">
            <div id="divHeader" class="clearfix">
                <div id="divHeaderLogo">
                    <p class="no-stripe"><a href="<?php print $base_path ?>" title="<?php print t('Home') ?>"><img src="<?php print $logo ?>" alt="<?php print t('Home') ?>"/></a>
          </p>
                </div>
                                <div id="divHeaderNavigation">
                                                                
                        <!-- Start of User Info -->
<!-- Start of User Info -->
<ul id="ulUserInfo">
                <li>   
         <?php
                global $user;
                if (!$user->uid ) {?>
                        <li><a href="<?php print '?q=user/login'?>">Sign In</a></li>
                        <li><a href="<?php print '?q=user/register'?>">Register</a></li>
                <?php
                }else {?>
                        <li><a href="<?php print '?q=logout'?>">logout</a></li>
                <?php } ?>

	<?php if($header_top) : ?>
	 <li style="border-right: 0px solid #EFEFEF"> 
		 <?php 
			echo $header_top;
			
				     
        ?>
	  </li>
	  <?php endif; ?>
</ul>
<!-- End of User Info -->
<!-- End of User Info -->
                                        <!-- Start of Main Navigation -->
<ul id="ulNav">
<?php if($header) : ?>
 <!-- PRIMARY -->
      <div >
        <?php 
			echo $header;
			
				     
        ?>
      </div> <!-- /primary --></li>
<?php endif; ?>


    </ul>
<!-- End of Main Navigation -->

                </div>
            </div>
        </div>

<div class="container" id="divHomepage">
	<div class="container-col12"> 
		<div>
                        <?php //if($slider) : ?>
                        <div class="static-box no-margin no-padding"> 
                                <?php echo  $slider;?>
                        </div>
                        <?php //endif;?>
                </div>
	</div>
	<div class="container-col12">              
		<div class="col4 homepage-text-box-fixed">
			<?php if($preface_first) : ?>
			<div class="static-box no-margin no-padding">
				<?php echo  $preface_first;?>
			</div>  
			<?php endif;?>
		</div>	
		<div class="col4 homepage-text-box-fixed">
			<?php if($preface_middle) : ?>
			<div class="static-box no-margin no-padding">
				<?php  echo  $preface_middle;?>
			</div>
			<?php endif;?>
		</div>   
		<div class="col4 homepage-text-box-fixed">
                        <?php if($preface_last) : ?>
                        <div class="static-box no-margin no-padding">
                                <?php  echo  $preface_last;?>
                        </div>
                        <?php endif;?>
		</div>  
	</div>
        <div id="content">
                <?php if ($content_top) : ?>
                        <div class="content-top"><?php print $content_top; ?></div>
                <?php endif; ?>
                <?php if (!$is_front) print $breadcrumb; ?>
                <?php if ($show_messages) { print $messages; }; ?>
                <?php if ($content) : ?>
                        <div class="content" style="width:910px">
                        <div class="content-middle" style="<?php if($preface_right) : ?>width:600px;<?php endif;?>float:left">                          <?php print $content; ?>
                        </div>
                        <?php if($preface_right) : ?>
                                <div class="content-right" style="padding-left: 10px; width:300px ;float:right">
                                        <div class="static-box no-margin no-padding">
                                                <div class="col4 homepage-text-box-fixed unknown-box">
                                                        <div class="box rounded-corners-5 video-text-box">
                                                                <?php print_r($preface_right); ?>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        <?php endif;?>
                        </div>
                <?php endif; ?>
                <?php if ($content_bottom) : ?><div class="content-bottom"><?php print $content_bottom; ?></div>
                <?php endif; ?>
        </div> <!-- end content -->
</div>	
<div id="divFooter" class="clearfix">
	<?php if ($footer_message || $footer_links): ?>
	<div id="divCompanyInfo">
	    <address>
        	<span class="moo-droplet">&nbsp;</span>
	        <span class="hide tooltip rounded-corners-5" id="spnMOODropletBox">
        	    <span>Oh hi, nice to see you!</span>
	            <span class="down"></span>
	        </span>
	    	<?php if ($footer_links): ?><?php print theme('links', $footer_links) ?><?php endif; ?>
    		<?php if ($footer_message): ?><span class='address'><?php print $footer_message ?></span><?php endif; ?>
	    </address>
	</div>
	<?php endif; ?>
</div>
        
<script type="text/javascript" src="<?php echo $base_path . $directory; ?>/<?php echo $base_path . $directory; ?>/css_js/2562.js" defer="defer"></script>

<div class="rounded-corners-5 overlay-container" id="divVideoOverlay"><a class="close"></a><div style="width: 640px; height: 430px;" class="overlay-content rounded-corners-5 clearfix"></div></div>  <?php print $closure ?>
</body>
</html>