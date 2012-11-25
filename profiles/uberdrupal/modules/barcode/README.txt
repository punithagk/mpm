$Id: README.txt,v 1.1 2008/11/17 21:30:35 skyredwang Exp $
***********
* README: *
***********

DESCRIPTION:
------------
This module provides a barcode field type for CCK.


REQUIREMENTS:
-------------
The barcode.module requires the content.module to be installed.


INSTALLATION:
-------------
1. Place the entire barcode directory into your Drupal modules/
   directory.

2. Enable the barcode module by navigating to:

     administer > modules

3. Copy your font to the barcode/ folder

4. Finish the configuration at admin/content/barcode


Features:
---------
* Generate a barcode image on the fly. It supports EAN-13,EAN-8,UPC-A,UPC-E,ISBN ,2 of 5 Symbologies(std,ind,interleaved),postnet,codabar,code128,code39,code93 symbologies.
* You can also display the barcode as simple text.
* You need provide your own font file

Author:
-------
Jingsheng Wang
INsReady.com
skyred ( ^ ) live.com
