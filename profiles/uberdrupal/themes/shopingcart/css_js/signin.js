/* Included from: /javascript/account/account.js */

/**
 * general javascript for the account section
 * - please wait overlay
 * - error handling
 * - confirm delete dialog box
 */

jQuery(function ($) {

    $.mooAccountBase = {
        waiting:false,
        hasAjaxError:false,
        hasUserError:false,
        _pleaseWaitOverlay:$('<div id="divPleaseWaitOverlay" class="moo-overlay-container">' + stringCart0029 + '</div>')
            .mooOverlay({ fixed:true, closeOnClick:false, load:false}),

        init:function () {
            // hide close button for "please wait" overlays
            $('.close', $.mooAccountBase._pleaseWaitOverlay).remove(); //we don't want a close button.
        },
        pleaseWait:function () {
            $.mooAccountBase._pleaseWaitOverlay.bind('onClose', $.mooAccountBase.onClose);
            $.mooAccountBase._pleaseWaitOverlay.overlay().load();
            $.mooAccountBase.waiting = true;
        },
        removePleaseWait:function () {
            //unless we have an error remove please waitOverlay
            //if we had an error it most likely no longer says please wait
            if (!$.mooAccountBase.hasAjaxError) {
                $.mooAccountBase._pleaseWaitOverlay.overlay().close();
            }
        },
        handleError:function () {
            $.mooAccountBase.hasAjaxError = true;
            $.mooAccountBase._pleaseWaitOverlay.addClass('sadMoo').html(stringCart0030).find('a.refresh').click(function (e) {
                e.preventDefault();
                location.reload();
            });

        },
        onClose:function () {
            // only change "waiting" on close so we can rely on it for opening other dialogs.
            $.mooAccountBase.waiting = false;
        },
        openConfirmDialogBox:function (id, html_message, callback) {
            $('#' + id).remove();

            var lightboxText = '';
            lightboxText += '<div id="' + id + '" class="moo-overlay-container">';
            lightboxText += '<a class="close"></a>';
            lightboxText += html_message;
            lightboxText += '<div class="group-confirm">';
            lightboxText += '<a href="#" class="button confirm">' + stringApiApp00003 + '</a>';
            lightboxText += '</div>';
            lightboxText += '<div class="group-deny close">';
            lightboxText += '<a href="#" class="button deny">' + stringApiApp00004 + '</a>';
            lightboxText += '</div>';

            lightboxText += '</div>';
            $(lightboxText).appendTo('body');

            $('#' + id).mooOverlay({
                // disable this for modal dialog-type of overlays
                closeOnClick:false,

                // load it immediately after the construction
                load:true
            });

            $('body').undelegate('.button.confirm', 'click');
            $('body').delegate('.button.confirm', 'click', function (e) {
                e.preventDefault();
                $('#' + id).overlay().close();
                callback();
            });
        }
    };

    $.mooAccountBase.init();
});


/* Included from: /javascript/jquery/jquery.moo.connect.js */

/* 
 * MOO Connect plugin
 * 
 * Plugin that helps MOO users connect with FB over https using ajax
 * Handles all the UI/messaging to do with merging accounts or creating new FB ones *
 * 
 * Requires:
 * javascript/account/account.js
 *
 * 
 * Usage:
 * - include the plugin and required scripts
 * - create a login button with a class of .moo-connect & a fb login URl
 * - voila
 */
(function ($) {

    /**
     * debug functions borrowed from cycle >:)
     */
    function _debug(s) {
        if ($.fn.mooConnect.debug) {
            _log(s);
        }
    }

    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooConnect] " + Array.prototype.join.call(arguments, " "));
        }
    }

    var settings = {};
    var fb_window = null;
    var methods = {
        init: function (options) {

            /*
             * Default settings
             */
            settings = {
                debug:              false,
                href:               null,
                width:              500,
                height:             280,
                inIframe:           false,
                mergeAllowClose:    true,
                returnUrl:          null,
                wait:               $.mooAccountBase.pleaseWait,
                complete:           $.mooAccountBase.removePleaseWait,
                error:              $.mooAccountBase.handleError,
                signInSuccess:      methods._signInSuccess,
                signInFailure:      methods._signInFailure,
                fetchMergeSuccess:  methods._fetchMergeSuccess,
                fetchMergeFailure:  methods._fetchMergeFailure,
                mergeSuccess:       methods._mergeSuccess,
                mergeFailure:       methods._mergeFailure,
                mergeWait:          methods._mergeWait,
                mergeComplete:      methods._mergeComplete,
                mergeError:         methods._mergeError
            };

            return this.each(function () {
                // If options exist, lets merge them with our default settings
                if (options) {
                    settings = $.extend(settings, options);
                }

                var $this = $(this);
                settings.element = $this;

                if (!$this.hasClass('moo-connect')) {
                    $this.addClass('moo-connect');
                }

                if (settings.href) {
                    $this.attr('href', settings.href);
                }

                if (!settings.inIframe && !$('#divMergeAccount')[0]) {
                    $('body').append('<div id="divMergeAccount" class="moo-overlay-container"><div class="content"></div></div>');
                } else if (!$('#divMergeAccount')[0]) {
                    $('body').append('<div id="divMergeAccount" class="container dialogContainer"></div>');
                }

                if ($this.attr('href')) {
                    $this.bind('click.moo-connect', methods._connect);
                } else {
                    // later we might want to setup an ajax call to fetch the loginUrl?
                    _debug('mooConnect called on an object with no href');
                }
            });
        },
        getTrigger: function () {
            return settings.element;
        },
        clearMessages: function () {
            $('.moo-connect-msg').remove();

        },
        _connect: function (e) {
            e.preventDefault();
            var loginUrl = $(this).mooConnect('getTrigger').attr('href');
            var screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft,
                screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop,
                outerWidth = typeof window.outerWidth !== 'undefined' ? window.outerWidth : document.body.clientWidth,
                outerHeight = typeof window.outerHeight !== 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
                width = settings.width,
                height = settings.height,
                left = parseInt(screenX + ((outerWidth - width) / 2), 10),
                top = parseInt(screenY + ((outerHeight - height) / 2), 10),
                options = (
                    'width=' + width +
                    ',height=' + height +
                    ',left=' + left +
                    ',top=' + top
                );
            fb_window = window.open(loginUrl, 'FBLogin', options);

        },
        /**
         * Gets called from connect.tpl when we're done with FB
         * @param result
         */
        connectCallback: function (result) {
            if (result.returnUrl) {
                // store this up for later!
                settings.returnUrl = result.returnUrl;
            }

            if (result.merge) {
                return methods._fetchMerge(result.merge);
            } else if (result.success) {
                return settings.signInSuccess(result.success);
            } else if (result.error) {
                return settings.signInFailure(result.error);
            }
        },
        _signInSuccess: function (success) {
            if (settings.returnUrl) {
                window.location = settings.returnUrl;
            } else {
                // redirect to account by default
                window.location = pageData.secureServer + '/account/';
            }
        },
        _signInFailure: function (error) {
            $(this).mooConnect('clearMessages');
            // we don't throw an error if the user denied access because they chose this
            if (error !== "user_denied") {
                $(this).mooConnect('getTrigger').parent().before('<p class="error moo-connect-msg">' + string00038 + '</p>');
            }
        },
        /**
         * fetch the merge template to display wherever it's needed
         */
        _fetchMerge: function (merge_details) {

            $.ajax({
                url:            _getConnectAndMergeUrl(),
                type:           'POST',
                asynchronous:   false,
                dataType:       'html',
                data:           {
                    action:             'getMergeForm',
                    merge_details:      merge_details
                },
                beforeSend:     settings.wait,
                complete:       settings.complete,
                success:        methods._fetchMergeCallback,
                error:          settings.error
            });
        },
        _fetchMergeCallback: function (response) {
            if (!response || response === '') {
                settings.fetchMergeFailure();
            } else if (response.error) {
                settings.fetchMergeFailure(response.error);
            } else {
                // go off and display the merge template somehow
                settings.fetchMergeSuccess(response);

                // wireup the merge template
                methods._fetchMergeWiring();
            }
        },
        /**
         *  All of the wiring for the merge screen.
         *  It has a forgot password form and other stuff
         */
        _fetchMergeWiring: function () {
            $('.merge-extras').hide();

            $('#btnMergeAccount').live('click.moo-connect', function (e) {
                methods._mergeOrCreate(e, 'btnMergeAccount');
            });
            $('#mergePassword').live('keypress', function (e) {
                if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
                    methods._mergeOrCreate(e, 'btnMergeAccount');
                }
            });

            $('#btnCreateAccount').live('click.moo-connect', function (e) {
                methods._mergeOrCreate(e, 'btnCreateAccount');
            });

            $('#mergeForgottenPasswordLink').live('click.moo-connect', function (e) {
                e.preventDefault();
                $('#mergeForgottenPasswordLink').hide();
                $('#mergeForgottenPasswordForm').show();
            });

            $('#mergePasswordReset').live('click.moo-connect', function (e) {
                e.preventDefault();

                // do password reset
                $.ajax({
                    url:            _getSignInUrl(),
                    type:           'post',
                    asynchronous:   false,
                    data:           {
                        login:          $('#mergeEmail').html(),
                        action:         'forgotPassword'
                    },
                    success:        function (response, textStatus, jqXHR) {
                        $('#mergeForgottenPasswordForm').hide();
                        $('#mergeForgottenPasswordInfo').show();
                    }
                });
            });
            $('#mergePasswordCancel').live('click.moo-connect', function (e) {
                e.preventDefault();
                $('#mergeForgottenPasswordForm').hide();
                $('#mergeForgottenPasswordLink').show();
            });
        },
        _fetchMergeSuccess: function (response) {
            if (settings.inIframe) {
                // display the right stuff
                $('#signInDialog').hide();
                $('#divMergeAccount').show();
                $('#divMergeAccount').html(response);
            } else {
                $('#divMergeAccount').mooOverlay({load: false});
                $('#divMergeAccount .content').html(response);
                methods._loadOverlay();
            }
        },
        _fetchMergeFailure: function (response) {
            $('#divMergeAccount').mooOverlay({load: false})
            settings.mergeError();
            methods._loadOverlay();
        },
        /**
         * We either pressed the merge or the continue button.
         * Figure out which one, setup the correct action and send the relevant
         * info off to the server
         * @param e event
         */
        _mergeOrCreate: function (e, id) {
            e.preventDefault();

            var data = {}, hasErrors = false;
            if (id === 'btnMergeAccount') {
                data.action = 'mergeAccount';
                data.password = $('#mergePassword').val();
                if (!$.mooValidation.validateNotEmpty($('#mergePassword').val())) {
                    $.fn.mooLogJsError.addFailure('mergePassword', 'merge001', string00013, 'No password entered for merge');
                    $.mooValidation.showInLineErrorAbove(string00013, $('#mergePassword'));

                    hasErrors = true;
                }
            } else if (id === 'btnCreateAccount') {
                data.action = 'createAccount';
            }

            if (!hasErrors && data.action) {
                // do the create-or-merge
                $.ajax({
                    url:            _getConnectAndMergeUrl(),
                    type:           'POST',
                    asynchronous:   false,
                    dataType:       'json',
                    data:           data,
                    beforeSend:     function (j, s) {
                        settings.mergeWait(id);
                    },
                    complete:       function (j, s) {
                        settings.mergeComplete(id);
                    },
                    success:        function (d, s, j) {
                        methods._mergeOrCreateCallback(d, id);
                    },
                    error:          settings.mergeError
                });
            }
        },
        _mergeOrCreateCallback: function (response, id) {
            if (response && response.success) {
                return settings.mergeSuccess(response.success, id);
            } else if (response && response.error) {
                return settings.mergeFailure(response.error, id);
            } else {
                return settings.mergeError();
            }
        },
        _mergeSuccess: function (success) {
            methods._signInSuccess(success);
        },
        _mergeFailure: function (error, id) {
            $(this).mooConnect('clearMessages');
            $('#' + id).show();
            $('#mergeSpinner').remove();
            if (error === 'password_failed') {
                $.fn.mooLogJsError.addFailure('mergePassword', 'merge002', stringReferAFriend005, 'Incorrect password entered for merge');
                $.mooValidation.showInLineErrorAbove(stringReferAFriend005, $('#mergePassword'));
            } else {
                settings.mergeError();
            }
        },
        _mergeWait: function (id) {
            $('#' + id).hide();
            $('#' + id).before('<div id="mergeSpinner"></div>');

        },
        _mergeComplete:  function (id) {
            // nothing to do here
        },
        _mergeError: function () {
            $('#divMergeAccount').mooOverlay().addClass('sadMoo').html(stringCart0030).find('a.refresh').click(function (e) {
                e.preventDefault();
                location.reload();
            });
        },
        _loadOverlay: function () {
            var interval = setInterval(function () {
                // we have to make sure one overlay is closed before opening another.
                if (!$.mooAccountBase.waiting) {
                    clearInterval(interval);
                    $('#divMergeAccount').mooOverlay().overlay().load();
                    if (!settings.mergeAllowClose) {
                        $('#divMergeAccount .close').hide();
                    }
                }
            }, 100);
        },
        destroy: function () {
            return this.each(function () {
                $(window).unbind('.moo-connect');
            });
        }
    };

    /**
     * Setup our plugin
     * we can pass it a method to call or some settings to initialise with
     */
    $.fn.mooConnect = function (method) {
        // some pseudo private methods
        if (typeof method !== 'undefined' && method[0] === "_") {
            $.error('Method ' + method + ' cannot be called directly');
        } else if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.mooConnect');
        }

    };

    $(function () {
        /**
         * anything marked with the classname moo-connect gets automatically setup
         * with the basic settings - this is used where sign-in is done from a page
         * rather than from an iframe. So save/email/preview have their own setups
         */
        if ($('.moo-connect')[0]) {
            if ($.fn.mooIframeTrigger.inDialog()) {
                $('.moo-connect').mooConnect({
                    inIframe:       true,
                    signInSuccess:  $.fn.mooSignInSignUp.signIn.iframeSigninSuccess,
                    mergeSuccess:   $.fn.mooSignInSignUp.signIn.iframeSigninSuccess,
                    mergeWait:      $.mooAccountBase.pleaseWait,
                    mergeComplete:  $.mooAccountBase.removePleaseWait,
                    mergeError:     $.mooAccountBase.handleError
                });
            } else {
                $('.moo-connect').mooConnect();
            }
        }
    });

    /**
     * Gets the URL for the ajax connect & merge page
     *
     * @return {string}
     */
    function _getConnectAndMergeUrl() {
        return pageData.secureServer + '/ajaxrequests/connect_and_merge.php';
    }

    /**
     * Gets the URL for the ajax sign in page
     *
     * @return {string}
     */
    function _getSignInUrl() {
        return pageData.secureServer + '/ajaxrequests/signInSignUp.php';
    }
}(jQuery));

/* Included from: /javascript/jquery/jquery.moo.urihash.js */

(function ($) {
    var keyValue;

    var populateHashValuesArray = function () {
        if (typeof(keyValue) === 'undefined') {
            keyValue = {};

            // get the hash string
            var hashString = window.location.hash;

            keyValue = $.parseQueryString(hashString);

            if (hashString.length > 0) {
                // remove the # symbol
                hashString = hashString.substring(1, hashString.length);

                // split hash string into an array
                var params = hashString.split('&');

                // loop through and make a key, value array for the has string
                // values
                $.each(params, function (index, value) {
                    var splitParams = value.split('=');
                    keyValue[splitParams[0]] = splitParams[1];
                });
            }
        }
    };


    // add function calls
    $.extend({
        parseQueryString:function (queryString) {
            var queryArray = {};
            if (queryString.length > 0) {

                // get rid of hashes or query starts
                if (queryString.substring(0, 1) == '#' || queryString.substring(0, 1) == '?') {
                    queryString = queryString.substring(1, queryString.length);
                }

                // split query string into an array
                var params = queryString.split('&');

                // loop through and make a key, value array for the query string
                // values
                $.each(params, function (index, value) {
                    var splitParams = value.split('=');
                    queryArray[splitParams[0]] = splitParams[1];
                });
            }
            return queryArray;
        },
        updateHashString:function (params) {
            //populate the hash values array
            populateHashValuesArray();

            var pairs = new Array();
            $.each(params, function (hashKey, hashValue) {
                // make sure that the key is lower case
                hashKey = hashKey.toLowerCase();

                //if the hashValue is null then remove the pairs
                //from the hash array
                if (hashValue == null) {
                    delete keyValue[hashKey];
                } else {
                    // insert the new key, value pairs into the keyValue array
                    keyValue[hashKey] = hashValue;
                }
            });

            // now we need flatten down into a query string
            $.each(keyValue, function (key, value) {
                pairs[pairs.length] = key + '=' + value;
            });

            //set the hash
            window.location.hash = pairs.join('&');
        },
        getHashValue:function (key) {
            // populate the hash values array
            populateHashValuesArray();

            if (typeof(keyValue[key]) === 'undefined') {
                return false;
            } else {
                return keyValue[key];
            }
        }
    });
})(jQuery);

/* Included from: /javascript/jquery/jquery.postmessage.min.js */

/*
 * jQuery postMessage - v0.5 - 9/11/2009
 * http://benalman.com/projects/jquery-postmessage-plugin/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($){var g,d,j=1,a,b=this,f=!1,h="postMessage",e="addEventListener",c,i=b[h]&&!$.browser.opera;$[h]=function(k,l,m){if(!l){return}k=typeof k==="string"?k:$.param(k);m=m||parent;if(i){m[h](k,l.replace(/([^:]+:\/\/[^\/]+).*/,"$1"))}else{if(l){m.location=l.replace(/#.*$/,"")+"#"+(+new Date)+(j++)+"&"+k}}};$.receiveMessage=c=function(l,m,k){if(i){if(l){a&&c();a=function(n){if((typeof m==="string"&&n.origin!==m)||($.isFunction(m)&&m(n.origin)===f)){return f}l(n)}}if(b[e]){b[l?e:"removeEventListener"]("message",a,f)}else{b[l?"attachEvent":"detachEvent"]("onmessage",a)}}else{g&&clearInterval(g);g=null;if(l){k=typeof m==="number"?m:typeof k==="number"?k:100;g=setInterval(function(){var o=document.location.hash,n=/^#?\d+&/;if(o!==d&&n.test(o)){d=o;l({data:o.replace(n,"")})}},k)}}}})(jQuery);

/* Included from: /javascript/jquery/jquery.moo.iframeTrigger.js */

/********************************************************************************************************
 * MOO iFrame Trigger plugin
 *
 * Sends messages for triggering actions with iFrames using postMessage
 * Includes a wrapper for the jquery postMessage plugin which ensures messages get sent in a certain way
 * This works in tandem with the MOO iFrame Overlay Plugin, which is setup to receive these messages
 *
 * This is somewhat inter-related with save as many of the iframes involve saving
 * We often have to update a pack before opening the overlay as only the parent page has access to the flash to do an update
 * Also, we often have to pass save settings such as whether to save as new, through from the parent page
 *
 * Perhaps, really, there should be a subclass of mooIframeTriggerSave to enclose that extra logic...
 *
 * This plugin is heavily used by:
 * /javascript/jquery/jquery.moo.signInAndSaveButton.js
 * /javascript/jquery/jquery.moo.iframeWirings.js
 * /javascript/dialogs/*_dialog.js
 *
 * Requires (included in javascript/compiled/iframe-tools.js):
 * /javascript/jquery/jquery.moo.urihash.js
 * /javascript/jquery/jquery.postmessage.min.js
 *
 * Expects:
 * none - no required classes or ids
 *
 * Usage:
 *
 * $('.myTrigger').mooIframeTrigger(action, {settings}); // binds to the click event for this particular selector
 *
 * OR
 *
 * $.mooIframeTrigger(action, {settings}); // instantly triggers a message
 *
 **********************************************************************************************************/

(function ($) {

    var magic_debug = false;

    /**
     * debug functions borrowed from cycle >:)
     */
    function _debug(s) {
        if (magic_debug) {
            _log(s);
        }
    }

    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooIframeTrigger] " + Array.prototype.join.call(arguments, " "));
        }
    }

    /**
     * mooIframeMessageDispatcher
     *
     * Wrapper for postMessage - should NEVER be called outside of this file.
     *
     * Requires a target, an action and some data which makes up the message
     * Wraps the action as part of the message, and calls postmessage
     *
     */
    var mooIframeMessageDispatcher = function (action, data) {
        if (typeof($.postMessage) == 'function') {
            if (typeof(data) == 'undefined' || typeof(data) == null) {
                data = {};
            }

            // set the action as a property on the message
            data.action = action;
            // we always have to post to the top level
            var target = triggerMethods._getTop();
            // we record the top level target so we can access it from iframes
            data.top = encodeURIComponent(target);

            for (var item in data) {
                data[item] = escape(data[item]);
            }

            $.postMessage(data, target);
            _debug('sent postMessage with action ' + action);

        } else {
            _debug('postMessage called without being included. iframeTrigger.js was probably included without using iframe-tools.js');
            $.fn.mooLogJsError.addFailure(window.location.href, 'iframe-message-dispatcher', 'postMessage called without being included. iframeTrigger.js was probably included without using iframe-tools.js');
        }
    };
    /**
     * The trigger tells the iframe what to load into itself
     * And passes any setup which must be done after load
     */
    var triggerMethods = {
        init:function (action, options) {
            return this.each(function () {
                _debug('setup & src: ' + options.src);
                $(this).bind('click.mooIframetrigger', {action:action, options:options}, function (e) {
                    e.preventDefault();
                    $.fn.mooIframeTrigger(e.data.action, e.data.options);
                });
            });

            // setup of these elements to become a trigger
        },
        trigger:function (action, options) {

            if (typeof(options) == 'undefined') {
                options = {};
            }
            _debug('triggered & src: ' + options.src);
            if (options.updatePackFirst) {
                $.mooSave({
                    saveAsProject:false,
                    onaftersave:function (e) {
                        _debug('update pack first on after save');
                        mooIframeMessageDispatcher(action, options);
                        $(this).unbind(e);
                    }
                });
            } else {
                mooIframeMessageDispatcher(action, options);
            }
        },
        _getTop:function () {
            if (!$.fn.mooIframeTrigger.inDialog()) {
                // we're not in an iframe, use window location
                return window.location.href;
            } else {
                // we are in an iframe, use the top parameter that we were passed
                var params = $.parseQueryString(window.location.search);
                if (typeof(params.top) != 'undefined') {
                    return decodeURIComponent(unescape(params.top));
                }
            }
            _debug('Something went wrong with getting top, trigger probably called from an iframe with no top set');
        }
    };

    $.fn.mooIframeTrigger = function (action) {
        if (typeof(action) !== 'undefined' && action !== '') {
            if ($(this).selector !== '') {
                // mooIframeTrigger was called on a selector
                return triggerMethods.init.apply(this, arguments);
            } else {
                // mooIframeTrigger was called directly
                return triggerMethods.trigger.apply(this, arguments)
            }
        }
        _debug('Got no action, nothing to trigger!');
    };

    /*
     * helper function returns true if we are currently inside a dialog
     */
    $.fn.mooIframeTrigger.inDialog = function() {
        return window.location !== window.parent.location;
    };

    $(function () {
        // There are no automatically configured mooIframeTriggers
        // Some can be found in the /javascript/dialogs/*_dialog.js files
    });

})(jQuery);

/* Included from: /javascript/jquery/jquery.moo.iframeOverlay.js */

/* 
 * MOO iFrame overlay in plugin
 * 
 * This plugin is to facilitate the loading of (secure) iframes inside overlays
 *
 * Includes a wrapper for the jquery receiveMessage plugin which ensures messages get listened for in a certain way
 * This works in tandem with the MOO iFrame Trigger Plugin, which is setup to send these messages
 *
 * This plugin is heavily used by:
 *
 * Requires:
 * /javascript/compiled/iframe-tools.js
 * /javascript/jquery/jquery.moo.iframeTrigger.js
 *
 * Expects:
 * none
 *
 * Usage:
 * This file does all of it's own setup, an iframe overlays should always be opened using the iframeTrigger (see jquery.moo.iframeOverlay.js)
 *
 * mooIframeOverlay does provide one helper function:
 *   $.mooIframeOverlay('isOpen'); - to test if the iframe is already open
 *
 * You can also use events fired by mooIframeOverlay
 *
 *   onmessagereceived.mooIframeOverlayListener
 *   onbeforeload.mooIframeOverlay - before the iframe overlay loads 
 *   onafterload.mooIframeOverlay - after the iframe overlay loads
 *   onafterclose.mooIframeOverlay - after the iframe overlay has been closed (by the user or programmatically)
 */

(function ($) {

    /**
     * debug functions borrowed from cycle >:)
     */
    function _debug(s) {
        if (overlaySettings.debug) {
            _log(s);
        }
    }

    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooIframeOverlay] " + Array.prototype.join.call(arguments, " "));
        }
    }

    /**
     * mooIframeMessageListener
     *
     * Wrapper for receiveMessage - should NEVER be called outside of this file.
     *
     * Listens for a postMessage that could come from anywhere provided the origin contains .moo.com
     * Expects that the message have an action. Likely actions: load, close, resize, saved, signed in
     * If an action is found, then the message is recreated as an event triggered on the dom body
     */
    var mooIframeMessageListener = function () {
        if (typeof($.receiveMessage) == 'function') {
            $.receiveMessage(function (e) {
                // parse our response which should be a query string
                var data = unescape(e.data);
                _debug('received message string is: ' + data);
                data = $.parseQueryString(data.replace(/\+/g, ' '));

                for (var item in data) {
                    data[item] = unescape(data[item]);
                }

                // we must have an action, otherwise we don't do anything
                if (typeof(data.action) != undefined && typeof(data.action) != null) {
                    _debug('received message action is: ' + data.action);
                    // we could use the action to fire named events, but this could be dangerous as postMessages can come
                    // from any window, so we fire a single "onmessagereceived" event, and anything which listens for these
                    // should filter for, and only act upon the messages it is listening from
                    $('body').trigger('onmessagereceived.mooIframeOverlayListener', [data]);
                }
            }, function (origin) {
                // must end with .moo.com or we shouldn't listen!
                return (origin.substring(origin.length - 8, origin.length) == '.moo.com');
            });
            _debug('Setup to receive');
        } else {
            _debug('receiveMessage called without being included. iframeOverlay.js was probably included without including iframe-tools.js');
            $.fn.mooLogJsError.addFailure(window.location.href, 'iframe-message-listener', 'iframes will not work for this user', 'receiveMessage called without being included. iframeOverlay.js was probably included without including iframe-tools.js');
        }
    };

    /**
     * The iFrame overlay handles the creation / maintenance of an iFrame inside an overlay
     *
     * <div id="mooIframeOverlayContainer">
     *    <iframe id="mooIframeOverlay"></iframe>
     * </div>
     *
     */
    var overlaySettings = {
        iframeId:'mooIframeOverlay',
        containerId:'mooIframeOverlayContainer',
        iframeContainer:null,
        iframe:null,
        debug:false
    };

    var overlayMethods = {
        init:function () {
            // we need to listen for load and close events
            $('body').bind('onmessagereceived.mooIframeOverlayListener', function (e, data) {
                switch (data.action) {
                    case 'load':
                        e.preventDefault();
                        overlayMethods._load(data);
                        break;
                    case 'close':
                        e.preventDefault();
                        overlayMethods._close(data);
                        break;
                    case 'reload':
                        e.preventDefault();
                        overlayMethods._reload(data);
                        break;
                    default:
                        break;
                }
            });
        },
        /**
         * Load! The magical method which fetches a page and displays it in the iframe
         * using the wonder of iframe src
         *
         * @param options
         */
        _load:function (options) {
            // in this case, we don't override any of the overlaySettings
            // these are static
            // instead we pass in extra options and handle those separately
            // these have no defaults and are required
            if (options.src == null || options.top == null) {
                return false;
            }

            // fetch our overlay & iframe
            if (!$('#' + overlaySettings.containerId)[0]) {
                // we don't have one, so lets create it
                overlayMethods._setup();
            }

            // Fire an event useful for changing the iframe before it loads - i.e. resizing it
            $('body').trigger('onbeforeload.mooIframeOverlay', [options]);
            // reset showing/hiding the loading spinny and iframe - we have to use
            // visibility, instead of display, because otherwise things like
            // jNice won't work without a lot of jiggery pokery.

            overlayMethods._hideIframe();
            // bind to teh load event
            overlaySettings.iframe.unbind('load');
            overlaySettings.iframe.bind('load', function (e) {
                // hide the spinner and show our loaded content
                overlayMethods._showIframe();
                // cleanup and fire an event
                $(this).unbind(e);
                $('body').trigger('onafterload.mooIframeOverlay', [options]);
            });

            // load the overlay UI
            if (!overlaySettings.iframeContainer.overlay().isOpened()) {
                overlaySettings.iframeContainer.overlay().load();
            }

            // Finally, configure and set the iframe src which kicks off the loading procedure
            // we always add the formToken and the topLocation URL in the request
            var src = options.src;
            src += (src.indexOf('?') < 0) ? '?' : '&';
            src += 'formToken=' + $('input[name=formToken]').val();
            src += '&top=' + options.top;

            src = encodeURI(src);

            overlaySettings.iframe.attr('src', src);
        },
        /**
         * This is a scripted / forced close, not a user close
         */
        _close:function (options) {
            if (overlaySettings.iframeContainer.overlay().isOpened()) {
                overlaySettings.iframeContainer.unbind('onClose');
                overlaySettings.iframeContainer.bind('onClose', function (e) {
                    overlayMethods._onClose();
                });
                overlaySettings.iframeContainer.overlay().close();
            }
        },
        /**
         * This should ALWAYS happen when an iframe gets closed one way or another
         */
        _onClose:function () {
            // set our iframe to blank so that anything that *was* happening stops
            overlaySettings.iframe.attr('src', 'about:blank');
            overlayMethods._hideIframe();
            $('body').trigger('onafterclose.mooIframeOverlay');
        },
        /**
         * This method is a bit different, because it reloads the top level page, rather than the iframe
         * As this is the only bit of iframe javascript that has access to the top (the iframe itself doesn't)
         * we need to do it this way
         */
        _reload:function (options) {
            overlayMethods._hideIframe();
            location.reload();
        },
        /**
         * hide the spinner and show our loaded content
         * we use visibility instead of display to prevent strange browser issues
         * and so that jNice continues to work inside the iframes
         */
        _showIframe:function () {

            overlaySettings.iframeSpinner.hide();
            overlaySettings.iframe.css('visibility', 'visible');
        },
        /**
         * show the spinner and hid our loaded content
         * we use visibility instead of display to prevent strange browser issues
         * and so that jNice continues to work inside the iframes
         */
        _hideIframe:function () {
            // show the spinner and hide our loaded content
            overlaySettings.iframeSpinner.show();
            overlaySettings.iframe.css('visibility', 'hidden');
        },
        /**
         * This creates our One True God... I mean Iframe.
         *
         * It creates the necessary elements, adds them to the page,
         * sets them up as a potential overlay and adds a loading spinny.
         */
        _setup:function () {
            // if we haven't got one, create it
            overlaySettings.iframeContainer = $('<div />', {
                id:overlaySettings.containerId
            }).appendTo('body');

            // Setup a spinner to show before our content is loaded
            overlaySettings.iframeSpinner = $('<div />', {
                id:'iframeSpinner'
            }).appendTo(overlaySettings.iframeContainer);

            $('<img/>', {
                src:"/images/80px_spinner.gif",
                alt:"Loading..."
            }).appendTo(overlaySettings.iframeSpinner);

            overlaySettings.iframe = $('<iframe />', {
                id:overlaySettings.iframeId,
                allowTransparency:true,
                frameBorder:0
            }).appendTo(overlaySettings.iframeContainer);


            overlaySettings.iframeContainer
                .addClass('moo-overlay-container')
                .mooOverlay({ load:false, top:10, onClose:overlayMethods._onClose });

        },
        isOpen:function () {
            if (!$('#' + overlaySettings.containerId)[0]) {
                return false;
            }
            return overlaySettings.iframeContainer.overlay().isOpened();
        }
    };

    $.mooIframeOverlay = function (method) {
        if (typeof(method) === 'undefined' || typeof method === 'object' || !method) {
            return overlayMethods.init.apply(this, arguments);
        } else if (method[0] == "_") { // some pseudo private methods
            $.error('Method ' + method + ' cannot be called directly');
        } else if (overlayMethods[method]) {
            return overlayMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.mooIframeOverlay');
        }
    };


    $(function () {
        mooIframeMessageListener();
        $.mooIframeOverlay();
    });
})(jQuery);

/* Included from: /javascript/jquery/jquery.moo.iframeWirings.js */

/***************************************************************************************************************
 * MOO iframeWirings Plugin
 *
 * This little plugin sets up the standard wiring for the sign in and save iframes which are used in several places
 * and in several iframe "flows" such as sign in and save, email preview and print preview
 * It's here to reduce code duplication a little, and doesn't do very much.
 *
 * Requires:
 * /javascript/compiled/iframe-tools.js (iframeTrigger + it's requirements)
 * javascript/jquery/jquery.moo.iframeOverlay.js
 * javascript/compiled/signInAndSave.js (to do the sign in and save stuff!)
 *
 * Expects:
 * pageData.secureServer
 * pageData.saveData.builderUuid
 * pageData.saveData.saveSideType
 * $('#txtSaveAs')
 *
 * Usage:
 *
 * $.showSignInIframe(
 *      next:               function(){}    // the next function is what happens after success (sign in success)
 * });
 *
 * $.showSaveIframe({
 *      updatePackFirst:    boolean         // the update pack first setting for the trigger
 *      saveAsNew:          boolean         // the save as new setting for sve
 *      next:               function(){}    // the next function is what happens after success (save success)
 * });
 *
 *******************************************************************************************************************/

(function ($) {
    /**
     * showSignInIframe
     * - triggers an iframe with the sign screen
     * - binds to the success message which gets sent from sign-in (signInSuccess)
     * - on receiving the message, does the default post iframe sign-in action to update the parent page
     * - finally, executes the provided next callback
     *
     * @param options - options includes the next callback
     */
    $.showSignInIframe = function (options) {
        // our default settings
        var settings = {
            next: null
        };
        // override with the provided options
        if (options) {
            settings = $.extend(settings, options);
        }
        // bind to our success message, in this case "signInSuccess"
        $('body').bind('onmessagereceived.mooIframeOverlayListener', function (e, data) {
            if (data.action === 'signInSuccess') {
                // cleanup our events
                e.preventDefault();
                $(this).unbind(e);
                // do our default post sign-in action:
                $.fn.mooSignInSignUp.signIn.updateSignIn();
                // process the sign in and show the save iframe
                // if we've got one, execute our "next" callback
                if (settings.next !== null) {
                    settings.next(data);
                }
            }
        });
        // trigger the iframe
        $.fn.mooIframeTrigger('load', {
            src: pageData.secureServer + '/dialogs/signInSignUp_dialog.php'
        });
    };

    /**
     * showSaveIframe
     *  - triggers an iframe with the save screen
     *  - binds to the success message which gets sent from save (saveSuccess)
     *  - on receiving the message, does the default post iframe save action to update the parent page
     *  - finally, executes the provided next callback
     *
     * @param options - options can include a next callback, the updatePackFirst flag and the saveAsNew flag
     */
    $.showSaveIframe = function (options) {
        // our default settings
        var friendlyName = '',
            settings = {
                updatePackFirst:    true,
                saveAsNew:          false,
                next:               null
            };

        // override with the provided options
        if (options) {
            settings = $.extend(settings, options);
        }

        // find out if we've got a friendly name we can use
        if (typeof (settings.friendlyName) !== 'undefined') {
            friendlyName = settings.friendlyName;
        } else if (typeof ($('#txtSaveAs').val()) !== 'undefined') {
            friendlyName = $('#txtSaveAs').val();
        }

        // bind to our success message, in this case "saveSuccess"
        $('body').bind('onmessagereceived.mooIframeOverlayListener', function (e, data) {
            if (data.action === 'saveSuccess') {
                // cleanup our events
                e.preventDefault();
                $(this).unbind(e);
                // do our default post save action:
                $.mooSave('postIframeSave', data);
                // if we've got one, execute our "next" callback
                if (settings.next !== null) {
                    settings.next(data);
                }
            }
        });
        // trigger the iframe
        $.fn.mooIframeTrigger('load', {
            updatePackFirst: settings.updatePackFirst,
            src: pageData.secureServer + '/dialogs/save_project_dialog.php'
                + '?uuid=' + pageData.saveData.builderUuid
                + '&friendlyName=' + friendlyName
                + '&saveSideType=' + pageData.saveData.saveSideType
                + '&saveStep=' + pageData.saveData.saveStep
                + '&saveAsNew=' + settings.saveAsNew
        });
    };
}(jQuery));

/* Included from: /javascript/jquery/jquery.moo.signInSignUp.js */

/*globals stringCart0002, stringCart0002a, stringCart0003, stringCart0003a, stringCart0003b, stringCart0003c, stringCart0004, string00015_as, string00009_as */

(function ($) {
    /**
     * debug functions borrowed from cycle >:)
     */
    function _log(str) {
        if (window.console && window.console.log) {
            window.console.log("[mooSignInSignUp] " + Array.prototype.join.call(arguments, " "));
        }
    }

    function _debug(s) {
        if (magic_debug) {
            _log(s);
        }
    }

    var magic_debug = false,
        settings,
        methods = {
            init: function (options) {
                _debug('signInSignUp init');
                return this.each(function () {
                    settings = {
                        canSignIn:      true,
                        canSignUp:      true,
                        defaultState:   'signIn',
                        inDialog:       false
                    };

                    if (options) {
                        settings = $.extend(settings, options);
                    }

                    // ajax defaults for this plugin:
                    $.ajaxSetup({
                        url:            pageData.secureServer + '/ajaxrequests/signInSignUp.php',
                        type:           'post',
                        asynchronous:   false,
                        dataType:       'json',
                        error:  $.mooAccountBase.handleError,
                        success: function (response) {
                            if (response.failures) {
                                // Nice error handling for ajax failures - move this into the errorHandling plugin!
                                $.fn.mooRemoveErrorMessages('body');
                                $.each(response.failures, function (index, failure) {
                                    $.fn.mooLogJsError.addFailure('#' + failure.element, failure.code, failure.message, failure.reason);
                                    $.mooValidation.showInLineErrorAbove(failure.message, '#' + failure.element, {
                                        offsets: [1, 30, 0, 0]
                                    });
                                });
                                $.fn.mooLogJsError.logFailures();
                                $.fn.scrollToUppermostError();
                            } else {
                                $.fn.mooSignInSignUp.signIn.iframeSigninSuccess();
                            }
                        }
                    });

                    // We need to determine what our default state is whether we can sign in, can sign up
                    // and also whether we are inside a dialog or not.
                    if ($('#signInSignUp')[0] && $('#signInSignUp').hasClass('signUpDefault')) {
                        settings.defaultState = 'signUp';
                    }

                    // we can use "state" in the url to trigger a default state
                    var params = $.parseQueryString(window.location.search);
                    if (params.state === 'signIn') {
                        settings.defaultState = 'signIn';
                    } else if (params.state === 'signUp') {
                        settings.defaultState = 'signUp';
                    }

                    _debug(settings.defaultState);

                    // If we have the signIn form, configure it, else turn off signing in
                    if ($('#signInForm')[0]) {
                        $.fn.mooSignInSignUp.signIn.init();
                    } else {
                        settings.canSignIn = false;
                    }

                    // If we have the signUp form, configure it, else turn off signing up
                    if ($('#signUpForm')[0]) {
                        $.fn.mooSignInSignUp.signUp.init();
                    } else {
                        settings.canSignUp = false;
                    }

                    // If we have both forms, permit toggling
                    if ($('#signUpForm')[0] && $('#signInForm')[0]) {
                        methods.toggleSignInSignUp(settings.defaultState);
                        $('input[name="radSignInSignUp"]').live('change', methods.determineToggleSignInSignUp);
                        $('#signInBackLink').live('click', methods.determineToggleSignInSignUp);
                    } else {
                        // hide the toggle tools
                        $('.signInSignUpToggle, #signInBackLink').hide();
                    }

                    // If we're in a dialog, configure our forgot password link etc
                    if ($.fn.mooIframeTrigger.inDialog()) {
                        $('a.forgotPassword').mooIframeTrigger('load', {
                            src: pageData.secureServer + '/dialogs/forgot_password_dialog.php'
                        });
                    }
                });
            },
            determineToggleSignInSignUp: function (e) {
                e.preventDefault();
                if (e.type === 'click') { // at the moment we only have links (clicks) for back to sign in
                    methods.toggleSignInSignUp('signIn');
                } else {
                    methods.toggleSignInSignUp($(e.target).val());
                }
            },
            /**
             * Toggle the sign in or sign up form
             * This is horrible...
             */
            toggleSignInSignUp: function (state) {
                _debug('toggle');
                if (state === 'signUp') {
                    $('input#radSignUp').attr('checked', true).click(); // fire a click for jNice...
                    $('#txtEmailSignUp').val($('#txtEmailSignIn').val());
                    $('.signInFormContainer').hide();
                    $('.signUpFormContainer').show();
                    $('#signInBackLink').show();
                    // pass the value of the remember me checkbox
                    if ($('input#rememberMe').attr('checked')) {
                        $('#rememberMeSignUp').val(true);
                    }
                } else {
                    $('input#radSignIn').attr('checked', true).click(); // fire a click for jNice...
                    $('#txtEmailSignIn').val($('#txtEmailSignUp').val());
                    $('.signUpFormContainer').hide();
                    $('.signInFormContainer').show();
                    $('#signInBackLink').hide();
                }
                $.fn.mooRepositionErrorMessages($('#signInSignUp'));
            }
        };

    $.fn.mooSignInSignUp = function (method) {
        if (typeof (method) === 'undefined' || typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else if (method[0] === "_") { // some pseudo private methods
            $.error('Method ' + method + ' cannot be called directly');
        } else if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.mooSignInSignUp');
        }
    };

    $.fn.mooSignInSignUp.signIn = {
        init: function (options) {
            $('#signInForm').bind('submit', function (e) {
                if ($.fn.mooIframeTrigger.inDialog()) {
                    // we're in a dialog, we'll have to handle signin for ourselves
                    e.preventDefault();
                    $.fn.mooSignInSignUp.signIn.ajaxRequest();
                } else {
                    // we're on a normal page which will process signin with a post-back
                    if (!$.fn.mooSignInSignUp.signIn.validate()) {
                        e.preventDefault();
                    }
                }
            });
        },
        validate: function () {
            $.fn.mooRemoveErrorMessages($('#signInForm'));
            var hasErrors = false;
            if (!$.mooValidation.validateNotEmpty($('#txtEmailSignIn').val())) {
                $.fn.mooLogJsError.addFailure('txtEmailSignIn', 'signin0002', stringCart0002, 'Email: ' + $('#txtEmailSignIn').val());
                $.mooValidation.showInLineErrorAbove(stringCart0002, $('#txtEmailSignIn'));
                hasErrors = true;
            }
            if (!$.mooValidation.validateEmail($('#txtEmailSignIn').val())) {
                $.fn.mooLogJsError.addFailure('txtEmailSignIn', 'signin0002', stringCart0002, 'Email: ' + $('#txtEmailSignIn').val());
                $.mooValidation.showInLineErrorAbove(stringCart0002a, $('#txtEmailSignIn'));
                hasErrors = true;
            }
            if (!$.mooValidation.validateString($('#txtPasswordSignIn').val())) {
                $.fn.mooLogJsError.addFailure('txtPasswordSignIn', 'signin0003', stringCart0003, 'Login for: ' + $('#txtPasswordSignIn').val());
                $.mooValidation.showInLineErrorAbove(stringCart0003, $('#txtPasswordSignIn'));
                hasErrors = true;
            }

            if (hasErrors) {
                $.fn.mooLogJsError.logFailures();
                $.fn.scrollToUppermostError();
                return false;
            } else {
                return true;
            }
        },
        iframeSigninSuccess: function () {
            //they are good to go, mark them as signed in and
            pageData.mooUserSignedIn = '1';
            // SEND A MESSAGE SAYING WE ARE SIGNED IN AND AWAIT FURTHER INSTRUCTIONS!
            $.fn.mooIframeTrigger('signInSuccess');
        },
        /**
         * Replace our user data with new user data
         * Called after signing in from an iframe
         */
        updateSignIn: function () {
            // first update the page data
            pageData.mooUserSignedIn = "1";
            // now sort out the UI
            $.ajax({
                url: pageData.secureServer + '/ajaxrequests/get_user_data.php',
                dataType: 'jsonp',
                data: {
                    returnAfterLogin: window.location.href
                },
                success: function (data) {
                    $('ul#ulUserInfo').replaceWith($(data));
                    // We have to jNice the store switcher again
                    $('form#frm_HeaderCountrySelector').jNice();
                }
            });
        },
        ajaxRequest: function () {
            //validate their credentials
            if ($.fn.mooSignInSignUp.signIn.validate()) {

                //if we have got this far then it is time to sign in
                $.ajax({
                    data: {
                        txtEmailSignIn:          $('#txtEmailSignIn').val(),
                        txtPasswordSignIn:       $('#txtPasswordSignIn').val(),
                        hid_builder_uuid:        $('#hid_builder_uuid').val(),
                        action:                 'signIn',
                        rememberMe:             $('#rememberMe').attr('checked') ? 1 : 0
                    }
                });
            }
        }
    };

    $.fn.mooSignInSignUp.signUp = {
        init: function (options) {
            // initialise the verticals form
            $.fn.mooSignInSignUp.signUp.verticals.init();

            // initialise the signup form
            $('#signUpForm').bind('submit', function (e) {
                if ($.fn.mooIframeTrigger.inDialog()) {
                    _debug('Dialog submit');
                    // we're in a dialog, we'll have to handle signup for ourselves
                    e.preventDefault();
                    $.fn.mooSignInSignUp.signUp.ajaxRequest();
                } else {
                    // we're on a normal page which will process signup with a post-back
                    _debug('Page submit');
                    if (!$.fn.mooSignInSignUp.signUp.validate()) {
                        e.preventDefault();
                    }
                }
            });
        },
        validate: function () {
            var stateDropdownId = '#ddlState' + $('#ddlCountry').val(),
                hasErrors = false;

            $.fn.mooRemoveErrorMessages($('#signUpForm'));

            if (!$.mooValidation.validateString($('#txtFirstName').val()) || !$.mooValidation.validateString($('#txtLastName').val())) {
                $.fn.mooLogJsError.addFailure('txtFirstName', 'signin0008', stringCart0004, 'firstName: "' + $('#txtFirstName').val() + '", lastName: "' + $('#txtLastName').val() + '"');
                $.mooValidation.showInLineErrorAbove(stringCart0004, $('#txtLastName'), {
                    offsets: [0, 38, 0, 10]
                });
                hasErrors = true;
            }

            if (!$.mooValidation.validateEmail($('#txtEmailSignUp').val())) {
                $.fn.mooLogJsError.addFailure('txtEmailSignUp', 'signin0004', stringCart0002a, 'Email: ' + $('#txtEmail').val());
                $.mooValidation.showInLineErrorAbove(stringCart0002a, $('#txtEmailSignUp'), {
                    offsets: [0, 38, 0, 10]
                });
                hasErrors = true;
            }
            if (!$.mooValidation.validateString($('#txtPasswordSignUp').val())) {
                $.fn.mooLogJsError.addFailure('txtPasswordSignUp', 'signin0005', stringCart0003a, 'password 1 did not pass validateString');
                $.mooValidation.showInLineErrorAbove(stringCart0003a, $('#txtPasswordSignUp'), {
                    offsets: [0, 38, 0, 10]
                });
                hasErrors = true;
            }
            if (!$.mooValidation.validateString($('#txtPassword2SignUp').val())) {
                $.fn.mooLogJsError.addFailure('txtPassword2SignUp', 'signin0006', stringCart0003b, 'password 2 did not pass validateString');
                $.mooValidation.showInLineErrorAbove(stringCart0003b, $('#txtPassword2SignUp'), {
                    offsets: [0, 38, 0, 10]
                });
                hasErrors = true;
            }
            if ($('#txtPasswordSignUp').val() !== $('#txtPassword2SignUp').val()) {
                $.fn.mooLogJsError.addFailure('txtPasswordSignUp', 'signin0007', stringCart0003c, 'password 2 did not match password 1');
                $.mooValidation.showInLineErrorAbove(stringCart0003c, $('#txtPassword2SignUp'), {
                    offsets: [0, 38, 0, 10]
                });
                hasErrors = true;
            }
            // need to validate state dropdown
            if ($(stateDropdownId + ':visible')[0] && $(stateDropdownId).val() === '--') {
                $.fn.mooLogJsError.addFailure(stateDropdownId, 'signin0008', string00009_as, 'state was not provided');
                $.mooValidation.showInLineErrorAbove(string00009_as, $(stateDropdownId), {
                    offsets: [0, 48, 0, 10]
                });
                hasErrors = true;
            }


            if (!$.fn.mooSignInSignUp.signUp.verticals.validate()) {
                hasErrors = true;
            }

            if (hasErrors) {
                $.fn.mooLogJsError.logFailures();
                $.fn.scrollToUppermostError();
                return false;
            } else {
                return true;
            }
        },
        ajaxRequest: function () {
            //validate their credentials
            if ($.fn.mooSignInSignUp.signUp.validate()) {
                var data = {
                    txtEmailSignUp:             $('#txtEmailSignUp').val(),
                    txtPasswordSignUp:          $('#txtPasswordSignUp').val(),
                    txtPassword2SignUp:         $('#txtPassword2SignUp').val(),
                    txtFirstName:               $('#txtFirstName').val(),
                    txtLastName:                $('#txtLastName').val(),
                    ddlCountry:                 $('#ddlCountry').val(),
                    rememberMeSignUp:           $('#rememberMeSignUp').attr('checked'),
                    chkNewsletter:              $('#chkNewsletter').val(),
                    btnPrimaryUse:              $('input[name="btnPrimaryUse"]:checked').val(),
                    ddlIdentityIndustry:        $('#ddlIdentityIndustry').val(),
                    txtIdentityProfession:      $('#txtIdentityProfession').val(),
                    txtIdentityProfessionOther: $('#txtIdentityProfessionOther').val(),
                    ddlIdentityCompanySize:     $('#ddlIdentityCompanySize').val(),
                    action:                     'createAccount'
                };
                // we need to dynamically create the name for this key
                data['ddlState' + $('#ddlCountry').val()] = $('#ddlState' + $('#ddlCountry').val()).val();

                // finally... it's ajax time
                $.ajax({
                    data: data
                });
            }
        }
    };

    $.fn.mooSignInSignUp.signUp.verticals = {
        init: function () {
            if ($.fn.mooSignInSignUp.signUp.verticals.hasVerticals()) { // if verticals are present...
                // Hide everything to start with
                $.fn.mooSignInSignUp.signUp.verticals.resetToDefault(false);

                // Bind to changes on the business / personal radio buttons
                $('input[name="btnPrimaryUse"]').live('change', function (e) {
                    $.fn.mooSignInSignUp.signUp.verticals.toggleVerticals($(e.target).attr('id'));
                });

                // bind to changes on the industry dropdown
                $('select[name="ddlIdentityIndustry"]').live('change', function (e) {
                    $.fn.mooSignInSignUp.signUp.verticals.toggleVerticals($(e.target).attr('id'));
                });

                // set the value of the hidden field
                $('.professionDropdown').live('change', function (e) {
                    $.fn.mooSignInSignUp.signUp.verticals.setSelectedProfession();
                });

                // Finally, make sure it's set correctly to the default
                if ($('input#primaryUseBusiness').attr('checked')) {
                    $.fn.mooSignInSignUp.signUp.verticals.toggleVerticals('primaryUseBusiness');
                    $.fn.mooSignInSignUp.signUp.verticals.toggleVerticals('ddlIdentityIndustry');
                    $.fn.mooSignInSignUp.signUp.verticals.setSelectedProfession();
                } else if ($('input#primaryUsePersonal').attr('checked')) {
                    $.fn.mooSignInSignUp.signUp.verticals.toggleVerticals('primaryUsePersonal');
                }
            }
        },
        resetToDefault: function (animate) {
            if (animate) {
                $('.defaultToHidden').slideUp();
            } else {
                $('.defaultToHidden').hide();
            }
        },
        resetProfessions: function () {
            $('.professionDropdownContainer').hide();
            $('#txtIdentityProfessionOther').val(null);
            $('#txtIdentityProfession').val(null);
        },
        setSelectedProfession: function () {
            var selectedIndustry = $('option:selected', $('#ddlIdentityIndustry')).attr('id'),
                selectedProfession = $('option:selected', $('#ddlIdentity' + selectedIndustry)).val();
            $('#txtIdentityProfession').val(selectedProfession);
        },
        toggleVerticals: function (targetId) {
            switch (targetId) {
            // one of the primary use radios
            case 'primaryUseBusiness':
                $('.industrySelectors').slideDown();
                break;
            case 'primaryUsePersonal':
                $.fn.mooSignInSignUp.signUp.verticals.resetToDefault(true);
                break;
            // else the industry dropdown
            case 'ddlIdentityIndustry':
                $.fn.mooSignInSignUp.signUp.verticals.resetProfessions();
                $('.' + $('option:selected', $('#ddlIdentityIndustry')).attr('id')).slideDown();
                break;
            }
        },
        validate: function () {
            if ($.fn.mooSignInSignUp.signUp.verticals.hasVerticals()) {

                var hasErrors = false;
                if ($('#ddlIdentityIndustry:visible').length > 0 && $('#ddlIdentityIndustry').val() === "0") {
                    $.fn.mooLogJsError.addFailure('ddlIdentityIndustry', 'signin0009', 'Sorry, you have to choose a valid industry sector', 'Industry not valid');
                    $.mooValidation.showInLineErrorAbove('Sorry, you have to choose a valid industry sector', $('#ddlIdentityIndustry'), {
                        offsets: [0, 48, 0, 10]
                    });
                    hasErrors = true;
                }

                if ($('.professionDropdown:visible').length > 0 && $('.professionDropdown:visible').val() === "0") {
                    $.fn.mooLogJsError.addFailure('ddlIdentityIndustry', 'signin0010', 'Sorry, you have to choose a valid business type', 'Profession not valid');
                    $.mooValidation.showInLineErrorAbove('Sorry, you have to choose a valid business type', $('.professionDropdown:visible'), {
                        offsets: [0, 48, 0, 10]
                    });
                    hasErrors = true;
                }
                if ($('#txtIdentityProfessionOther:visible').length > 0 && !$.mooValidation.validateNotEmpty($('#txtIdentityProfessionOther').val())) {
                    $.fn.mooLogJsError.addFailure('txtIdentityProfessionOther', 'signin0011', string00015_as, 'Industry Other textfield left empty');
                    $.mooValidation.showInLineErrorAbove(string00015_as, $('#txtIdentityProfessionOther'), {
                        offsets: [0, 48, 0, 10]
                    });
                    hasErrors = true;
                }
                if ($('#ddlIdentityCompanySize:visible').length > 0 && $('#ddlIdentityCompanySize').val() === "0") {
                    $.fn.mooLogJsError.addFailure('ddlIdentityCompanySize', 'signin0009', 'Sorry, you have to choose a valid company size', 'Company size not valid');
                    $.mooValidation.showInLineErrorAbove('Sorry, you have to choose a valid company size', $('#ddlIdentityCompanySize'), {
                        offsets: [0, 48, 0, 10]
                    });
                    hasErrors = true;
                }
                return !hasErrors;
            } else {
                // never fails because there was nothing to validate.
                return true;
            }
        },
        hasVerticals: function () {
            //pick an element to test - we use an id cos it's fastest
            return $('#primaryUseRadioContainer')[0] ? true : false;
        }
    };

    $(function () {
        // auto invoke the plugin on signIn & signUp form wrapper div
        // this is for the account/signin, account/create, cart/signin, dialog signin and mbs/signin page
        $('#signInSignUp').mooSignInSignUp();

        /**
         * Shows the  sign in iframe when Sign In on site header is clicked, and
         * closes once the user has signed in.
         * This makes use of the iframeWirings.js plugin and launches the
         * same sign in iframe as is used for all other sign ins now.
         *
         * Code for this link is in user-info.tpl
         */
        $('a.signIn').unbind('click');
        $('a.signIn').bind('click', function (e) {
            e.preventDefault();
            $.showSignInIframe({
                next: function () {
                    $.fn.mooIframeTrigger('close');
                }
            });
        });
    });
}(jQuery));

