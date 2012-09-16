/* Included from: /javascript/error-handler.js */

window.onerror = error_handler;

var last_time_moobug_fired = null;
var number_of_moobugs = 0;

function error_handler(msg, url, line) {
    var now = new Date();

    //we don't want more than 100 moobugs reported for a certain page
    if (number_of_moobugs == 100) {
        return false;
    }

    if (last_time_moobug_fired !== null) {
        if (last_time_moobug_fired.getMinutes() == now.getMinutes()) {
            //same minute, we have to check the seconds
            if (last_time_moobug_fired.getSeconds() == now.getSeconds()) {
                //same second, not yet another moobug
                return false;
            }
        }
    }

    last_time_moobug_fired = now;
    number_of_moobugs++;

    jQuery.post("/moobug.php",
        {"q":msg, "source":"javascript", "info":url + " :" + line},
        function (data) {
        });

    return false;
}


/* Included from: /javascript/header.js */

jQuery(function ($) {
    // Nav
    // Hovering over the tabs
    $('#ulNav > li > a').mouseenter(function () {
        $('li.menu-option > a').removeClass('highlighted');
        $('div.submenu').hide();
        $(this).next().find('.menu-option-list').css('border-right', '').css('padding-right', '0');
        $(this).addClass('tab-active');
        $(this).next().show();
    });
    $('#ulNav > li > a').mouseleave(function () {
        $(this).removeClass('tab-active');
        $(this).next().hide();
    });
    // Hovering over a menu
    $('div.menu').each(function () {
        $divMenu = $(this);
        $menu = $divMenu.children('.menu-inner').eq(0);
        $(this).find('li.menu-option > a').each(function () {
            $submenu = $(this).next('.submenu').eq(0);
            $(this).data("submenu", $submenu);
            $menu.append($submenu);
        });

        $divMenu.mouseenter(function () {
            $(this).prev().addClass('tab-active');
            $(this).show();
        });

        $divMenu.mouseleave(function (event) {
            $(this).prev().removeClass('tab-active');
            $(this).hide();
        });
    });
    // Hovering over a link
    $('li.menu-option > a').mouseover(function () {
        $('li.menu-option > a').removeClass('highlighted');
        $(this).addClass('highlighted');
        $('div.submenu').hide();
        $submenu = $(this).data("submenu");
        if ($submenu.length != 0) {
            $(this).parents('.menu-option-list').css('border-right', '1px solid #DBD9D9').css('padding-right', '5px');
            $submenu.show();
        } else {
            $(this).parents('.menu-option-list').css('border-right', '').css('padding-right', '0');
        }
    });
    //line markers between groups of the menu
    $('a.group-marker').parent().css('border-top', '1px solid #DBD9D9').css('margin-top', '5px').css('padding-top', '5px');
});


/* Included from: /javascript/components/targetexternallinks.js */

jQuery(function ($) {
        //all links with href that is not empty or # and with extrenal as rel then make target _blank
        $("a[rel~='external'][href]:not([href='#']):not([href=''])").attr('target', '_blank');
    }
);

/* Included from: /javascript/store-switcher.js */

(function ($) {
    changeStoreConfirm = function (sUrl) {
        // Store changing can result in a loss of data, therefore we need to
        // check to
        // see that there will be no ill effects from the switch and message the
        // customer accordingly

        var matches = sUrl.match(/_s=([0-9]+)/);
        var toSiteId = matches[1];

        $.ajax({
            url:'/ajaxrequests/store-switcher.php',
            type:"POST",
            dataType:"json",
            //			beforeSend: pleaseWait,
            //			error: handleError,
            data:{ siteId:toSiteId },
            success:function (data) {
                changeStoreConfirmCallback(data, toSiteId, sUrl);
            }
            //			complete: removePleaseWait
        });

        return false;
    };

    changeStoreConfirmCallback = function (data, toSiteId, sUrl) {
        if (data.length > 0) {
            // We had issues with the switch. We need to ask the user what to do

            // Kill any previously inserted boxes
            $('#divStoreSwitcherConfirm').remove();

            // Drop the warning lightbox onto the page

            var sToSite = '';
            var sFromSite = '';

            if (toSiteId == 1) {
                sToSite = string00006_ss;
                sFromSite = string00007_ss;
            } else {
                sToSite = string00007_ss;
                sFromSite = string00006_ss;
            }

            var lightboxText = '';
            lightboxText += '<div id="divStoreSwitcherConfirm" class="moo-overlay-container">';
            lightboxText += '<a class="close"></a>';
            lightboxText += '<h2>' + string00001_ss + '</h2>';

            lightboxText += '<ul>';
            for (var i = 0; i < data.length; i++) {
                lightboxText += '<li>' + data[i] + '</li>';
            }
            lightboxText += '</ul>';

            lightboxText += '<div class="group-confirm">';
            lightboxText += '<a href="' + sUrl + '" class="button">' + string00002_ss + ' ' + sToSite + '</a>';
            lightboxText += '<div class="hint clear">' + (data.length > 1 ? string00005_ss : string00004_ss) + '</div>';
            lightboxText += '</div>';
            lightboxText += '<div class="group-deny close">';
            lightboxText += '<a href="#" class="button deny">' + string00003_ss + ' ' + sFromSite + '</a>';
            lightboxText += '</div>';


            lightboxText += '</div>';

            $(lightboxText).appendTo('body');

            var showOverlay = function () {
                $('#divStoreSwitcherConfirm').mooOverlay({
                    // disable this for modal dialog-type of overlays
                    closeOnClick:false,

                    // load it immediately after the construction
                    load:true
                });
            };


            if ($.mask.isLoaded()) {
                //the mask is loaded .. so there was another dialog and the mask has not finished the animation yet.. so we will wait for its load speed + a bit
                //we will just make sure it is closed .. then we can show ours 
                $.mask.getExposed().overlay().close();
                setTimeout(showOverlay, $.mask.getConf().loadSpeed + 20);
            } else {
                showOverlay();
            }
        } else {
            // THere was nothing wrong so we'll forward them on

            window.location = sUrl;
        }
    }

    removeBox = function () {
        $('#divStoreSwitcherConfirm').overlay().close();
        return true;
    };

    // now set up the doc ready stuff (which is able to use the function in this
    // closure)
    $(function () {
        // find store switching selects
        $('select.store-switch').live("change", function () {
            var storeUri = $(this).val();
            if (changeStoreConfirm(storeUri)) {
                window.location = storeUri;
                return true;
            } else {
                return false;
            }
        });

        // Adding a delegate listener for the store switcher so if we provide
        // a store switching button in a computed light box, we'll catch those
        // clicks too
        $('body').delegate("a.store-switch", "click", function () {
            return changeStoreConfirm($(this).attr('href'));
        });
    });

})(jQuery);


/* Included from: /javascript/jquery/jquery.moo.validation.js */

/**
 * Moo Jquery utility plugin jquery form field validation
 *
 * Use:
 * $.mooValidation.validateEmail(sEmail)
 *
 *
 * inside your own class to get access to all this goodness.
 *
 * Add stuff to here as move from prototype to jquery.
 *
 */

(function ($) {

    $.mooValidation = {
        // maximum length for address strings
        maxLength:35,
        maxLengthPhone:25,
        maxLengthPostcode:10,

        validateEmail:function (sEmail) {
            if (typeof(sEmail) == 'undefined') {
                return false;
            }

            //var sEmailRegEx = "^[\\w-_\.]*[\\w-_\.]\@[\\w]\.+[\\w]+[\\w]$";
            // now allowing + before @
            var sEmailRegEx = "^[\\w-_\.\+]*[\\w-_\.]\@[\\w]\.+[\\w]+[\\w]$";
            var oRegEx = new RegExp(sEmailRegEx);
            return oRegEx.test(sEmail);
        },

        // Make sure that a string is not empty
        validateNotEmpty:function (sString) {
            return ( sString.length > 0);
        },

        // basic string validation: just check if there's anything inside
        validateString:function (sString) {
            if (typeof(sString) == 'undefined') {
                return false;
            }
            return ( sString.length > 0);
        },
        // address strings can be empty (need extra check if required
        // but must not be greater than maxLength
        validateAddressStringLength:function (sString) {
            if (typeof(sString) != 'undefined' && sString.length > $.mooValidation.maxLength) {
                return false;
            }
            return true;
        },
        // postcode strings can only be 10 chars
        validatePhoneStringLength:function (sString) {
            if (typeof(sString) != 'undefined' && sString.length > $.mooValidation.maxLengthPhone) {
                return false;
            }
            return true;
        },
        // postcode strings can only be 10 chars
        validatePostcodeStringLength:function (sString) {
            if (typeof(sString) != 'undefined' && sString.length > $.mooValidation.maxLengthPostcode) {
                return false;
            }
            return true;
        },
        // name strings when added together with a space
        // must not be greater than maxLength
        validateNameStringLength:function (fnString, lnString) {
            var sString = fnString + ' ' + lnString;
            if (typeof(sString) != 'undefined' && sString.length > $.mooValidation.maxLength) {
                return false;
            }
            return true;
        },

        validateNumeric:function (sString) {
            if (typeof(sString) == 'undefined') {
                return false;
            }
            var sValidChars = " 0123456789.-";
            var bNumber = true;
            var sChar;

            for (i = 0; i < sString.length && bNumber == true; i++) {
                sChar = sString.charAt(i);
                if (sValidChars.indexOf(sChar) == -1) {
                    bNumber = false;
                }
            }
            return bNumber;
        },

        validateCreditCard:function (sString) {
            bReturn = true;

            sString = sString.replace(' ', '');
            var sStarRegEx = "^\\*+[0-9]{4}$";
            var oRegEx = new RegExp(sStarRegEx);
            if (oRegEx.test(sString)) {
                // No other validation required
                bReturn = true;
            } else if (!$.mooValidation.validateNumeric(sString)) {
                bReturn = false;
            } else if (!$.mooValidation.validateLuhn(sString)) {
                bReturn = false;
            }
            return bReturn;
        },

        validateLuhn:function (sString) {
            if (sString.length > 19) {
                return (false);
            }

            sum = 0;
            mul = 1;
            l = sString.length;
            for (i = 0; i < l; i++) {
                digit = sString.substring(l - i - 1, l - i);
                tproduct = parseInt(digit, 10) * mul;
                if (tproduct >= 10) {
                    sum += (tproduct % 10) + 1;
                }
                else {
                    sum += tproduct;
                }
                if (mul == 1) {
                    mul++;
                } else {
                    mul--;
                }
            }
            if ((sum % 10) == 0) {
                return (true);
            } else {
                return (false);
            }
        },

        /**
         * Validate a phone number according to the regular expression provided
         * within the function.  This method should cover all variants of phone numbers
         * including a leading +, using brackets, using a - in between segments,
         * or just a series of numbers.
         * You can also have an ext 123 if you so desire, seeing as I'm nice like that
         *
         * @param sString The phone number being validated
         *
         * @return boolean whether or not this phone number is valid
         */
        validatePhone:function (sString, empty_is_valid) {
            //Empty string is not a valid phone number
            if (empty_is_valid == true && sString == "") {
                return true;
            } else if (sString == "") {
                return false;
            }

            var phoneRegEx = "^((\\+[0-9]{1,3}(-| )?\\(?[0-9]\\)?(-| )?[0-9]{1,5})|(\\(?[0-9]{2,6}\\)?))(-| )?([0-9]{3,4})(-| )?([0-9]{3,4})(( x| ext)\d{1,5}){0,1}$";
            var oRegEx = new RegExp(phoneRegEx);
            if (oRegEx.test(sString)) {
                return true;
            } else {
                return false;
            }
        },

        /**
         * Validate a phone number according to the regular expression provided
         * This will accept anything that's valid in a tel: url, though it does NOT include the tel:
         *
         * @param sString The phone number being validated
         *
         * @return boolean whether or not this phone number is valid
         */
        validateTel:function (sString, empty_is_valid) {
            //Empty string is not a valid phone number
            if (empty_is_valid == true && sString == "") {
                return true;
            } else if (sString == "") {
                return false;
            }

            // Lifted from http://www.catswhocode.com/blog/10-regular-expressions-for-efficient-web-development
            var phoneRegEx = "^((?:\\+[\\d().-]*\\d[\\d().-]*|[0-9A-F*#().-]*[0-9A-F*#][0-9A-F*#().-]*(?:;[a-z\\d-]+(?:=(?:[a-z\\d\\[\\]\\/:&+$_!~*'().-]|%[\\dA-F]{2})+)?)*;phone-context=(?:\\+[\\d().-]*\\d[\\d().-]*|(?:[a-z0-9]\\.|[a-z0-9][a-z0-9-]*[a-z0-9]\\.)*(?:[a-z]|[a-z][a-z0-9-]*[a-z0-9])))(?:;[a-z\\d-]+(?:=(?:[a-z\\d\\[\\]\\/:&+$_!~*'().-]|%[\\dA-F]{2})+)?)*(?:,(?:\\+[\\d().-]*\\d[\\d().-]*|[0-9A-F*#().-]*[0-9A-F*#][0-9A-F*#().-]*(?:;[a-z\\d-]+(?:=(?:[a-z\\d\\[\\]\\/:&+$_!~*'().-]|%[\\dA-F]{2})+)?)*;phone-context=\\+[\\d().-]*\\d[\\d().-]*)(?:;[a-z\\d-]+(?:=(?:[a-z\\d\\[\\]\\/:&+$_!~*'().-]|%[\\dA-F]{2})+)?)*)*)$";

            var oRegEx = new RegExp(phoneRegEx);
            if (oRegEx.test(sString)) {
                return true;
            } else {
                return false;
            }
        },

        /* 
         * Our addresses come in a pretty standard format,
         * and all have the same validation
         * in some places we use slightly different names
         * but they are ALL THE SAME.
         * Therefore, here is one function to validate them all!
         * 
         * @param firstNameId The ID of the field containing the first name
         * @param lastNameId The ID of the field containing the last name
         * @param companyNameId The ID of the field containing the company name
         * @param address1Id The ID of the field containing the first address line
         * @param address2Id The ID of the field containing the second address line
         * @param address3Id The ID of the field containing the third address line
         * @param townId The ID of the field containing the town
         * @param postcodeId The ID of the field containing the postcode
         * @param (optional) phoneId The ID of the field containing the phone
         * @param (optional) countryId The ID of the field containing the country
         * @param (optional) stateId The ID of the field containing the state
         * @param (optional) modifier The modifier to add to the field ID for when there are multiple address forms on the page (i.e "_#ADDRESSID#)
         * 
         */
        validateFullAddress:function (firstNameId, lastNameId, companyNameId, address1Id, address2Id, address3Id, townId, postcodeId, phoneId, countryId, stateId, modifier) {

            var bHasErrors = false;

            // if there is no modifier, make it an empty string
            if (typeof(modifier) == 'undefined' || modifier == null) {
                modifier = '';
            }

            if (!$.mooValidation.validateString($(firstNameId + modifier).val())) {
                $.fn.mooLogJsError.addFailure(firstNameId, 'addressvalidation001', stringCart0011, 'modifier: ' + modifier + ' First Name: ' + $(firstNameId + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringCart0011, $(firstNameId + modifier));
                bHasErrors = true;
            }

            if (!$.mooValidation.validateString($(lastNameId + modifier).val())) {
                $.fn.mooLogJsError.addFailure(lastNameId, 'addressvalidation002', stringCart0012, 'modifier: ' + modifier + ' Last Name: ' + $(lastNameId + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringCart0012, $(lastNameId + modifier));
                bHasErrors = true;
            }

            if (!$.mooValidation.validateNameStringLength($(firstNameId + modifier).val(), $(lastNameId + modifier).val())) {
                $.fn.mooLogJsError.addFailure(firstNameId, 'addressvalidation003', stringLengthName, 'modifier: ' + modifier + 'Full Name: ' + $(firstNameId + modifier).val() + ' ' + $(lastNameId + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringLengthName, $(firstNameId + modifier));
                bHasErrors = true;
            }
            if (!$.mooValidation.validateAddressStringLength($(companyNameId + modifier).val())) {
                $.fn.mooLogJsError.addFailure(companyNameId, 'addressvalidation04', stringLengthCompanyName, 'modifier: ' + modifier + ' Company Name: ' + $(companyNameId + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringLengthCompanyName, $(companyNameId + modifier));
                bHasErrors = true;
            }
            if (!$.mooValidation.validateString($(address1Id + modifier).val())) {
                $.fn.mooLogJsError.addFailure(address1Id, 'addressvalidation005', string00013_as, 'modifier: ' + modifier + ' Address1: ' + $(address1Id + modifier).val());
                $.mooValidation.showInLineErrorAbove(string00013_as, $(address1Id + modifier));
                bHasErrors = true;
            }
            if (!$.mooValidation.validateAddressStringLength($(address1Id + modifier).val())) {
                $.fn.mooLogJsError.addFailure(address1Id, 'addressvalidation006', stringLengthAddress1, 'modifier: ' + modifier + 'Address1: ' + $(address1Id + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringLengthAddress1, $(address1Id + modifier));
                bHasErrors = true;
            }
            if (!$.mooValidation.validateAddressStringLength($(address2Id + modifier).val())) {
                $.fn.mooLogJsError.addFailure(address2Id, 'addressvalidation007', stringLengthAddress2, 'modifier: ' + modifier + 'Address2: ' + $(address2Id + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringLengthAddress2, $(address2Id + modifier));
                bHasErrors = true;
            }
            if (!$.mooValidation.validateAddressStringLength($(address3Id + modifier).val())) {
                $.fn.mooLogJsError.addFailure(address3Id, 'addressvalidation008', stringLengthAddress3, 'modifier: ' + modifier + 'Address3: ' + $(address3Id + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringLengthAddress3, $(address3Id + modifier));
                bHasErrors = true;
            }
            if (!$.mooValidation.validateString($(townId + modifier).val())) {
                $.fn.mooLogJsError.addFailure(townId, 'addressvalidation009', string00014_as, 'modifier: ' + modifier + ' TownCity: ' + $(townId + modifier).val());
                $.mooValidation.showInLineErrorAbove(string00014_as, $(townId + modifier));
                bHasErrors = true;
            }
            if (!$.mooValidation.validateAddressStringLength($(townId + modifier).val())) {
                $.fn.mooLogJsError.addFailure(townId, 'addressvalidation010', stringLengthTown, 'modifier: ' + modifier + 'TownCity: ' + $(townId + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringLengthTown, $(townId + modifier));
                bHasErrors = true;
            }
            if (!$.mooValidation.validatePostcodeStringLength($(postcodeId + modifier).val())) {
                $.fn.mooLogJsError.addFailure(postcodeId, 'addressvalidation011', stringLengthPostcode, 'modifier: ' + modifier + ' Postcode: ' + $(postcodeId + modifier).val());
                $.mooValidation.showInLineErrorAbove(stringLengthPostcode, $(postcodeId + modifier));
                bHasErrors = true;
            }
            // if the phone field is present, then it is required
            if (typeof(phoneId) != 'undefined' && phoneId != null && $(phoneId + modifier)[0]) {
                if (!$.mooValidation.validatePhoneStringLength($(phoneId).val())) {
                    $.fn.mooLogJsError.addFailure(phoneId, 'addressvalidation013', stringLengthPhone, 'modifier: ' + modifier + ' Phone did not validatePhoneStringLength: ' + $(phoneId + modifier).val());
                    $.mooValidation.showInLineErrorAbove(stringLengthPhone, $(phoneId + modifier));
                    bHasErrors = true;
                }
                if (!$.mooValidation.validatePhone($(phoneId + modifier).val())) {
                    $.fn.mooLogJsError.addFailure(phoneId, 'addressvalidation014', stringCart0026, 'modifier: ' + modifier + ' Phone did not validatePhone: ' + $(phoneId + modifier).val());
                    $.mooValidation.showInLineErrorAbove(stringCart0026, $(phoneId + modifier));
                    bHasErrors = true;
                }

            }

            // Country and State Validation.
            // If we pass a country and state ID we automatically do some additional magic
            // if the country field is present, then it is required and must not be hyphens
            if (typeof(countryId) != 'undefined' && countryId != null && $(countryId + modifier)[0]) {
                if (!$.mooValidation.validateString($(countryId + modifier).val()) || $(countryId + modifier).val() == '---') {
                    $.fn.mooLogJsError.addFailure(countryId, 'addressvalidation015', string00008_as, 'modifier: ' + modifier + 'Country: ' + $(countryId + modifier).val());
                    $.mooValidation.showInLineErrorAbove(string00008_as, $(countryId + modifier));
                    bHasErrors = true;
                }

                // if the state field is present, then it is required and must not be hyphens
                // the state has an additional part on the end of the id which is the country
                var country = $(countryId + modifier).val();
                if (typeof(stateId) != 'undefined' && stateId != null && $(stateId + country + modifier)[0]) {
                    if (!$.mooValidation.validateString($(stateId + country + modifier).val()) || $(stateId + country + modifier).val() == '--') {
                        $.fn.mooLogJsError.addFailure(stateId, 'addressvalidation016', string00009_as, 'modifier: ' + modifier + ' State: ' + $(stateId + country + modifier).val());
                        $.mooValidation.showInLineErrorAbove(string00009_as, $(stateId + country + modifier));
                        bHasErrors = true;
                    }
                }
            }

            if (bHasErrors) {
                return false;
            } else {
                return true;
            }
        },

        /**
         * Inserts error text before the element id passed in
         * If we do end up with tooltips, they will need rewriting
         * in jquery and replacing this
         *
         * @param sErrorText the text of the error message to show
         * @param el the element or selector to insert before, like '.class' or '#id'
         * TODO: rewrite this as a proper plugin function of the form
         * $.fn.mooValidation.showIn
         *
         */
        showInLineErrorAbove:function (sErrorText, el, options) {
            //as el could be an actual element rather than one than a jQuery collection we are going to make a $el which we know is jquery
            var $el = $(el);

            if ($el.is('select.jNiceHidden')) {
                var tip_class = $.mooValidation.getTipClass($el.attr('class').split(' '));
                $el = $el.closest('div.jNiceSelectWrapper');
                $el.addClass(tip_class);

                if (typeof(options) == "undefined") {
                    options = {
                        offsets:[6, 28, 6, 20]
                    };
                }
            }
            var $error = $("<div class='nice-error-message'>" + sErrorText + "</div>").insertBefore($el);

            $el.mooFieldErrorMessage(options);

        },
        getTipClass:function (classes) {
            for (var i in classes) {
                if (classes[i].match(/tip-/)) {
                    return classes[i];
                }
            }
            return false;
        }
    };
})(jQuery);


/* Included from: /javascript/jquery/jquery.moo.overlay.js */

/**
 * The Moo Overlay plugin for jQuery.tools Overlay
 * http://flowplayer.org/tools/overlay/index.html
 *
 * We're wrapping the plugin here to set a few default options and make it
 * easier for other devs to make overlays the moo way.
 *
 * You get this for free like so:
 * <a rel="#divAddProfileDialog" class="moo-overlay" href="#">{l}cancel{/l}</a>
 * Where #divAddProfileDialog is a jQuery selector for a div that exists on
 * the page that is used to fill the overlay
 *
 * The close X link in the top corner is added by the jquery plugin,
 * if you don't want it you will have to remove it yourself (see shipping-options.js).
 *
 * If you want any other close links in the overlay, you need to a) add
 * <a class="close"></a>
 * as the first element in your overlay div and
 * b) use class="close" on the containing element of your other close links
 *
 * You can also add overlays from the JS by using the overlay().load() and
 * overlay.close() methods.
 *
 * If you want to load your lightbox content in from an external page, you'll need to
 * have a single container div within your overlay div, and define the href of your trigger
 * as the url you want to load content from. Doing this will magically load the content in,
 * unless href is undefined or is just set to '#'.
 */

    //ensure that as we are passing though jQuery we know that nomatter what all this stuff will work even if we have
    //prototype being included too.
(function ($) {
    /**
     * debug functions borrowed from cycle >:)
     */
    function _debug(s) {
        if ($.fn.mooOverlay.debug) {
            _log(s);
        }
    }

    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooOverlay] " + Array.prototype.join.call(arguments, " "));
        }
    }

    //The moo overlay wrapper for Overlay.
    $.fn.mooOverlay = function (options, afterAjaxSuccess) {


        //maintain chainability
        //now we can do $('#myDiv').css(blah).mooOverlay(); and so on
        return this.each(function () {

            var $this = $(this);
            //set our default settings that we like.
            var settings = {

                onBeforeLoad:function (event) {
                    //if the href is set and is not just a '#'  load external content into a container div within the overlay, 
                    //displaying a loading 'spinner' while we're fetching the content
                    if (typeof(this.getTrigger().attr('href')) != 'undefined' && this.getTrigger().attr('href').substr(0, 1) != '#') {
                        var overlay = this.getOverlay();
                        var trigger = this.getTrigger();
                        var overlayPlugin = this;
                        $.ajax({
                            url:trigger.attr('href'),
                            dataType:'html',
                            beforeSend:function () {
                                overlay.find('div').html('');
                                overlay.css({
                                    'background-image':"url('/images/spinner-moo-large.gif')",
                                    'background-repeat':'no-repeat',
                                    'background-position':'center center'
                                });
                            },
                            complete:function () {
                                overlay.css({
                                    'background-image':'',
                                    'background-repeat':'',
                                    'background-position':''
                                });
                            },
                            success:function (data) {
                                overlay.find('div').html(data);
                                if (afterAjaxSuccess && typeof(afterAjaxSuccess) == 'function') {
                                    afterAjaxSuccess(overlayPlugin);
                                }
                            }
                        });
                    } else {
                    }
                    //Fix the z-index for IE7, and enable the plugin to position the overlay correctly
                    this.getOverlay().appendTo('body');

                },

                // some mask tweaks suitable for facebox-looking dialogs
                mask:{
                    // load mask a little faster
                    loadSpeed:200,
                    color:'#0a0a0a',
                    opacity:0.3
                },

                // disable this for modal dialog-type of overlays
                closeOnClick:false,

                //  do not load it immediately after the construction
                load:false,

                //not fixed position! Otherwise we can't scroll to bigger ones
                fixed:false

            };

            //override our defaults with options (if they are given)
            if (options) {
                $.extend(settings, options);
            }

            var overlay = $(this).overlay(settings);
        });
    };


    //set up the function on all "moo-overlay" links
    $(function () {

        if ($('.moo-overlay')[0]) {
            _debug('setting up .moo-overlay links');
            var settings = {};
            $('.moo-overlay').mooOverlay(settings);

            //Add our styling class to each div requiring it
            $(".moo-overlay").each(function () {
                var targetSelector = jQuery(this).attr('rel');
                $(targetSelector).addClass('moo-overlay-container');
            });
        }
    });

})(jQuery);


/* Included from: /javascript/jquery/jquery.moo.tooltip.js */

/**
 * Moo Tooltip plugin handles
 * The question mark tool tips + possibliy others as well a tool tip is a tooltip.
 *
 */

    //ensure that as we are passing though jQuery we know that nomatter what all this stuff will work even if we have
    //prototype being included too.
(function ($) {
    /**
     * debug functions borrowed from cycle >:)
     */
    function _debug(s) {
        if ($.fn.mooQuestionToolTip.debug) {
            _log(s);
        }
    }

    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooToolTip] " + Array.prototype.join.call(arguments, " "));
        }
    }

    $.fn.mooToolTipPosition = function (element, offsets) {
        if (typeof (offsets) === 'undefined' || offsets.length !== 4) {
            offsets = [0, 10, 10, 25];
        }

        var $this = $(element), position = 'center right', offset = [offsets[0], offsets[1]], tipPosition = 'right';
        //set our default settings that we like.
        //TODO make position and offset correct for the possition given by the target

        if ($this.hasClass('tip-left')) {
            position = 'center left';
            tipPosition = 'left';
            offset = [offsets[0], -offsets[1]];
        } else if ($this.hasClass('tip-right')) {
            position = 'center right';
            tipPosition = 'right';
            offset = [offsets[0], offsets[1]];
        } else if ($this.hasClass('tip-top')) {
            position = 'top center';
            tipPosition = 'top';
            offset = [-offsets[1], offsets[0]];
        } else if ($this.hasClass('tip-bottom')) {
            position = 'bottom center';
            tipPosition = 'bottom';
            offset = [offsets[1], offsets[0]];
        } else if ($this.hasClass('tip-top-right')) {
            position = 'top right';
            tipPosition = 'top-right';
            offset = [-offsets[2], -offsets[3]];
        } else if ($this.hasClass('tip-top-left')) {
            position = 'top left';
            tipPosition = 'top-left';
            offset = [-offsets[2], offsets[3]];
        } else if ($this.hasClass('tip-bottom-right')) {
            position = 'bottom right';
            tipPosition = 'bottom-right';
            offset = [offsets[2], -offsets[3]];
        } else if ($this.hasClass('tip-bottom-left')) {
            tipPosition = 'bottom-left';
            position = 'bottom left';
            offset = [offsets[2], offsets[3]];
        }

        return {'tipPosition': tipPosition, 'position': position, 'offset': offset};
    };

    $.fn.mooRemoveToolTip = function (parent) {
        $('.question-tooltip', parent).remove();
    };

    $.fn.mooRepositionToolTip = function () {
        return this.each(function () {
            var $tooltip = $(this).tooltip();
            if ($tooltip.isShown(true) === true) {
                $tooltip.hide();
                $tooltip.show();
            }
        });
    };

    //The moo QuestionToolTip wrapper for tooltip.
    $.fn.mooQuestionToolTip = function (options) {

        if (typeof (options) === "undefined") {
            options = {};
        }

        //maintain chainability
        //now we can do $('#myDiv').css(blah).mooTool(); and so on
        return this.each(function () {
            if (typeof (options.offsets) === 'undefined' || options.offsets.length !== 4) {
                options.offsets = [0, 10, 10, 25];
            }
            var position_data = $.fn.mooToolTipPosition(this, options.offsets);

            var settings = {
                tipClass:   'question-tooltip',
                position:   position_data.position,
                offset:     position_data.offset,
                relative:   true,
                delay:      50,
                onShow:     function () {
                    if ($('.tooltip-stem', this.getTip()).length === 0) {
                        this.getTip().addClass(position_data.tipPosition).prepend('<span class="tooltip-stem"/>');
                    }
                }
            };

            //override our defaults with options (if they are given)
            if (options) {
                $.extend(settings, options);
            }

            $(this).tooltip(settings);
        });
    };

    // "Subclass" mooQuestionTooltip to provide white previews.
    // This is mostly a case of providing slightly different css definitions.
    $.fn.mooPreviewToolTip = function (options) {

        return this.each(function () {
            var previewSettings = {
                tipClass: 'preview-tooltip'
            };

            if (options) {
                $.extend(previewSettings, options);
            }
            $(this).mooQuestionToolTip(previewSettings);
        });
    };

    //set up the function on all "moo-overlay" links
    $(function () {
        $('.question-tooltip-trigger').mooQuestionToolTip();
        $('.preview-tooltip-trigger').mooPreviewToolTip();
    });

}(jQuery));

/* Included from: /javascript/jquery/jquery.moo.errormessage.js */

/**
 * Moo Error Message plugin handles
 * Transforming error messages on forms and making them styled correctly next to the incorrect field
 * also used by javascript to raise errors.
 *
 */

    //ensure that as we are passing though jQuery we know that nomatter what all this stuff will work even if we have
    //prototype being included too.
(function ($) {

    /**
     * debug functions borrowed from cycle >:)
     */
    function _debug(s) {
        if ($.fn.mooFieldErrorMessage.debug) {
            _log(s);
        }
    }

    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooFieldError] " + Array.prototype.join.call(arguments, " "));
        }
    }

    var mooFieldErrorSettings = {
        "nextSelector": ':input'
    };

    $.fn.mooFieldErrorMessage = function (options) {
        if (typeof (options) === "undefined") {
            options = {};
        }

        options = $.extend(mooFieldErrorSettings, options);

        //maintain chainability
        //now we can do $('#myDiv').css(blah).mooTool(); and so on

        return this.each(function () {
            //first of all find any P tags that preceded me

            var $tip, $elToTip;
            if ($(this).is('.nice-error-message')) {
                $tip = $(this);
                $elToTip = $tip.next(options.nextSelector);
            } else {
                $tip = $(this).prevAll('.nice-error-message').first();
                $elToTip = $(this);
            }

            $tip = $tip.wrap('<div class="error"/>').parent();
            $tip.prevAll('.nice-error-message').appendTo($tip);

            $('.nice-error-message', $tip).removeClass('nice-error-message').addClass('no-margin').addClass('no-padding');
            //we want to be able to replace tool tips even if other code removed the actual tip
            //as such we are going to nuke the data and start again.
            //there might be a nicer way to do this.. but being an error tooltip I don't expect they will always live for ages.
            if ($elToTip.data("tooltip")) {
                //was aleady a tooltip.. so gonna nuke it to start again
                $elToTip.removeData("tooltip");
            }

            if ($tip[0] && $elToTip[0]) {
                $tip.addClass('question-tooltip');

                if (typeof (options.offsets) === 'undefined' || options.offsets.length !== 4) {
                    options.offsets = [0, 28, 0, 10];
                }

                var settings = {
                    tip:        $tip,
                    relative:   true,
                    delay:      50,
                    events: {
                        def:     "none,none",   // default show/hide events for an element
                        input:   "none,none",   // for all input elements
                        widget:  "none,none",   // select, checkbox, radio, button
                        tooltip: "none,none"    // the tooltip element
                    }
                };

                //override our defaults with options (if they are given)
                if (options) {
                    $.extend(settings, options);
                }

                $elToTip.mooQuestionToolTip(settings);

                $elToTip.tooltip().show();
                $elToTip.addClass('error-tooltip-trigger');
            }
        });
    };


    /**
     * Makes the screen scroll to the uppermost validation error
     */
    $.fn.scrollToUppermostError = function () {
        var interval = setInterval(function () {
            // wait for them to be displayed to scroll to the uppermost one
            if ($('div.error')[0] && $('div.error').css('display') !== 'none') { // added [0] check for existence otherwise this is true
                $('html, body').animate({
                    scrollTop: $('div.error').offset().top
                }, 1000);
                // we have scrolled, stop checking
                clearInterval(interval);
            }
        }, 500);
    };

    $.fn.mooRemoveErrorMessages = function (parent) {
        $('.error.question-tooltip', parent).remove();
    };

    $.fn.mooRepositionErrorMessages = function (parent) {
        $('.error-tooltip-trigger', parent).mooRepositionToolTip();
    };

    $(function () {
        //first collect any .nice-error-messages into one message

        $('.nice-error-message').siblings(':input').mooFieldErrorMessage({
            'offsets': [0, 38, 0, 10]
        });
        $('.nice-error-message').siblings('div.jNiceSelectWrapper').mooFieldErrorMessage({
            'offsets': [10, 40, 0, 0]
        });
    });

}(jQuery));


/* Included from: /javascript/footer.js */

jQuery(function ($) {
    // little moo drop
    $('#divCompanyInfo address').mouseover(function () {
        //jQuery.delay() doesn't work on non-animated elements unless you add them to the fx queue,
        //which is the reason for the dequeue() also
        //Show the fun message after 5 seconds of hovering over the address
        $('#spnMOODropletBox').delay(5000).queue(function () {
            $(this).show();
            $(this).dequeue();
        });
    });

    $('.moo-droplet').click(function () {
        //Also show message if droplet is clicked
        $('#spnMOODropletBox').show();
    });

    $('#divCompanyInfo address').mouseout(function () {
        //Remove the tooltip with the message
        $('#spnMOODropletBox').hide();
        $('#spnMOODropletBox').clearQueue();
        //Set the droplet to be the face
        //$('.theme-green .moo-droplet').css('background', 'url("/images/moodroplet/moo-droplet-face-green.gif") no-repeat scroll 0 -1px transparent');
        //$('.theme-orange .moo-droplet').css('background', 'url("/images/moodroplet/moo-droplet-face-orange.gif") no-repeat scroll 0 -1px transparent');
    });
});



/* Included from: /javascript/jquery/jquery.moo.spinuntilloaded.js */

/**
 * jQuery plugin that allows images to show a spinner loading gif until
 * they are loaded.
 *
 * # Dependencies:
 *  /jquery/jquery-1.4.2.min.js
 *  /images/35px_spinner.gif
 *  /images/80px_spinner.gif
 *  /images/1px_transparent.gif
 *
 * # Usage:
 *  ## As this file is loaded into core.js, you can add the
 *     class 'spin-until-loaded' to an image and it should
 *     'just work'. This is the preferred way of using this
 *     plugin.
 *  ## For imgs you specifically want to spin until loaded:
 *     $('thumbnail-selector img').spinUntilLoaded();
 */
(function ($) {
    /**
     * Display 35px spinner for small + medium
     * 80px spinner for large thumbnails
     */
    var spinnerImageFilename = function (width) {
        var intWidth = parseInt(width);
        if (intWidth <= 290) {
            return '/images/35px_spinner.gif';
        } else {
            return '/images/80px_spinner.gif';
        }
    }

    /**
     * Make a thumbnail image spin on it until loaded
     */
    $.fn.spinUntilLoaded = function () {
        return this.each(function (options) {
            //decide which spinny image we're going to use
            var spinnerFilename = spinnerImageFilename($(this).attr('width'));

            var thumbnailSource = $(this).attr('src');
            var placeHolderSource = '/images/1px_transparent.gif';

            $(this).load(function () {
                if ($(this).attr('src') == placeHolderSource) {

                    $(this).css('background', 'url(' + spinnerFilename + ') no-repeat center #fff');

                    //switch the thumbnail source so we load in the image and the next time
                    //this event is fired, we clear the background image
                    $(this).attr('src', thumbnailSource);

                } else if ($(this).attr('src') == thumbnailSource) {
                    $(this).css('background', '');
                }
            });

            //swap out the image for the transparent gif
            $(this).attr('src', placeHolderSource);
        });
    }

    $(function () {
        $('img.spin-until-loaded').spinUntilLoaded();
    });

})(jQuery);


/* Included from: /javascript/jquery/jquery.moo.globalerrorhandler.js */

/* 
 * MOO global error handler
 * 
 * This global error handler defines the error type and course of action
 * which should be taken in the event of specific errors. An example of this
 * is CSRF validation which will be called on all ajax requests. If it fails
 * then we want to display a pop up no matter what the situation. 
 *
 * By making the error handler specific to http status code and status text, it 
 * should reduce the likelyhood of it being overriden in other javascript files.
 * 
 * Usage:
 * - include in all pages that use ajax
 * - add the error that you want to be caught (be as specific as possible) 
 * - that's pretty much it! it will catch any errors that need to be caught 
 *   and dealt with on all pages 
 */

(function ($) {
    //set up the generic error handler. This should define all the situations where an
    //error needs to be handled on a global level
    $(function () {
        $('html').ajaxError(function (e, jqxhr, settings, exception) {
            if (jqxhr.status == 403 && jqxhr.statusText == 'CSRF Authentication') {
                $.fn.mooGlobalErrorHandler.displayErrorOverlay(stringCart0030);
            }
        });
    });

    /**
     * MOO global Error Handler plugin
     */
    $.fn.mooGlobalErrorHandler = {
        /**
         * Defines the overlay that we will use to display error messages
         */
        _errorMessageOverlay:$('<div id="errorMessageOverlay" class="moo-overlay-container"><p class="global-error-message"></p></div>')
            .mooOverlay({ fixed:true, closeOnClick:false, load:false }),

        /**
         * Displays an error message on an overlay
         *
         * @param {string} message that is to be displayed on the error message
         */
        displayErrorOverlay:function (message) {
            //load the error box
            $.fn.mooGlobalErrorHandler._errorMessageOverlay.find('a.close').remove();
            $.fn.mooGlobalErrorHandler._errorMessageOverlay.addClass('sadMoo')
                .find('p.global-error-message')
                .html(stringCart0030);
            $.fn.mooGlobalErrorHandler._errorMessageOverlay.find('a.refresh').click(function (e) {
                e.preventDefault();
                location.reload();
            });
            $.fn.mooGlobalErrorHandler._errorMessageOverlay.overlay().load();

        }
    }

})(jQuery);

/* Included from: /javascript/jquery/jquery.moo.ajaxFormTokenManager.js */

/* 
 * MOO AjaxFormTokenManager
 *
 * Ensures that all ajax requests have a form token
 * Extends the default jQuery ajax method
 *
 * Note: jquery.moo.globalerrorhandler.js also sets the ajaxError method - i.e. sets a default behaviour for errors
 * and therefore also changes the defaul jQuery ajax behaviour
 * 
 * Usage:
 * - include in core
 * - any ajax requests you make will have a formToken set ont hem
 */

(function ($) {

    /**
     * debug functions borrowed from cycle >:)
     */
    function _debug(s) {
        if ($.mooAjaxFormTokenManager.debug) {
            _log(s);
        }
    }

    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooAjaxFormTokenManager] " + Array.prototype.join.call(arguments, " "));
        }
    }

    // keep track of the original ajax function so we can use it later...
    var old_$ajax = $.ajax;

    /**
     * Extend the jquery ajax so that we can only do an ajax call once the form token is set.
     * If no formToken is available, we wait for the event which tells us it is ready.
     */
    $.extend({
        ajax:function (s) {
            _debug('New ajax call: ' + s.url);
            // if we have no data or have no formToken, and this is not the formToken request...
            if ((typeof s.data == 'undefined' || s.data == null
                || typeof s.data.formToken == 'undefined' || s.data.formToken == "")
                && s.url != $.mooAjaxFormTokenManager.getFormTokenRequestURL()) {
                _debug('Missing formToken...');
                // we need to bind ourself to the formTokenReady event
                $(document).bind('mooFormTokenReady.mooAjaxFormTokenManager', {s:s}, function (e) {
                    _debug('formToken is ready: ' + s.url);
                    $(this).unbind(e);
                    return old_$ajax.call(this, s);
                });

                // now that we've bound to the event, try to get the token - this handles fetching a token from the page
                // or from a request if needs be - either way the event gets thrown.
                $.mooAjaxFormTokenManager.getFormToken();

            } else {
                if (s.url == $.mooAjaxFormTokenManager.getFormTokenRequestURL()) {
                    _debug('Letting the formTokenRequest carry on...');
                }

                return old_$ajax.call(this, s);
            }
        }
    });

    /**
     * mooAjaxFormTokenManager plugin handles management of getting, fetching and setting a form token
     * So that we can be sure we always have one
     */
    $.mooAjaxFormTokenManager = {
        debug:false,
        formTokenRequestInProgress:false,
        getFormTokenRequestURL:function () {
            var path = window.location.protocol == 'https:' ? pageData.secureServer : pageData.wwwServer;
            return path + '/ajaxrequests/get_form_token.php';
        },
        /**
         * Try to get the form token from the page, if it is present, call setFormToken
         * else call fetchFormToken which will call setFormToken on success
         */
        getFormToken:function () {
            _debug('Getting form token');
            var formToken = $('input[name=formToken]').val();
            if (formToken == "" || $.cookie('PHPSESSID') == null) {
                $.mooAjaxFormTokenManager.fetchFormToken();
            } else {
                $.mooAjaxFormTokenManager.setFormToken(formToken);
            }
        },
        /**
         * Go fetch the form token from the server
         * calls setFormToken on success or throws an error
         */
        fetchFormToken:function () {
            if (!$.mooAjaxFormTokenManager.formTokenRequestInProgress) {
                _debug('off to fetch a form token...');
                $.mooAjaxFormTokenManager.formTokenRequestInProgress = true;
                // setup our ajax call,
                $.ajax({
                    url:$.mooAjaxFormTokenManager.getFormTokenRequestURL(),
                    type:'POST',
                    dataType:'html',
                    async:true,
                    success:$.mooAjaxFormTokenManager.setFormToken,
                    error:function (jqXHR, textStatus, response) {
                        _debug('Failure: ' + response);
                        $.fn.mooGlobalErrorHandler.displayErrorOverlay(stringCart0030);
                        throw new Error("Fetch CSRF Form Token Failure: " + response);
                    },
                    complete:function () {
                        $.mooAjaxFormTokenManager.formTokenRequestInProgress = false;
                    }
                });
            }
        },
        /**
         * Take a form token and ensure it is set everywhere it is needed
         * @param data string form token
         */
        setFormToken:function (data) {
            _debug('Setting form token: ' + data);
            $('input[name=formToken]').val(data);
            jQuery.ajaxSetup({
                data:{
                    formToken:data
                }
            });
            _debug('ajax is setup...');
            $(document).trigger('mooFormTokenReady.mooAjaxFormTokenManager');
        }
    };

    /**
     * Autorun this when the page has loaded the form token so that in the majority of cases, everything is
     * setup and ready to go before any other ajax events fire
     */
    $('#mooFormToken').ready(function () {
        $.mooAjaxFormTokenManager.getFormToken();
    });
})(jQuery);

/* Included from: /javascript/swfobject.js */

/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
 is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
var swfobject = function () {
    var D = "undefined", r = "object", S = "Shockwave Flash", W = "ShockwaveFlash.ShockwaveFlash", q = "application/x-shockwave-flash", R = "SWFObjectExprInst", x = "onreadystatechange", O = window, j = document, t = navigator, T = false, U =
        [h], o = [], N = [], I = [], l, Q, E, B, J = false, a = false, n, G, m = true, M = function () {
        var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D, ah = t.userAgent.toLowerCase(), Y = t.platform.toLowerCase(), ae = Y ? /win/.test(Y) : /win/.test(ah), ac = Y ? /mac/.test(Y) : /mac/.test(ah), af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, X = !+"\v1", ag =
            [0, 0, 0], ab = null;
        if (typeof t.plugins != D && typeof t.plugins[S] == r) {
            ab = t.plugins[S].description;
            if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
                T = true;
                X = false;
                ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
                ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
            }
        } else {
            if (typeof O.ActiveXObject != D) {
                try {
                    var ad = new ActiveXObject(W);
                    if (ad) {
                        ab = ad.GetVariable("$version");
                        if (ab) {
                            X = true;
                            ab = ab.split(" ")[1].split(",");
                            ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                        }
                    }
                } catch (Z) {
                }
            }
        }
        return{w3:aa, pv:ag, wk:af, ie:X, win:ae, mac:ac}
    }(), k = function () {
        if (!M.w3) {
            return
        }
        if ((typeof j.readyState != D && j.readyState == "complete") || (typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body))) {
            f()
        }
        if (!J) {
            if (typeof j.addEventListener != D) {
                j.addEventListener("DOMContentLoaded", f, false)
            }
            if (M.ie && M.win) {
                j.attachEvent(x, function () {
                    if (j.readyState == "complete") {
                        j.detachEvent(x, arguments.callee);
                        f()
                    }
                });
                if (O == top) {
                    (function () {
                        if (J) {
                            return
                        }
                        try {
                            j.documentElement.doScroll("left")
                        } catch (X) {
                            setTimeout(arguments.callee, 0);
                            return
                        }
                        f()
                    })()
                }
            }
            if (M.wk) {
                (function () {
                    if (J) {
                        return
                    }
                    if (!/loaded|complete/.test(j.readyState)) {
                        setTimeout(arguments.callee, 0);
                        return
                    }
                    f()
                })()
            }
            s(f)
        }
    }();

    function f() {
        if (J) {
            return
        }
        try {
            var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
            Z.parentNode.removeChild(Z)
        } catch (aa) {
            return
        }
        J = true;
        var X = U.length;
        for (var Y = 0; Y < X; Y++) {
            U[Y]()
        }
    }

    function K(X) {
        if (J) {
            X()
        } else {
            U[U.length] = X
        }
    }

    function s(Y) {
        if (typeof O.addEventListener != D) {
            O.addEventListener("load", Y, false)
        } else {
            if (typeof j.addEventListener != D) {
                j.addEventListener("load", Y, false)
            } else {
                if (typeof O.attachEvent != D) {
                    i(O, "onload", Y)
                } else {
                    if (typeof O.onload == "function") {
                        var X = O.onload;
                        O.onload = function () {
                            X();
                            Y()
                        }
                    } else {
                        O.onload = Y
                    }
                }
            }
        }
    }

    function h() {
        if (T) {
            V()
        } else {
            H()
        }
    }

    function V() {
        var X = j.getElementsByTagName("body")[0];
        var aa = C(r);
        aa.setAttribute("type", q);
        var Z = X.appendChild(aa);
        if (Z) {
            var Y = 0;
            (function () {
                if (typeof Z.GetVariable != D) {
                    var ab = Z.GetVariable("$version");
                    if (ab) {
                        ab = ab.split(" ")[1].split(",");
                        M.pv = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                    }
                } else {
                    if (Y < 10) {
                        Y++;
                        setTimeout(arguments.callee, 10);
                        return
                    }
                }
                X.removeChild(aa);
                Z = null;
                H()
            })()
        } else {
            H()
        }
    }

    function H() {
        var ag = o.length;
        if (ag > 0) {
            for (var af = 0; af < ag; af++) {
                var Y = o[af].id;
                var ab = o[af].callbackFn;
                var aa = {success:false, id:Y};
                if (M.pv[0] > 0) {
                    var ae = c(Y);
                    if (ae) {
                        if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                            w(Y, true);
                            if (ab) {
                                aa.success = true;
                                aa.ref = z(Y);
                                ab(aa)
                            }
                        } else {
                            if (o[af].expressInstall && A()) {
                                var ai = {};
                                ai.data = o[af].expressInstall;
                                ai.width = ae.getAttribute("width") || "0";
                                ai.height = ae.getAttribute("height") || "0";
                                if (ae.getAttribute("class")) {
                                    ai.styleclass = ae.getAttribute("class")
                                }
                                if (ae.getAttribute("align")) {
                                    ai.align = ae.getAttribute("align")
                                }
                                var ah = {};
                                var X = ae.getElementsByTagName("param");
                                var ac = X.length;
                                for (var ad = 0; ad < ac; ad++) {
                                    if (X[ad].getAttribute("name").toLowerCase() != "movie") {
                                        ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value")
                                    }
                                }
                                P(ai, ah, Y, ab)
                            } else {
                                p(ae);
                                if (ab) {
                                    ab(aa)
                                }
                            }
                        }
                    }
                } else {
                    w(Y, true);
                    if (ab) {
                        var Z = z(Y);
                        if (Z && typeof Z.SetVariable != D) {
                            aa.success = true;
                            aa.ref = Z
                        }
                        ab(aa)
                    }
                }
            }
        }
    }

    function z(aa) {
        var X = null;
        var Y = c(aa);
        if (Y && Y.nodeName == "OBJECT") {
            if (typeof Y.SetVariable != D) {
                X = Y
            } else {
                var Z = Y.getElementsByTagName(r)[0];
                if (Z) {
                    X = Z
                }
            }
        }
        return X
    }

    function A() {
        return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312)
    }

    function P(aa, ab, X, Z) {
        a = true;
        E = Z || null;
        B = {success:false, id:X};
        var ae = c(X);
        if (ae) {
            if (ae.nodeName == "OBJECT") {
                l = g(ae);
                Q = null
            } else {
                l = ae;
                Q = X
            }
            aa.id = R;
            if (typeof aa.width == D || (!/%$/.test(aa.width) && parseInt(aa.width, 10) < 310)) {
                aa.width = "310"
            }
            if (typeof aa.height == D || (!/%$/.test(aa.height) && parseInt(aa.height, 10) < 137)) {
                aa.height = "137"
            }
            j.title = j.title.slice(0, 47) + " - Flash Player Installation";
            var ad = M.ie && M.win ? "ActiveX" : "PlugIn", ac = "MMredirectURL=" + O.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + ad + "&MMdoctitle=" + j.title;
            if (typeof ab.flashvars != D) {
                ab.flashvars += "&" + ac
            } else {
                ab.flashvars = ac
            }
            if (M.ie && M.win && ae.readyState != 4) {
                var Y = C("div");
                X += "SWFObjectNew";
                Y.setAttribute("id", X);
                ae.parentNode.insertBefore(Y, ae);
                ae.style.display = "none";
                (function () {
                    if (ae.readyState == 4) {
                        ae.parentNode.removeChild(ae)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            }
            u(aa, ab, X)
        }
    }

    function p(Y) {
        if (M.ie && M.win && Y.readyState != 4) {
            var X = C("div");
            Y.parentNode.insertBefore(X, Y);
            X.parentNode.replaceChild(g(Y), X);
            Y.style.display = "none";
            (function () {
                if (Y.readyState == 4) {
                    Y.parentNode.removeChild(Y)
                } else {
                    setTimeout(arguments.callee, 10)
                }
            })()
        } else {
            Y.parentNode.replaceChild(g(Y), Y)
        }
    }

    function g(ab) {
        var aa = C("div");
        if (M.win && M.ie) {
            aa.innerHTML = ab.innerHTML
        } else {
            var Y = ab.getElementsByTagName(r)[0];
            if (Y) {
                var ad = Y.childNodes;
                if (ad) {
                    var X = ad.length;
                    for (var Z = 0; Z < X; Z++) {
                        if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
                            aa.appendChild(ad[Z].cloneNode(true))
                        }
                    }
                }
            }
        }
        return aa
    }

    function u(ai, ag, Y) {
        var X, aa = c(Y);
        if (M.wk && M.wk < 312) {
            return X
        }
        if (aa) {
            if (typeof ai.id == D) {
                ai.id = Y
            }
            if (M.ie && M.win) {
                var ah = "";
                for (var ae in ai) {
                    if (ai[ae] != Object.prototype[ae]) {
                        if (ae.toLowerCase() == "data") {
                            ag.movie = ai[ae]
                        } else {
                            if (ae.toLowerCase() == "styleclass") {
                                ah += ' class="' + ai[ae] + '"'
                            } else {
                                if (ae.toLowerCase() != "classid") {
                                    ah += " " + ae + '="' + ai[ae] + '"'
                                }
                            }
                        }
                    }
                }
                var af = "";
                for (var ad in ag) {
                    if (ag[ad] != Object.prototype[ad]) {
                        af += '<param name="' + ad + '" value="' + ag[ad] + '" />'
                    }
                }
                aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + ">" + af + "</object>";
                N[N.length] = ai.id;
                X = c(ai.id)
            } else {
                var Z = C(r);
                Z.setAttribute("type", q);
                for (var ac in ai) {
                    if (ai[ac] != Object.prototype[ac]) {
                        if (ac.toLowerCase() == "styleclass") {
                            Z.setAttribute("class", ai[ac])
                        } else {
                            if (ac.toLowerCase() != "classid") {
                                Z.setAttribute(ac, ai[ac])
                            }
                        }
                    }
                }
                for (var ab in ag) {
                    if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
                        e(Z, ab, ag[ab])
                    }
                }
                aa.parentNode.replaceChild(Z, aa);
                X = Z
            }
        }
        return X
    }

    function e(Z, X, Y) {
        var aa = C("param");
        aa.setAttribute("name", X);
        aa.setAttribute("value", Y);
        Z.appendChild(aa)
    }

    function y(Y) {
        var X = c(Y);
        if (X && X.nodeName == "OBJECT") {
            if (M.ie && M.win) {
                X.style.display = "none";
                (function () {
                    if (X.readyState == 4) {
                        b(Y)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            } else {
                X.parentNode.removeChild(X)
            }
        }
    }

    function b(Z) {
        var Y = c(Z);
        if (Y) {
            for (var X in Y) {
                if (typeof Y[X] == "function") {
                    Y[X] = null
                }
            }
            Y.parentNode.removeChild(Y)
        }
    }

    function c(Z) {
        var X = null;
        try {
            X = j.getElementById(Z)
        } catch (Y) {
        }
        return X
    }

    function C(X) {
        return j.createElement(X)
    }

    function i(Z, X, Y) {
        Z.attachEvent(X, Y);
        I[I.length] = [Z, X, Y]
    }

    function F(Z) {
        var Y = M.pv, X = Z.split(".");
        X[0] = parseInt(X[0], 10);
        X[1] = parseInt(X[1], 10) || 0;
        X[2] = parseInt(X[2], 10) || 0;
        return(Y[0] > X[0] || (Y[0] == X[0] && Y[1] > X[1]) || (Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2])) ? true : false
    }

    function v(ac, Y, ad, ab) {
        if (M.ie && M.mac) {
            return
        }
        var aa = j.getElementsByTagName("head")[0];
        if (!aa) {
            return
        }
        var X = (ad && typeof ad == "string") ? ad : "screen";
        if (ab) {
            n = null;
            G = null
        }
        if (!n || G != X) {
            var Z = C("style");
            Z.setAttribute("type", "text/css");
            Z.setAttribute("media", X);
            n = aa.appendChild(Z);
            if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
                n = j.styleSheets[j.styleSheets.length - 1]
            }
            G = X
        }
        if (M.ie && M.win) {
            if (n && typeof n.addRule == r) {
                n.addRule(ac, Y)
            }
        } else {
            if (n && typeof j.createTextNode != D) {
                n.appendChild(j.createTextNode(ac + " {" + Y + "}"))
            }
        }
    }

    function w(Z, X) {
        if (!m) {
            return
        }
        var Y = X ? "visible" : "hidden";
        if (J && c(Z)) {
            c(Z).style.visibility = Y
        } else {
            v("#" + Z, "visibility:" + Y)
        }
    }

    function L(Y) {
        var Z = /[\\\"<>\.;]/;
        var X = Z.exec(Y) != null;
        return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y
    }

    var d = function () {
        if (M.ie && M.win) {
            window.attachEvent("onunload", function () {
                var ac = I.length;
                for (var ab = 0; ab < ac; ab++) {
                    I[ab][0].detachEvent(I[ab][1], I[ab][2])
                }
                var Z = N.length;
                for (var aa = 0; aa < Z; aa++) {
                    y(N[aa])
                }
                for (var Y in M) {
                    M[Y] = null
                }
                M = null;
                for (var X in swfobject) {
                    swfobject[X] = null
                }
                swfobject = null
            })
        }
    }();
    return{registerObject:function (ab, X, aa, Z) {
        if (M.w3 && ab && X) {
            var Y = {};
            Y.id = ab;
            Y.swfVersion = X;
            Y.expressInstall = aa;
            Y.callbackFn = Z;
            o[o.length] = Y;
            w(ab, false)
        } else {
            if (Z) {
                Z({success:false, id:ab})
            }
        }
    }, getObjectById:function (X) {
        if (M.w3) {
            return z(X)
        }
    }, embedSWF:function (ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
        var X = {success:false, id:ah};
        if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
            w(ah, false);
            K(function () {
                ae += "";
                ag += "";
                var aj = {};
                if (af && typeof af === r) {
                    for (var al in af) {
                        aj[al] = af[al]
                    }
                }
                aj.data = ab;
                aj.width = ae;
                aj.height = ag;
                var am = {};
                if (ad && typeof ad === r) {
                    for (var ak in ad) {
                        am[ak] = ad[ak]
                    }
                }
                if (Z && typeof Z === r) {
                    for (var ai in Z) {
                        if (typeof am.flashvars != D) {
                            am.flashvars += "&" + ai + "=" + Z[ai]
                        } else {
                            am.flashvars = ai + "=" + Z[ai]
                        }
                    }
                }
                if (F(Y)) {
                    var an = u(aj, am, ah);
                    if (aj.id == ah) {
                        w(ah, true)
                    }
                    X.success = true;
                    X.ref = an
                } else {
                    if (aa && A()) {
                        aj.data = aa;
                        P(aj, am, ah, ac);
                        return
                    } else {
                        w(ah, true)
                    }
                }
                if (ac) {
                    ac(X)
                }
            })
        } else {
            if (ac) {
                ac(X)
            }
        }
    }, switchOffAutoHideShow:function () {
        m = false
    }, ua:M, getFlashPlayerVersion:function () {
        return{major:M.pv[0], minor:M.pv[1], release:M.pv[2]}
    }, hasFlashPlayerVersion:F, createSWF:function (Z, Y, X) {
        if (M.w3) {
            return u(Z, Y, X)
        } else {
            return undefined
        }
    }, showExpressInstall:function (Z, aa, X, Y) {
        if (M.w3 && A()) {
            P(Z, aa, X, Y)
        }
    }, removeSWF:function (X) {
        if (M.w3) {
            y(X)
        }
    }, createCSS:function (aa, Z, Y, X) {
        if (M.w3) {
            v(aa, Z, Y, X)
        }
    }, addDomLoadEvent:K, addLoadEvent:s, getQueryParamValue:function (aa) {
        var Z = j.location.search || j.location.hash;
        if (Z) {
            if (/\?/.test(Z)) {
                Z = Z.split("?")[1]
            }
            if (aa == null) {
                return L(Z)
            }
            var Y = Z.split("&");
            for (var X = 0; X < Y.length; X++) {
                if (Y[X].substring(0, Y[X].indexOf("=")) == aa) {
                    return L(Y[X].substring((Y[X].indexOf("=") + 1)))
                }
            }
        }
        return""
    }, expressInstallCallback:function () {
        if (a) {
            var X = c(R);
            if (X && l) {
                X.parentNode.replaceChild(l, X);
                if (Q) {
                    w(Q, true);
                    if (M.ie && M.win) {
                        l.style.display = "block"
                    }
                }
                if (E) {
                    E(B)
                }
            }
            a = false
        }
    }}
}();

/* Included from: /javascript/jquery/jquery.reverse.js */

/*
 * Very simple pluging to allow for reversal of arrays in each()
 */

jQuery.fn.reverse = function () {
    return this.pushStack(this.get().reverse(), arguments);
};


/* Included from: /javascript/jquery/jquery.moo.showpagespeed.js */

/*
 * MOO Show Page Speed Plugin
 * 
 * This plugin exists in core
 * 
 * It is used to pull the page render speed comment out of the HTML
 * and display it in a horrible naggy manner
 * 
 */

(function ($) {

    $.fn.mooReverse = [].reverse;
    $.fn.mooBodyComments = function () {
        return $("body").contents().filter(
            function () {
                return this.nodeType == 8;
            }
        );
    };

    $.fn.mooShowPageSpeed = function () {
        $this = $(this);
        if ($this[0]) {
            var matches = $this[0].nodeValue.match(/MRPSW.*: ([0-9.]*)ms/);
            if (matches[1]) {
                var speed = matches[1];
                $('body').prepend('<div class="mooPageSpeed">Ouch! This page took <strong>' + Math.round(speed) + 'ms</strong> to load.</div>');
            }
        }
    };

    $(function () {
        // auto setup - just do it!
        $.fn.mooBodyComments().mooReverse().filter(
            function () {
                return this.nodeValue.indexOf('MRPSW') != '-1';
            }
        ).mooShowPageSpeed();
    });
})(jQuery);

/* Included from: /javascript/jquery/jquery.moo.fbLikeButton.js */

/**
 *  FB Like Button Plugin
 *
 *  Makes it possible to add a like button to any page from the CMS
 *
 * Usage:
 *
 *  Operates on the following classes:
 *  mooFbLikeButton - anything with this class is automagically turned into a like button
 *  mooFbLikeRecommend - this changes the text from like to recommend
 *  mooFbLikeSend - this includes a send button
 */

(function ($) {
    /**
     * debug functions borrowed from cycle >:)
     */
    var magic_debug = false;

    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooFbLikeButton] " + Array.prototype.join.call(arguments, " "));
        }
    }

    function _debug(s) {
        if (magic_debug) {
            _log(s);
        }
    }

    var settings = {},
        methods = {
            init: function (options) {
                _debug('button init');

                return this.each(function () {

                    // default settings
                    settings = {
                        href:   '',
                        send:   false,
                        action: 'like',
                        isBox:  false, // is this a like box instead of a standard like button?
                        width:  null
                    };

                    // extend our settings with any which are passed in
                    if (options) {
                        settings = $.extend(settings, options);
                    }

                    // collect any extra settings from "this" which should be a link with an href and some classes
                    var $this = $(this);
                    settings.element = $this;

                    if ($this.attr('href')) {
                        settings.href = $this.attr('href');
                    }
                    if ($this.hasClass('mooFbLikeSend')) {
                        settings.send = $this.hasClass('mooFbLikeSend');
                    }
                    if ($this.hasClass('mooFbLikeRecommend')) {
                        settings.action = 'recommend';
                    }
                    if ($this.hasClass('mooFbLikeBox')) {
                        settings.isBox = true;
                    }

                    $('body').bind('fbSetupComplete.mooFbLikeButton', {settings: settings}, function (e) {
                        _debug('got setup complete...');
                        // replace our link, which is probably from the CMS, with our like button
                        $this.replaceWith(methods.createButton(e.data.settings));
                        $(this).unbind(e);
                    });

                    methods.fbSetup();
                });
            },
            fbSetup: function () {
                _debug('FB setup attempt');
                // we have to use window.load to make sure that IE is ready for the document.namespaces call
                if ($('#fb-root')[0] && $('#fb-root').hasClass('fbLoaded')) {
                    // Then we have already done FB setup...
                    _debug('FB already setup');
                    $('body').trigger('fbSetupComplete.mooFbLikeButton');
                } else {
                    $(window).bind('load', {settings: settings}, function (e) {
                        _debug('Window loaded');
                        if (!$('#fb-root')[0]) {
                            $('body').append('<div id="fb-root"></div>');
                        }
                        if (document.namespaces) {
                            // IE
                            document.namespaces.add("fb", "http://www.facebook.com/2008/fbml");
                            document.namespaces.add("og", "http://opengraphprotocol.org/schema/");
                        } else {
                            $('html')
                                .attr('xmlns:fb', 'http://www.facebook.com/2008/fbml')
                                .attr('xmlns:og', 'http://opengraphprotocol.org/schema/');
                        }

                        // Doing this here seems odd to me, but seems to make sense
                        // setup FB Developers App Link - do not touch
                        window.fbAsyncInit = function () {
                            FB.init({status: true, cookie: true, xfbml: true});
                        };

                        (function () {
                            var e = document.createElement('script');
                            e.async = true;
                            e.src = document.location.protocol + '//connect.facebook.net/' + getFbLang() + '/all.js';
                            $('#fb-root').append(e);
                            $('#fb-root').addClass('fbLoaded');
                        }());

                        $('body').trigger('fbSetupComplete.mooFbLikeButton');
                        $(this).unbind(e);
                    });
                }
            },
            /**
             * Create the markup for the button, including a wrapper div that we can style
             *
             * @param settings - the options for the like button
             */
            createButton: function (settings) {
                var $fbButton,
                    $fbDiv = $('<div class="mooFbLikeButtonWrapper"></div>');

                if (!settings.isBox) {
                    $fbButton = $('<fb:like></fb:like>');
                } else {
                    $fbButton = $('<fb:like-box></fb:like-box>')
                        .attr('stream', false)// we have some extra defaults for the box
                        .attr('header', false); // if these ever need to be different we can make them settings
                }
                $fbButton
                    .attr('href', settings.href)
                    .attr('send', settings.send)
                    .attr('action', settings.action)
                    .attr('show_faces', false)// we don't ever show the faces
                    .attr('font', '');

                if (settings.width) {
                    $fbButton.attr('width', settings.width);
                }

                $fbDiv.append($fbButton);

                return $fbDiv;
            }
        };

    $.fn.mooFbLikeButton = function (method) {

        if (typeof (method) === 'undefined' || typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else if (method[0] === "_") { // some pseudo private methods
            $.error('Method ' + method + ' cannot be called directly');
        } else if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.mooFbLikeButton');
        }
    };

    /**
     * Helper function getFbLang gets us a language string to use in setting up access to the FB Javascript SDK
     * This sort of thing really ought to be in a javascript helper plugin somewhere really :/
     */
    function getFbLang() {

        var pathParts = window.location.pathname.split('/'),
            lang = pathParts[1],
            fbLang = "/en_US";

        if (lang.match('^[a-zA-Z]{2}(?:-[a-zA-Z]{2})?$')) {
            lang = '/' + lang;
        } else {
            lang = '';
        }

        if (lang !== '') {
            fbLang = lang + '_' + lang.substring(1).toUpperCase();
        }

        return fbLang;
    }

    $(function () {
        // Automatically pick up the relevant classes and replace the links with like buttons

        // if there is a moo Like Button on this page, set it up and add the necessary script
        if ($('.mooFbLikeButton')[0]) {
            $('.mooFbLikeButton').mooFbLikeButton();
        }
    });
}(jQuery));

/* Included from: /javascript/jquery/jquery.moo.customTracking.js */

/**
 * MOO Custom Tracking Plugin
 *
 * Plugin which sends custom page views to GA.
 * This exists on every page, and is used for the homepage & businesscard page slideshows, the main navigation and
 * the social media links in the header of every page.
 *
 * Usage:
 * Add the class "mooCustomTracking" to any link in the CMS
 * Add a tracking url to the rel attribute, this should be in the form:
 *  gaUrl:/customPageView/myTrackingData/GoesHere
  */


(function ($) {

    /* For JSLint */
    /*global _gaq*/

    var methods = {
            init: function (options) {
                $(this).live('click', function (e) {
                    e.preventDefault();

                    var relParts = methods.parseRel($(this).attr('rel')),
                        pageUrl = relParts.gaUrl || null;

                    if (pageUrl !== null && _gaq) {
                        if (window.console && window.console.log) {
                            window.console.log("Logging page view: " + pageUrl);
                        }
                        _gaq.push(['_trackPageview', pageUrl]);
                        _gaq.push(['b._trackPageview', pageUrl]);

                    }
                    window.location = $(this).attr('href');
                });
            },
            /**
             * This is deliberately a little more complex than necessary, so that we can choose to abuse the rel
             * attribute in other ways if need be without affecting this plugin
             * @param rel
             */
            parseRel: function (rel) {
                // takes data in the form "gaUrl:/customPageView/MyContent,someOtherKey:Some Other Value"
                // and turns it into an associative array / key-value object
                var re = /([^:]+):([^,]+),?/g,
                    relParts = {},
                    temp = null;

                while (temp = re.exec(rel)) {
                    relParts[temp[1]] = temp[2];
                }
                return relParts;
            }
        };

    $.fn.mooCustomTracking = function (method) {
        if (typeof (method) === 'undefined' || typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else if (method[0] === "_") { // some pseudo private methods
            $.error('Method ' + method + ' cannot be called directly');
        } else if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.mooCustomTracking');
        }
    };

    // auto run on document ready
    $(function () {
        // We limit this to a's only to reduce the search time
        $('a.mooCustomTracking').mooCustomTracking();
    });
}(jQuery));


/* Included from: /javascript/edialog_conversion.js */

(function($){
    //this bit of javascript simply takes the EDID passed on the query string and then stores it in a cookie for
    //30 days so that conversion to sales can be done for emails

    //the Edialog document said that thie EDID is 50 chars or less and formed of Alphanumerics
    // with a dash to seperate parts. So we are going to validate that
    var EDIDRegex = /[&?]EDID=([a-zA-Z0-9-]{1,50})(&|$)/;
    var EDID = "";
    var search = $.trim(document.location.search);
    var matches = EDIDRegex.exec(search);
    if(matches) {
        EDID = matches[1];
       $.cookie('edialog_EDID',EDID,{'expires':30,'path':'/','domain':'.moo.com'});
    }
})(jQuery)

