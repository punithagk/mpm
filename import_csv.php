<?php
mysql_connect("localhost", "root","admin");
mysql_select_db("mpm");
echo mysql_error();
$row = 1;
if (($handle = fopen("/var/www/mpm/I2KCUSTOMERS.csv", "r")) !== FALSE) {

    while (($data = fgetcsv($handle, 10000, ";")) !== FALSE) {
        
	if($row>1 && !empty($data[11])) {
			mysql_query("INSERT INTO  `mpm`.`users` (
`uid` ,
`name` ,
`pass` ,
`mail` ,

`created` ,
`access` ,
`login` ,
`status` ,
`timezone` ,

`init` )
VALUES (
NULL ,  '".strtolower($data[11])."',  '".md5(strtolower($data[11]))."',  '".strtolower($data[11])."',  '".strtotime("now")."',  '".strtotime("now")."',  '".strtotime("now")."',  '1', '-25200' ,   '".$data[11]."');");
 echo mysql_error()."<br>";
     $last_insert_id = mysql_insert_id();
	 if($last_insert_id) {
	 if(!mysql_query("INSERT INTO uc_addresses (uid,first_name,last_name,phone,company,street1,street2,city,zone,postal_code,country,address_name,created,modified) 
									values ('".$last_insert_id."','".$data[3]."','".$data[4]." ".$data[5]."','".$data[7]."','".(empty($data[0]) ? str_replace("'","`", $data[1]) :str_replace("'","`", $data[0]))."','".str_replace("'","`", $data[12])."','".str_replace("'","`", $data[13])."','".$data[14]."','".$data[15]."','".$data[16]."',840,'".$data[6]."','".strtotime("now")."','".strtotime("now")."')")) echo mysql_error()."<br>";
	  
	  if($data[12] != $data[17] || $data[13]!= $data[18] || $data[14] != $data[19] || $data[15] != $data[20] || $data[16]!= $data[21]) 
	  if(!mysql_query("INSERT INTO uc_addresses (uid,first_name,last_name,phone,company,street1,street2,city,zone,postal_code,country,address_name,created,modified) 
									values ('".$last_insert_id."','".$data[3]."','".$data[4]." ".$data[5]."','".$data[7]."','".(empty($data[0]) ? str_replace("'","`", $data[1]) :str_replace("'","`", $data[0]))."','".str_replace("'","`", $data[17])."','".str_replace("'","`", $data[18])."','".$data[19]."','".$data[20]."','".$data[21]."',840,'".$data[6]."','".strtotime("now")."','".strtotime("now")."')")) echo mysql_error()."<br>"; 


									}
		}
		$row++;
		
    }
    fclose($handle);
}
?>