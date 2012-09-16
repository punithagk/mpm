jQuery(function ($) {
    //lets find all the video box trigger images and make them on click replace the image with a player

    $('.video-trigger-link').click(function (event) {
        var image, width, height, videoHtml, videoRegEx, matches, videoUrl;
        //first lets see if they have flash player installed.. if not?what? meh for now just do nothing.
        if (swfobject && !swfobject.hasFlashPlayerVersion('8')) {
            image = $(this).children('img').eq(0);
            $(this).replaceWith("<p style='text-align:center;width:" + $(image).width() + "height:" + $(image).height() + "'><a href=\"http://www.adobe.com/go/getflashplayer\">" +
                "<img src=\"http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif\"" +
                "alt=\"Get Adobe Flash player\" /></a></p>");
            return false;
        }

        videoRegex = /^http:\/\/player\.vimeo\.com\/video\/([0-9]+)$/;
        videoUrl = $(this).attr('href');
        matches = videoRegex.exec(videoUrl);

        if (matches != null && matches[1] != null) {

            image = $(this).children('img').eq(0);
            if (image) {
                //get the width
                width = image.width();
                height = image.height();

                videoHtml = "<iframe id=\"vimeo-player\" src=\"http://player.vimeo.com/video/" + matches[1] + "?api=1&amp;autoplay=1&amp;player_id=vimeo-player\" width=\"" + width + "\" height=\"" + height + "\" frameborder=\"0\"></iframe>";

                $(this).replaceWith(videoHtml);

            }

        }

        videoRegex = /^http:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+).*$/;
        videoUrl = $(this).attr('href');
        matches = videoRegex.exec(videoUrl);
        if (matches != null && matches[1] != null) {
            image = $(this).children('img').eq(0);
            if (image) {
                //get the width
                width = image.width();
                height = image.height();

                videoHtml = "<object 	width=\"" + width + "\" height=\"" + height + "\">" +
                    "<param name=\"movie\" value=\"http://www.youtube.com/v/" + matches[1] + "&amp;fs=1&amp;autoplay=1&amp;hd=1\"></param>" +
                    "<param name=\"allowFullScreen\" value=\"true\"></param>" +
                    "<param name=\"allowscriptaccess\" value=\"always\"></param>" +
                    "<embed src=\"http://www.youtube.com/v/" + matches[1] + "&amp;fs=1&amp;autoplay=1&amp;hd=1\" " +
                    "type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" allowfullscreen=\"true\"" +
                    "width=\"" + width + "\" height=\"" + height + "\"></embed></object>";

                $(this).replaceWith(videoHtml);
            }

        }
        return false;

    });


    var getOverlayEmbedHtml = function (videoUrl, videoTitle) {
        var videoRegex = /^http:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+).*$/;
        //var videoUrl = $(this).attr('href');
        matches = videoRegex.exec(videoUrl);
        if (matches != null && matches[1] != null) {
            var videoKey = matches[1];
            var videoOverlay = document.createElement("div");
            //videoOverlay.className = "video-overlay-container";
            videoHtml = "<h2 class=\"underline-dotted\">" + videoTitle + "</h2>" +
                "<object width=\"640\" height=\"385\">" +
                "<param name=\"movie\" value=\"http://www.youtube.com/v/" + videoKey + "?fs=1&amp;hl=en_US&autoplay=1\"></param>" +
                "<param name=\"allowFullScreen\" value=\"true\"></param><param name=\"allowscriptaccess\" value=\"always\"></param>" +
                "<embed src=\"http://www.youtube.com/v/" + videoKey + "?fs=1&amp;hl=en_US&autoplay=1\"" +
                " type=\"application/x-shockwave-flash\"" +
                " allowscriptaccess=\"always\"" +
                " allowfullscreen=\"true\"" +
                " width=\"640\" height=\"385\">" +
                "</embed>" +
                "</object>";
            return videoHtml;
        } else {

            videoRegex = /^http:\/\/player\.vimeo\.com\/video\/([0-9]+)$/;
            matches = videoRegex.exec(videoUrl);

            if (matches != null && matches[1] != null) {
                var videoKey = matches[1];
                var videoOverlay = document.createElement("div");

                videoHtml = "<iframe id=\"vimeo-player\" src=\"http://player.vimeo.com/video/" + videoKey + "?api=1&amp;autoplay=1&amp;player_id=vimeo-player\" width=\"640\" height=\"385\" frameborder=\"0\"></iframe>";

                return videoHtml;
            } else {

                return "";
            }
        }
    };

    $('.video-overlay-link').each(function (event) {

        //Create the DIV for the actual overlay here, as long as it hasn't
        //been done before, so that we don't create it unless there *is* a link
        //which requires the overlay
        if ($('#divVideoOverlay').length == 0) {
            var videoOverlayDiv = $('<div>').attr('id', 'divVideoOverlay').addClass('rounded-corners-5').addClass('overlay-container').appendTo('body');

            $("<div>", {
                "class":"overlay-content rounded-corners-5 clearfix"
            }).css('width', '640px').css('height', '430px').appendTo(videoOverlayDiv);
        }

        var videoUrl = $(this).attr('href');

        var videoTitle = $(this).attr("title");

        $(this).overlay({
            onBeforeLoad:function (e) {
                $(".overlay-content", this.getOverlay()).html(getOverlayEmbedHtml(videoUrl, videoTitle));
            },
            onClose:function (e) {
                $(".overlay-content", this.getOverlay()).html("<div style=\"width: 640px; height:385px\"/>");
            },
            mask:{
                color:'#0a0a0a',
                opacity:0.3
            },
            target:$('#divVideoOverlay')
        });
    });
});