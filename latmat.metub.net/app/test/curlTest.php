<?php
/**
 * Created by PhpStorm.
 * User: Bee
 * Date: 7/15/2017
 * Time: 10:39 PM
 */
require_once("../lib/Helper.php");
$data = array(
    "ID"=>"00003",
    "fullname" => "Nguyễn Văn A",
    "email" => "p@gmail.com",
    "phone" => "0909887778"
);
$result = \Helper::curl("http://api.metub.tk/user", $data);
var_dump($result);