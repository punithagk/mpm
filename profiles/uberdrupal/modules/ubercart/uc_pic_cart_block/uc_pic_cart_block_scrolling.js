// $Id: uc_pic_cart_block_scrolling.js,v 1.3 2009/05/12 18:12:23 vetkhy Exp $

/**
 * @file
 * Scrolling script for our block.
 */

function setCookie(name, value) {
      var valueEscaped = escape(value);
      var expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + 365 * 24 * 60 * 60 * 1000); // срок - 1 год, но его можно изменить
      var expires = expiresDate.toGMTString();
      var newCookie = name + "=" + valueEscaped + "; path=/; expires=" + expires;
      if (valueEscaped.length <= 4000) document.cookie = newCookie + ";";
}

function getCookie(name) {
      var prefix = name + "=";
      var cookieStartIndex = document.cookie.indexOf(prefix);
      if (cookieStartIndex == -1) return null;
      var cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length);
      if (cookieEndIndex == -1) cookieEndIndex = document.cookie.length;
      return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex));
}

$(document).ready(function () {
    if (Drupal.settings.ucPicCartBlockUseScroll == true) {
      var scrollArea = $("#uc_pic_cart_block_scroll_area");
      var contentArea = $("#uc_pic_cart_block_content");

      var newHeight = 0;
      var delta = 0;

      var cook = null;

      if (Drupal.settings.ucPicCartBlockOrientation == 0) {
        
        // Average height of items multiplied by scroll count
        newHeight = contentArea.height() / Drupal.settings.ucPicCartBlockProductCount * Drupal.settings.ucPicCartBlockScrollCount;
        delta = $("tr:last", contentArea).height(); // height of row with count and sum
        
        var arrowUp = $(".uc_pic_cart_block_scroll_up_def");
        var arrowDown = $(".uc_pic_cart_block_scroll_down_def");
        
        scrollArea.addClass("uc_pic_cart_block_scroll_area_vert");
        
        arrowUp.removeClass("uc_pic_cart_block_scroll_up_def").addClass("uc_pic_cart_block_scroll_up_scroll");
        arrowDown.removeClass("uc_pic_cart_block_scroll_down_def").addClass("uc_pic_cart_block_scroll_down_scroll");
        
        scrollArea.height(newHeight);

        cook = getCookie("ucPicCartBlockScrollPos");

        if (cook) {
          scrollArea.scrollTop(cook);
        }

        arrowUp.click(function () {
            scrollArea.scrollTop(scrollArea.scrollTop() - delta);
            setCookie("ucPicCartBlockScrollPos", scrollArea.scrollTop());
          }
        );
          
        arrowDown.click(function () {
            scrollArea.scrollTop(scrollArea.scrollTop() + delta);
            setCookie("ucPicCartBlockScrollPos", scrollArea.scrollTop());
          }
        );
        

      }
      else {
        var wdtNeed = 0;

        $("div.uc_pic_cart_block_item_hor", contentArea).each(function (index) {
          wdtNeed = wdtNeed + $(this).outerWidth(true) + 2;
          if (newHeight < $(this).outerHeight(true)) {
            newHeight = $(this).outerHeight(true);
          }
        });


        if (wdtNeed < scrollArea.width()) return;
      
        delta = wdtNeed / (2 * Drupal.settings.ucPicCartBlockProductCount);

        var arrowLeft = $(".uc_pic_cart_block_scroll_left_def");
        var arrowRight = $(".uc_pic_cart_block_scroll_right_def");
        
        arrowLeft.removeClass("uc_pic_cart_block_scroll_left_def").addClass("uc_pic_cart_block_scroll_left_scroll");
        arrowRight.removeClass("uc_pic_cart_block_scroll_right_def").addClass("uc_pic_cart_block_scroll_right_scroll");
        
        arrowLeft.height(newHeight);
        arrowRight.height(newHeight);
        
        var img = $("img", arrowLeft);
        img.css({'position' : 'relative', 'top' : newHeight / 2 - img.height()});
        img = $("img", arrowRight);
        img.css({'position' : 'relative', 'top' : newHeight / 2 - img.height()});
        
        scrollArea.addClass("uc_pic_cart_block_scroll_area_hor");
        contentArea.height(newHeight);
        contentArea.width(wdtNeed);

        // setting absolute position and width - need for crossbrowsing :(
        var lft=arrowLeft.position().left + arrowLeft.outerWidth(true) + 1;
        var wdtBlock = arrowRight.position().left - lft-arrowRight.outerWidth(true) + arrowRight.innerWidth() + 1;
        scrollArea.css({"position" : "absolute", "top" : arrowLeft.position().top, "left" : lft});
        scrollArea.width(wdtBlock);

        cook = getCookie("ucPicCartBlockScrollPos");

        if (cook) {
          scrollArea.scrollLeft(cook);
        }

        arrowLeft.click(function () {
            scrollArea.scrollLeft(scrollArea.scrollLeft() - delta);
            setCookie("ucPicCartBlockScrollPos", scrollArea.scrollLeft());
          }
        );
        arrowRight.click(function () {
            scrollArea.scrollLeft(scrollArea.scrollLeft() + delta);
            setCookie("ucPicCartBlockScrollPos", scrollArea.scrollLeft());
          }
        );
      }
    }
    else {
      setCookie("ucPicCartBlockScrollPos", 0);
    }
  }
  
)
