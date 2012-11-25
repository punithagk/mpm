/**
 * Allows uc_conditional_attributes to be notified when the pages loads and the
 * DOM is ready, or when any changes to the DOM are made. When this happens,
 * we will need to rebuild the display immediately and then bind ourself to any
 * future onchange events.
 */
Drupal.behaviors.uc_conditional_attributes = function(context) {
  // Context is the Document: process all node forms.
  $('.node, #node-form', context).each(function() {
    var node_id = '#'+$(this).attr('id')+' ';
    rebuildAttrDisplay(node_id);
    bindAttrDisplay(node_id);
  });
  
  // The product form (incl. attributes) was modified
  if ($(context).is('form[id^=uc-product-add-to-cart-form-]')) {
    var node_id = '#'+$(context).attr('id')+' ';
    rebuildAttrDisplay(node_id);
    bindAttrDisplay(node_id);
  }
}

/**
 * Rebuilds the display immediately, use this when DOM changes for example.
 */
function rebuildAttrDisplay(node_id) {
  //console.log('\n\n');
  $(node_id+'.uc-conditional-attributes-dependent-attr').each(function() {
    $(this).parents(".form-item").parents(".attribute").hide();
  });
  
  $(node_id+'.uc-conditional-attributes-parent-attr').each(function() {
    uc_conditional_attributes_parent_attr_trigger(node_id, this.id, this.value);
  });
}

/**
 * Binds rebuildAttrDisplay to the onchange event so that the display can be
 * updated as new options are selected.
 */
function bindAttrDisplay(node_id) {
  $(node_id+'.uc-conditional-attributes-parent-attr, ' + node_id+'.uc-conditional-attributes-parent-dependent-attr').change(function() {
    rebuildAttrDisplay(node_id);
  });
}

/**
 * Rebuilds the display of a parent and its dependent children.
 */
function uc_conditional_attributes_parent_attr_trigger(node_id, id, selected_option, force_hide) {
  var this_attr_id = null;
  var matches = id.match(/edit-attributes-(\d+)(-\d+)?/);
  if (matches === null) {
    //console.log('No ID matches found on ' + id + ': aborting.');
    return;
  }
  else {
    this_attr_id = matches[1];
  }
  
  var uc_ca_def = Drupal.settings.uc_conditional_attributes[this_attr_id];
  var hidden_attributes = new Array();
  
  //console.log('starting on attribute with ID ' + this_attr_id + ' and value ' + selected_option);
  //console.log(uc_ca_def);
  
  $(node_id + ".add-to-cart .attributes").hide();
  $(node_id + ".node-form .attributes").hide();
  $(node_id + "#node-form .attributes").hide();
  
  // The selected option may have no dependency information at all, or it may
  // have different attributes to hide. Queue any attributes that may have been
  // disabled by previously selecting options to show first.
  for (var oid in uc_ca_def) {
    for (var attr_id in uc_ca_def[oid]) {
      if (uc_ca_def[oid][attr_id] == 'disable') {
        $(node_id + "div.attribute-" + attr_id).show();
      }
      else {
        $(node_id + "div.attribute-" + attr_id).hide();
      }
      // fire change event on dependent attrs so that any other attr that are
      // dependent on it will show. If we have previously hidden a parent, we must
      // forcibly hide all of its children no matter what its dependency type is.
      $(node_id + 'div.attribute-' + attr_id + ' select.uc-conditional-attributes-parent-dependent-attr').each(function() {
        var force_hide = ($.inArray(attr_id, hidden_attributes) > -1);
        //console.log('[recursing] '+attr_id+' with force '+force_hide);
        uc_conditional_attributes_parent_attr_trigger(node_id, this.id, this.value, force_hide);
      });
    }
  }
  
  // selected_options is '' when the "Please Select" option is selected
  if (selected_option == '' || force_hide === true) {
    for (var attr_id in uc_ca_def[oid]) {
      //console.log('[force] hiding '+attr_id);
      $(node_id + "div.attribute-" + attr_id).hide();
      _uc_conditional_attributes_unset_hidden_attributes(node_id, attr_id);
    }
  }
  // now parse the dependency chain for this option and hide any items as needed
  else if (selected_option in uc_ca_def) {
    for (var attr_id in uc_ca_def[selected_option]) {
      if (uc_ca_def[selected_option][attr_id] == 'disable') {
        //console.log('[disable] hiding '+attr_id);
        $(node_id + "div.attribute-" + attr_id).hide();
        _uc_conditional_attributes_unset_hidden_attributes(node_id, attr_id);
        hidden_attributes.push(attr_id);
      } else if (uc_ca_def[selected_option][attr_id] == 'enable') {
        //console.log('[enable] showing '+attr_id);
        $(node_id + "div.attribute-" + attr_id).show();
      }
    }
  }
  
  $(node_id + ".add-to-cart .attributes").show();
  $(node_id + ".node-form .attributes").show();
  $(node_id + "#node-form .attributes").show();
  //console.log('finished attribute with ID ' + this_attr_id);
}

/**
 * Empties the value of a hidden attribute with attr_id. node_id is the JQuery
 * ID selector for the form, such as "#uc-product-add-to-cart-form-foo " (note
 * the trailing space - it is required).
 */
function _uc_conditional_attributes_unset_hidden_attributes(node_id, attr_id) {
  if ($(node_id + "div.attribute-" + attr_id + " input").is("input:radio")) {
    $(node_id + "div.attribute-" + attr_id + " input").attr("checked", false);
  }
  else {
    $(node_id + "div.attribute-" + attr_id + " input").val("");
    //$("div.attribute-" + attr_id + " select").val("");
    $(node_id + "div.attribute-" + attr_id + " select option:first").attr('selected','selected');
  }
}

/**
 * Used by the admin interface to refresh the available options for an attribute
 */
function uc_conditional_attributes_filter_attr_options(selected_option, element_id) {
  var url = Drupal.settings.basePath + "js/uc_conditional_attributes/filter_attr_options/" + selected_option;
  $.ajax({
    url: url,
    success: function(data) {
      var html = "";
      var data_arr = eval('(' + data + ')');
      for (var oid in data_arr) {
        html += '<option value="' + oid + '">' + data_arr[oid] + '</option>';
      }
      $("select[name*=" + element_id + "]").html(html);
    },
  });
}
