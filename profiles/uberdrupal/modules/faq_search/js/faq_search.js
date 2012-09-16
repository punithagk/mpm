// $Id: faq_search.js,v 1.1.2.1 2009/09/08 18:12:42 johnpv Exp $

$(document).ready(function(){
  
  $("#edit-keyword").keyup(function(e){ 
    e.preventDefault();
    ajax_search();
  });
	
  function ajax_search(){ 
    $("#faq-results").slideDown(); 
    var search_val=$("#edit-keyword").val();
    if (search_val.length != "") {
      $.post("/faq_find", {keyword : search_val}, function(data){
        if (data.length > 0){ 
          $("#faq-results").html(data); 
        }
      })
    } else {
      $("#faq-results").html("<p class='message'>Please type a keyword.</p>");
    }
  }

});