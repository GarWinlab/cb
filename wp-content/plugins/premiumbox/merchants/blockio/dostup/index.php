<?php 
/*
Внимание! Не удаляйте кавычки при указание ваших значений.
Urgent! Do not delete quotation marks while entering data

Важно: для корректной работы модуля необходимы PHP 5.6 и следующие PHP библиотеки в полном объеме: mcrypt, gmp, curl. 
Important: for correct operation of the module required PHP 5.6 and PHP libraries: mcrypt, gmp, curl
*/
$marr = array();
$marr['BLOCKIO_SSL'] = "0"; 							// Поддержка соединения TLSv1 для библиотеки CURL (0-нет, 1-да) / Support TLSv1 connections for CURL library (0-false, 1-true)
$marr['BLOCKIO_CV'] = "3"; 								// Укажите количество подтверждений, когда заявка считается оплаченной / The required number of transaction confirmations
$marr['BLOCKIO_PIN'] = "Iamnotrobot2017"; 		// Ваш Secret PIN / Secret PIN
$marr['BLOCKIO_BTC'] = "2386-543c-46cf-9ff4"; 		// Ваш API Key для Bitcoin / Bitcoin API key
$marr['BLOCKIO_LTC'] = "9557-2d74-5741-ee5b"; 		// Ваш API Key для Litecoin / Litecoin API key
$marr['BLOCKIO_DOGE'] = "7aef-cae6-0b87-e8b0"; 		// Ваш API Key для Dogecoin / Dogecoin API key
