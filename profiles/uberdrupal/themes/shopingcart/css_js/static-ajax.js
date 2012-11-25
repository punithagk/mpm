/* Included from: /javascript/ajax/get_user_data.js */

(function ($) {
    $(function () {

        var path = window.location.protocol == 'https:' ? pageData.secureServer : pageData.wwwServer;

        // AJAX call to get store/language message
        $.get(path + '/ajaxrequests/display_store_message.php',
            {
                pageURI:window.location.pathname
            },
            function (data) {
                displayStoreMessage(data);
            },
            'xml'
        );
        //AJAX call to get the user information for the header
        //clear out the header first
        var ulUserInfoHeight = $('ul#ulUserInfo').height();
        $('ul#ulUserInfo').empty().height(ulUserInfoHeight);
        $.get(path + '/ajaxrequests/get_user_data.php',
            {
                returnAfterLogin:window.location.href
            },
            function (data) {
                displayUserSpecificInformation(data);
            },
            'html'
        );

        /**
         * Displays the store/language message in the yellow stripe (geoip-cart-overlay.tpl)
         *
         * @param data string The template data to be rendered
         */
        function displayStoreMessage(data) {
            // Javascript has to be placed in the right places
            $('body').prepend('<div id="geoip-cart-overlay-insert"></div>');
            $.globalEval("" + $(data).first().find('body').first().find('script').first().text());

            $.getScript("" + $(data).first().first().find('script').first().attr('src'));
        }

        /**
         * Displays the siginin/signout links, cart icon and store switcher (user-info.tpl)
         *
         * @param data string The template data to be rendered
         */
        function displayUserSpecificInformation(data) {
            $('ul#ulUserInfo').replaceWith($(data));
            // We have to jNice the store switcher again
            $('form#frm_HeaderCountrySelector').jNice();
            // and we have to setup the signIn link
            $('a.signIn').unbind('click');
            $('a.signIn').bind('click', function (e) {
                e.preventDefault();
                $.showSignInIframe({
                    next:function () {
                        $.fn.mooIframeTrigger('close');
                    }
                });
            });
        }
    });
})(jQuery);

/* Included from: /javascript/ajax/operation_edit_alert.js */

$(document).ready(function () {
    // We have to detect if there is a localised request
    //Lang if exists is the second array element in path (/fr/)
    var pathParts = window.location.pathname.split('/');
    var lang = pathParts[1];

    if (lang.match('^[a-zA-Z]{2}(?:-[a-zA-Z]{2})?$')) {
        lang = '/' + lang;
    } else {
        lang = '';
    }
    // AJAX call to get operation edit alert if exists message
    $.get(lang + '/ajaxrequests/operation_edit_alert.php',
        {
        },
        function (data) {
            displayOperationEditAlertMessage(data);
        },
        'html'
    );


    /**
     * Displays the operation edit alert message (operation-edit-overlay.tpl)
     *
     * @param data string The template data to be rendered
     */
    function displayOperationEditAlertMessage(data) {
        // Add the alert div immediately after body
        $('body').prepend(data);
    }

});



