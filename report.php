<?php
require("/var/www/html/wp-load.php");

echo '{"success":true}';

$str = "";

while (list($key, $val) = each($_POST)) {
    $str .= "$key => $val,";
}

function getRowReport2($str)
{

    global $wpdb;
    $wpdb->update( 'upd_report', $_POST, array( 'id' => 1 ) ) ;

}

getRowReport2($str);



