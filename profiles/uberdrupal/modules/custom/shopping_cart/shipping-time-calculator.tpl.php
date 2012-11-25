<br> <br>
<h4>Shipping Time Calculator:</h4>
<?php ?>
<script>
		
</script>
<input placeholder="Shipping zip code" id="shippingZip" type="text"> 
<a class="calculate" href="javascript://" onclick="return shipping_calculator('<?php echo $products?>','<?php echo $country?>')">Calculate</a>
<input name="calculatedWeight" value="0.161" id="weight" type="hidden">
<div id="result" style="padding-left: 10px; border-left: 2px solid #dadada; width: 370px; font-size: 85%; display: block; margin-top: 15px; margin-bottom: 15px;">
</div>
<br>
<div id="quote" >
						
</div>

<div id="warning_coating" style="display:none">
	<div style="display: block; z-index: 1002; outline: 0px none; position: absolute; height: auto; width: 550px; top: 1010.5px; left: 352.5px;" class="ui-dialog ui-widget ui-widget-content ui-corner-all  ui-draggable ui-resizable" tabindex="-1" role="dialog" aria-labelledby="ui-dialog-title-dialogGloss">
		<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">
			<span class="ui-dialog-title" id="ui-dialog-title-dialogGloss">PLEASE NOTE</span>
			<a href="javascript://" class="ui-dialog-titlebar-close ui-corner-all" onclick="warning_close()"  role="button">
				<span class="ui-icon ui-icon-closethick">close</span>
			</a>
		</div>
		<div style="width: auto; min-height: 0px; height: 294px;" id="dialogGloss" class="ui-dialog-content ui-widget-content" scrolltop="0" scrollleft="0">
			<p>At this time UV - Ultra High Gloss Coating is not available for quantities under 500. 
			<br><br>If you would like UV coating on this item, please select a quantity of 500 or greater. 
			<br><br><br>If you would like to proceed with ordering this item in this quantity, 
			please select "No Coating - Standard Gloss." Thanks!</p>
		</div>
		<div class="ui-resizable-handle ui-resizable-n" style="z-index: 1000;"></div>
		<div class="ui-resizable-handle ui-resizable-e" style="z-index: 1000;"></div>
		<div class="ui-resizable-handle ui-resizable-s" style="z-index: 1000;"></div>
		<div class="ui-resizable-handle ui-resizable-w" style="z-index: 1000;"></div>
		<div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se ui-icon-grip-diagonal-se" style="z-index: 1000;"></div>
		<div class="ui-resizable-handle ui-resizable-sw" style="z-index: 1000;"></div>
		<div class="ui-resizable-handle ui-resizable-ne" style="z-index: 1000;"></div>
		<div class="ui-resizable-handle ui-resizable-nw" style="z-index: 1000;"></div>
	</div>
</div>
<div id="warning_turnaround" style="display:none">
        <div style="display: block; z-index: 1002; outline: 0px none; position: absolute; height: auto; width: 550px; top: 1010.5px; left: 352.5px;" class="ui-dialog ui-widget ui-widget-content ui-corner-all  ui-draggable ui-resizable" tabindex="-1" role="dialog" aria-labelledby="ui-dialog-title-dialogGloss">
                <div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">
                        <span class="ui-dialog-title" id="ui-dialog-title-dialogGloss">PLEASE NOTE</span>
                        <a href="javascript://" class="ui-dialog-titlebar-close ui-corner-all" onclick="warning_close()"  role="button">
                                <span class="ui-icon ui-icon-closethick">close</span>
                        </a>
                </div>
                <div style="width: auto; min-height: 0px; height: 294px;" id="dialogGloss" class="ui-dialog-content ui-widget-content" scrolltop="0" scrollleft="0">
                        <p>At this time 24 Hours Turnaround is not available for quantities 500 and above without UV - Ultra High Gloss Coating.
                        <br><br>If you would like 24 Hours Turnaround for this item, please select a UV - Ultra High Gloss coating.
                        <br><br><br>If you would like to proceed with ordering this item in this quantity without UV - Ultra High Gloss Coating,please select other Turnaround options Thanks!</p>
                </div>
                <div class="ui-resizable-handle ui-resizable-n" style="z-index: 1000;"></div>
                <div class="ui-resizable-handle ui-resizable-e" style="z-index: 1000;"></div>
                <div class="ui-resizable-handle ui-resizable-s" style="z-index: 1000;"></div>
                <div class="ui-resizable-handle ui-resizable-w" style="z-index: 1000;"></div>
                <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se ui-icon-grip-diagonal-se" style="z-index: 1000;"></div>
                <div class="ui-resizable-handle ui-resizable-sw" style="z-index: 1000;"></div>
                <div class="ui-resizable-handle ui-resizable-ne" style="z-index: 1000;"></div>
                <div class="ui-resizable-handle ui-resizable-nw" style="z-index: 1000;"></div>
        </div>
</div>
<div class="screen_fadout" style="display:none;width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; z-index: 999;"></div>
<style type="text/css"> 
.screen_fadout {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
}
.screen_fadout {
    background: url("images/ui-bg_flat_0_aaaaaa_40x100.png") repeat-x scroll 50% 50% #AAAAAA;
    opacity: 0.3;
}
</style>
