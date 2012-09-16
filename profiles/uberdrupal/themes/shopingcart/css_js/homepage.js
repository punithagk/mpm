/* Included from: /javascript/slideshows/slideshow-large-thumbnails.js */

/* Homepage slideshow */

jQuery(function ($) {

    $('.slideshow-large-thumbnails-pager').append($('<ul class="inline slideshow-large-thumbnails-pager-menu" />'));

    /* Build the slideshow */
    startFrom = 0;
    $('.slideshow-large-thumbnails').children().each(function (index) {
        if ($(this).hasClass('startSlide')) {
            startFrom = index;
        }
    });


    $('.slideshow-large-thumbnails').cycle({
        fx:'fade',
        startingSlide:startFrom,
        speed:750,
        timeout:7760, // 7.76 seconds because 5 was tooo fast! 0 stops the slide at the first slide (ie user controlled only)
        sync:0, //makes the transition out finish before the transition in starts
        pager:'.slideshow-large-thumbnails-pager-menu',
        nowrap:true,
        activePagerClass:'activeSlide',
        // callback fn that creates a thumbnail to use as pager anchor 
        pagerAnchorBuilder:function (idx, slide) {
            var src, $hiddenImage

            $hiddenImage = $('.hidden-image:eq(0)', slide);

            html = '<li>' + $hiddenImage.html() + '</li>';
            return html;
        },
        pagerClick:function (index, sEl) {

            $(sEl).parents('.slideshow-large-thumbnails').cycle('pause');
        },
        before:function (cSel, nSel) {
            //on first visit our current slide is the same as the next slide
            //that becomes this next one.. being the first there is no need to do this stuff.

            if (nSel != cSel) {

                $(nSel).css('visibility', 'hidden');
                $(nSel).css('display', 'list-item');
                //only do the replacement in the (context of) next slide  .. stops the flash you get on slide on current
                var slide_heading = $('h2.heading', nSel);
                $(nSel).css('display', 'none');
                $(nSel).css('visibility', 'visible');
            }

        },
        end:function (options) {
            options.$cont.cycle('pause');
            options.$cont.cycle(0);


        },

        cleartypeNoBg:false
    });

    var slides = '.slideshow-large-thumbnails-pager-menu li';
    $(slides).css('z-index', 100).css('position', 'relative');

});


