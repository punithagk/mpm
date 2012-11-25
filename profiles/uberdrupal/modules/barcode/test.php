<?php 

 $path = 'barcodes';
 $encoding =  'UPC-A';  //array('UPC-A');
 $filename = '/var/www/market/sites/default/files/barcodes/'.'12'.$encoding.'.png';
 if (!file_exists($filename)) {
        include_once 'barcode.inc.php';
        $bar= new BARCODE();
        $type = 'png';
        $bar->setSymblogy($encoding);
        $bar->setHeight('30');
        $bar->setScale('2.0');
        $bar->setHexColor('#000000','#FFFFFF');
        $bar->setFont('arialbd.ttf');
        $bar->genBarCode('12',$type,'/var/www/market/sites/default/files/barcodes/12'.$encoding);
	print_r($bar);
  }

