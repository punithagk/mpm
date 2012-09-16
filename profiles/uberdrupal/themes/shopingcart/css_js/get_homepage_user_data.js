(function ($) {
    $(function () {

    	var url = "/ajaxrequests/homepage_userdata.php";
		$.getJSON(url,
			function(result) {
			    if(result.firstName){
				    displayWelcomeMessage(result.firstName) 
				    
				    // so given we've got the firstname,  they're prolly signed in,   
				    // lets have a go at displaying the remembered box
				    
				    //AJAX call to get the user information for the heade
			        
				    
				    // display spinny overlay a spinny over the remembered box whilst we wait
				    $('.unknown-box').hide();
				    $('.no-content-yet').show();				    
				    
			        var path = window.location.protocol == 'https:' ? pageData.secureServer : pageData.wwwServer;
			        $.get(path + '/ajaxrequests/homepage_remembered_box.php',
			            {
			                returnAfterLogin:window.location.href
			            },
			            function (data) {
			                displayRememberedBox(data);
						    $('.homepage-text-box-fixed').show();
						    $('.no-content-yet').hide();
			            },
			            'html'
			        );

			        
			        
			    } else {
			    	$('.headingReturning').hide();
			    }   
			}
		);
		
        /**
         * Displays the welcome message 
         *
         * @param data string The template data to be rendered
         */
        function displayWelcomeMessage(data) {
        	$('#mooFirstName').prepend(data);
        	$('.headingReturning').removeClass('hidden');
        	$('.headingStatic').hide();
        	$('.slideshow-large-thumbnails-pager-menu').find('li a p').first().html($('#welcomeMessage').text())
        }

        
        /**
         * Displays the welcome message 
         *
         * @param data string The template data to be rendered
         */
        function displayRememberedBox(data) {
        	$('.static-box').html(data);
        	
        	/* Build the slideshow */
        	/* this used to be in slideshow-saved-items.js but needs moving here now we are dynamically loading
        	 * the saved items box.
        	 */
            startFrom = 0;
            
            $('.slideshow-saved-items').children().each(function (index) {
                if ($(this).hasClass('startSlide')) {
                    startFrom = index;
                }
            });

            $('.slideshow-saved-items').cycle({
                fx:'scrollHorz',
                startingSlide:startFrom,
                speed:250,
                timeout:0, // 0 stops the slide at the first slide (ie user controlled only)
                sync:0, //makes the transition out finish before the transition in starts
                after:function (cur, next) {
                    //oddly you would think that cur would be what it is on AFTER it has done stuff.. but apprently next is
                    //this is because it is in the scope of what was shown
                    //(so curr would be what was shown and next what is going to be shown)
                    $('.slideshow-saved-items-finish-this').attr('href', $(next).find('.slideshow-finish-link').eq(0).attr('href'));
                },
                next:'.slideshow-saved-items-contols .right-button',
                prev:'.slideshow-saved-items-contols .left-button',
                cleartypeNoBg:true
            });
        	
        }
    });
})(jQuery);