(function(){var f=null;var h="google_conversion_id google_conversion_format google_conversion_type google_conversion_order_id google_conversion_language google_conversion_value google_conversion_domain google_conversion_label google_conversion_color google_disable_viewthrough google_remarketing_only google_remarketing_for_search google_conversion_items google_custom_params google_conversion_date google_conversion_time google_conversion_js_version onload_callback opt_image_generator google_is_call".split(" ");
function i(b){return b!=f?escape(b.toString()):""}function j(b,a){var d=i(a);if(""!=d){var c=i(b);if(""!=c)return"&".concat(c,"=",d)}return""}function k(b){var a=typeof b;return b==f||"object"==a||"function"==a?f:(""+b).replace(/,/g,"\\,").replace(/;/g,"\\;").replace(/=/g,"\\=")}
function l(b){var a;b=b.google_custom_params;if(!b||"object"!=typeof b||"function"==typeof b.join)a="";else{var d=[];for(a in b)if(Object.prototype.hasOwnProperty.call(b,a)){var c=b[a];if(c&&"function"==typeof c.join){for(var e=[],g=0;g<c.length;++g){var p=k(c[g]);p!=f&&e.push(p)}c=0==e.length?f:e.join(",")}else c=k(c);(e=k(a))&&c!=f&&d.push(e+"="+c)}a=d.join(";")}return""==a?"":"&".concat("data=",encodeURIComponent(a))}
function m(b){return"number"!=typeof b&&"string"!=typeof b?"":i(b.toString())}function n(b){if(!b)return"";b=b.google_conversion_items;if(!b)return"";for(var a=[],d=0,c=b.length;d<c;d++){var e=b[d],g=[];e&&(g.push(m(e.value)),g.push(m(e.quantity)),g.push(m(e.item_id)),g.push(m(e.adwords_grouping)),g.push(m(e.sku)),a.push("("+g.join("*")+")"))}return 0<a.length?"&item="+a.join(""):""}
function o(b,a,d){var c=[];if(b){var e=b.screen;e&&(c.push(j("u_h",e.height)),c.push(j("u_w",e.width)),c.push(j("u_ah",e.availHeight)),c.push(j("u_aw",e.availWidth)),c.push(j("u_cd",e.colorDepth)));b.history&&c.push(j("u_his",b.history.length))}d&&"function"==typeof d.getTimezoneOffset&&c.push(j("u_tz",-d.getTimezoneOffset()));a&&("function"==typeof a.javaEnabled&&c.push(j("u_java",a.javaEnabled())),a.plugins&&c.push(j("u_nplug",a.plugins.length)),a.mimeTypes&&c.push(j("u_nmime",a.mimeTypes.length)));
return c.join("")}function q(b,a){var d="";if(a){var d=d+j("ref",a.referrer!=f?a.referrer.toString().substring(0,256):""),c;c=2;try{if(b.top.document==b.document)c=0;else{var e;var g=b.top;try{e=!!g.location.href||""===g.location.href}catch(p){e=!1}e&&(c=1)}}catch(H){}e="";e=1==c?b.top.location.href:b.location.href;d+=j("url",e!=f?e.toString().substring(0,256):"");d+=j("frm",c)}return d}
function r(b){return b&&b.location&&b.location.protocol&&"https:"==b.location.protocol.toString().toLowerCase()?"https:":"http:"}function s(b){return b.google_remarketing_only?"googleads.g.doubleclick.net":b.google_conversion_domain||"www.googleadservices.com"}
function t(b,a){var d=navigator,c=document,e="/?";"landing"==a.google_conversion_type&&(e="/extclk?");var e=r(b)+"//"+s(a)+"/pagead/"+[a.google_remarketing_only?"viewthroughconversion/":"conversion/",i(a.google_conversion_id),e,"random=",i(a.google_conversion_time)].join(""),g;a:{g=a.google_conversion_language;if(g!=f){g=g.toString();if(2==g.length){g=j("hl",g);break a}if(5==g.length){g=j("hl",g.substring(0,2))+j("gl",g.substring(3,5));break a}}g=""}return e+=[j("cv",a.google_conversion_js_version),
j("fst",a.google_conversion_first_time),j("num",a.google_conversion_snippets),j("fmt",a.google_conversion_format),j("value",a.google_conversion_value),j("label",a.google_conversion_label),j("oid",a.google_conversion_order_id),j("bg",a.google_conversion_color),g,j("guid","ON"),j("disvt",a.google_disable_viewthrough),j("is_call",a.google_is_call),n(a),o(b,d,a.google_conversion_date),q(b,c),l(a),a.google_remarketing_for_search&&!a.google_conversion_domain?"&srr=n":""].join("")}
function u(){var b=v,a=w,d=r(b)+"//www.google.com/ads/user-lists/"+[i(a.google_conversion_id),"/?random=",Math.floor(1E9*Math.random())].join("");return d+=[j("label",a.google_conversion_label),j("fmt","3"),q(b,document)].join("")}
function x(){var b=v,a=v,d=t(b,a),c=function(a,b,c){return'<img height="'+c+'" width="'+b+'" border="0" src="'+a+'" />'};return 0==a.google_conversion_format&&a.google_conversion_domain==f?'<a href="'+(r(b)+"//services.google.com/sitestats/"+({ar:1,bg:1,cs:1,da:1,de:1,el:1,en_AU:1,en_US:1,en_GB:1,es:1,et:1,fi:1,fr:1,hi:1,hr:1,hu:1,id:1,is:1,it:1,iw:1,ja:1,ko:1,lt:1,nl:1,no:1,pl:1,pt_BR:1,pt_PT:1,ro:1,ru:1,sk:1,sl:1,sr:1,sv:1,th:1,tl:1,tr:1,vi:1,zh_CN:1,zh_TW:1}[a.google_conversion_language]?a.google_conversion_language+
".html":"en_US.html")+"?cid="+i(a.google_conversion_id))+'" target="_blank">'+c(d,135,27)+"</a>":1<a.google_conversion_snippets||3==a.google_conversion_format?c(d,1,1):'<iframe name="google_conversion_frame" width="'+(2==a.google_conversion_format?200:300)+'" height="'+(2==a.google_conversion_format?26:13)+'" src="'+d+'" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no">'+c(d.replace(/\?random=/,"?frame=0&random="),1,1)+"</iframe>"}
function y(){return new Image}function z(){var b=w,a=u(),d=y;"function"===typeof b.opt_image_generator&&(d=b.opt_image_generator);b=d();a+=j("async","1");b.src=a;b.onload=function(){}};var v=window;
if(v)if(/[\?&;]google_debug/.exec(document.URL)!=f){var A=v,B=document.getElementsByTagName("head")[0];B||(B=document.createElement("head"),document.getElementsByTagName("html")[0].insertBefore(B,document.getElementsByTagName("body")[0]));var C=document.createElement("script");C.src=r(window)+"//"+s(A)+"/pagead/conversion_debug_overlay.js";B.appendChild(C)}else{try{var D;var E=v;"landing"==E.google_conversion_type||!E.google_conversion_id||E.google_remarketing_only&&E.google_disable_viewthrough?D=
!1:(E.google_conversion_date=new Date,E.google_conversion_time=E.google_conversion_date.getTime(),E.google_conversion_snippets="number"==typeof E.google_conversion_snippets&&0<E.google_conversion_snippets?E.google_conversion_snippets+1:1,"number"!=typeof E.google_conversion_first_time&&(E.google_conversion_first_time=E.google_conversion_time),E.google_conversion_js_version="7",0!=E.google_conversion_format&&(1!=E.google_conversion_format&&2!=E.google_conversion_format&&3!=E.google_conversion_format)&&
(E.google_conversion_format=1),D=!0);if(D&&(document.write(x()),v.google_remarketing_for_search&&!v.google_conversion_domain)){var w=v;z()}}catch(F){}for(var G=v,I=0;I<h.length;I++)G[h[I]]=f};})();