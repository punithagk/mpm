

Drupal.behaviors.ucMultiCoupon = function(ctx) {
	$('.uc_multi_coupon_checkout_addmore#edit-panes-multi-coupon-add-another:not(.pane-processed)').addClass('pane-processed').click(function () {
		ucMultiCoupon.getNewElement();
		return false;
	});
}

var ucMultiCoupon = ucMultiCoupon || {}

ucMultiCoupon.getNewElement = function () {
  $.ajax( {
		type : "POST",
		url : Drupal.settings.ucmURL.getNewElement,
		data : {},
		dataType : "json",
		success : function(response) {
			$('#uc_multi_coupon_below').before(response.data);
		}
	});

	return false;
}

ucMultiCoupon.getMultiCoupon = function () {
  $('#coupon-message').remove();
  var codes = {};
  $('.edit-panes-multi-coupon-code').each(function () {
	  var index = $(this).attr('id');
	  var code = $(this).val();
	  if(code) codes[index] = code;
  });
  $.ajax({
    type: "POST",
    url: Drupal.settings.ucmURL.applyCoupon,
    data: codes,
    dataType: "json",
    success: function(data) {
	  $('.multi-coupon-message').remove();
	  if(data.message) {
		  $('#uc_multi_coupon_below').next().next().after('<div class="multi-coupon-message">' + data.message + '</div>');
	  }
      if(data.error == 1) {
			$('.edit-panes-multi-coupon-code').removeClass('error');
			jQuery.each(data.error_items, function(i, index) {
				$('#'+index).addClass('error');
			});
    	  $('#uc_multi_coupon_below').next().next().after('<div class="multi-coupon-message error">' + data.error_message + '</div>');
      }

      if (data.applied == 1) {
        if (window.set_line_item) {
          set_line_item('multi_coupon', data.title, -data.amount, 3);
        }
      }
      else {
        if (window.remove_line_item) {
          remove_line_item('multi_coupon');
        }
      }
  
      if (window.getTax) {
        getTax();
      }
      else if (window.render_line_items) {
        render_line_items();
      }
    }
  });
}