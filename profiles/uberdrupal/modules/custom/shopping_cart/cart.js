function getShippingOptions(products, country){
	//atttr =  $("#uc-product-add-to-cart-form select").serialize();
	//$("#quote").text(atttr);
	if($.trim($("#shippingZip").val()) != '') {
		products= products;
		details1 = new Object();
		details1['uid'] = $("input[name*=uid]").val();
		details1['details[delivery][country]'] =	country;
		details1['details[delivery][postal_code]'] = $.trim($("#shippingZip").val());								
		details1['products'] = products;
		var baseurl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
		page = $("input:hidden[name*=page]").val();
		$.ajax({
			type: "POST",
			url:  baseurl + 'cart/checkout/shipping/quote',
			data: details1,
			dataType: "json",
			success: function (data) {
				 var quoteDiv = $("#quote").empty()/* .append("<input type=\"hidden\" name=\"method-quoted\" value=\"" + details["method"] + "\" />") */;
				  var numQuotes = 0;
				  var errorFlag = true;
				  var i;
				  for (i in data) {
					if (data[i].rate != undefined || data[i].error || data[i].notes) {
					  numQuotes++;
					}
				  }
				  for (i in data) {
					var item = '';
					var label = data[i].option_label;
					if (data[i].rate != undefined || data[i].error || data[i].notes) {

					  if (data[i].rate != undefined) {
						if (numQuotes > 1 && page != 'cart') {
						  item = "<input type=\"hidden\" name=\"rate[" + i + "]\" value=\"" + data[i].rate + "\" />"
							+ "<label class=\"option\">"													
							+ label + ": " + data[i].format + "</label>";
						}
						else {
						  item = "<input type=\"hidden\" name=\"quote-option\" value=\"" + i + "\" />"
							+ "<input type=\"hidden\" name=\"rate[" + i + "]\" value=\"" + data[i].rate + "\" />"
							+ "<label class=\"option\">" + label + ": " + data[i].format + "</label>";
						  if (page == "checkout") {
							if (label != "" && window.set_line_item) {
							  set_line_item("shipping", label, data[i].rate, 1);
							}
						  }
						}
					  }
					  if (data[i].error) {
						item += '<div class="quote-error">' + data[i].error + "</div>";
					  }
					  if (data[i].notes) {
						item += '<div class="quote-notes">' + data[i].notes + "</div>";
					  }
					  if (data[i].rate == undefined && item.length) {
						item = label + ': ' + item;
					  }
					  quoteDiv.append('<div class="form-item">' + item + "</div>\n");
					  //Drupal.attachBehaviors(quoteDiv);
					  
					}
					if (data[i].debug != undefined) {
					  quoteDiv.append("<pre>" + data[i].debug + "</pre>");
					}
				  }
				  
			}
		});
	}
	return false;
}

function product_change(id)
{
	var baseurl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
	title = $("#"+id+" option:selected").text();
	$.ajax({
		type: "POST",
		url:  baseurl + 'product-details-path-find',
		data: {product_title:title},
		dataType: "json",
		success: function (data) {
			if(data != '' && data != 'null') {
				window.location = baseurl + data.node_path;
			}
		}
	});
}

function coating_validate(){	
    var baseurl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
    $('#uc-product-add-to-cart-form').ajaxSubmit({
           url:  baseurl + 'coating-validator',
           dataType: "json",
           success: function (data) {		
			if(data.dd_quantity < 500 && data.dd_coating == 'UV - Ultra High Gloss'){
			  $('#warning_coating').show();
			  $(".screen_fadout").fadeIn(300, function() {
			  });
			  return false;
			}

			if(data.dd_quantity >= 500 && data.dd_coating != 'UV - Ultra High Gloss' && data.dd_print_turnaround_time == '24 Hours'){
			 $('#warning_turnaround').show();
					  $(".screen_fadout").fadeIn(300, function() {
					  });
					  return false;
			}
           }
    });
    return true;
}

function add_to_cart_validate(){	
    var baseurl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
    $('#uc-product-add-to-cart-form').ajaxSubmit({
           url:  baseurl + 'coating-validator',
           dataType: "json",
           success: function (data) {		
			if(data.dd_quantity < 500 && data.dd_coating == 'UV - Ultra High Gloss'){
			  $('#warning_coating').show();
			  $(".screen_fadout").fadeIn(300, function() {
			  });
			  return false;
			} else if(data.dd_quantity >= 500 && data.dd_coating != 'UV - Ultra High Gloss' && data.dd_print_turnaround_time == '24 Hours'){
			 $('#warning_turnaround').show();
					  $(".screen_fadout").fadeIn(300, function() {
					  });
					  return false;
			}else {
				$('#uc-product-add-to-cart-form').submit();
			}
           }
    });
    return false;
}

function get_products(catalog_id)
{
	var baseurl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
	$.ajax({
		type: "POST",
		url:  baseurl + 'get-product-lists',
		data: {catalog_id:catalog_id},
		dataType: "json",
		success: function (data) {
			$("#product_list").html(data.product);
			
		}
	});
}

function shipping_calculator()
{
	if($.trim($("#shippingZip").val()) != '') {
		var baseurl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
		$('#uc-product-add-to-cart-form').ajaxSubmit({
			url:  baseurl + 'shipping-calculator',
			dataType: "json",
			success: function (data) {
				getShippingOptions(data.prod_string, data.country)
			}
		});
	}
}

function warning_close() {

	 $('#warning_coating').hide();
	 $('#warning_turnaround').hide();
	 $(".screen_fadout").fadeOut(300, function() {
			  });
}

    
function refresh() { 
	window.location.reload(true);	 
}

    
function update_order_status(order_id, status) {
	var baseurl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
	$.ajax({
		type: "POST",
		url:  baseurl + 'update-order-status/'+order_id+'/'+status,
		dataType: "json",
		success: function (data) {
			if(data.status)
				refresh()
			else
				alert("Error while update order status!");
			
		}
	});
}

$(document).ready( function() {

	//Date Picker reset button
	$('.coupon_button').click(function (e) {
		$('#edit-code').val('');
		$('#edit-apply').trigger("click");
		return false;
	});
	current_url = window.location.href;	
	if(current_url.indexOf("admin/print_queue") > -1 || current_url.indexOf("admin/quote_queue") > -1 || current_url.indexOf("admin/sales_queue") > -1 || current_url.indexOf("admin/pre_press_queue") > -1 || current_url.indexOf("admin/bindery_queue") > -1)
	{
		 timer = setTimeout(refresh, 120000);		 
	}
	
	$('.update_order_status').click(function (e) {
		order_id = $(this).attr("id");
		status = $(this).attr("status");
		update_order_status(order_id , status);
		return false;
	});
	
	$(".view-print-queue").live("click", function(){
	
		var baseurl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
		
		var orderid = $(this).attr("orderid");
		var template = $(this).attr("template");	
		if(orderid) {
			$("#overlayInner-" + orderid).load(baseurl + "admin/store/orders/"+orderid +"/"+ template+"/print",
		   // the following is the callback   
			  function(){
			  clearTimeout(timer);
			  $("#overlayOuter-" + orderid).fadeIn(300);
			  $("#overlayOuter-" + orderid).height($(document).height());
			  var width = ($(document).width()/2) -300;
			  $("#overlayInner-" + orderid).css("left", width);
			  
			  $("#overlayInner-" + orderid).slimScroll({
				height:  '800px',alwaysVisible :true, allowPageScroll: false
				
				});	
			  });
		 } else {
			$(".overlayOuter" ).fadeOut(300);
			setTimeout(refresh, 120000);	
		 }
	});
	
	
	$(document).ajaxComplete(function(e, xhr, settings)
	{
		var baseUrl = location.protocol +"//"+ location.host + Drupal.settings.basePath;
		//alert(settings.url.replace(Drupal.settings.basePath,""));
		
		base_url = settings.url.replace(Drupal.settings.basePath,"");
		url_split = base_url.split("/");
		if (url_split[0]=="views" || url_split[1]=="ajax")
		{
			$('.update_order_status').click(function (e) {
				order_id = $(this).attr("id");
				status = $(this).attr("status");
				update_order_status(order_id , status);
				return false;
			});
		}
	});
});