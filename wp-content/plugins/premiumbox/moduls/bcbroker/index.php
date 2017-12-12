<?php
if( !defined( 'ABSPATH')){ exit(); }

/*
title: [ru_RU:]BestChange парсер[:ru_RU][en_US:]BestChange parser[:en_US]
description: [ru_RU:]BestChange парсер[:ru_RU][en_US:]BestChange parser[:en_US]
version: 0.3
category: [ru_RU:]Направления обменов[:ru_RU][en_US:]Exchange directions[:en_US]
cat: naps
*/

$path = get_extension_file(__FILE__);
$name = get_extension_name($path);

/* BD */
add_action('pn_moduls_active_'.$name, 'bd_pn_moduls_active_bcbroker');
function bd_pn_moduls_active_bcbroker(){
global $wpdb;	
	 	
	$table_name = $wpdb->prefix ."bcbroker_vtypes";
    $sql = "CREATE TABLE IF NOT EXISTS $table_name(
		`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT ,
		`vtype_id` bigint(20) NOT NULL default '0',
		`vtype_title` longtext NOT NULL,
		PRIMARY KEY ( `id` )	
	) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";
	$wpdb->query($sql);	
	
	$table_name = $wpdb->prefix ."bcbroker_naps";
    $sql = "CREATE TABLE IF NOT EXISTS $table_name(
		`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT ,
		`naps_id` bigint(20) NOT NULL default '0',
		`reset_course` int(1) NOT NULL default '0',
		`v1` bigint(20) NOT NULL default '0',
		`v2` bigint(20) NOT NULL default '0',
		`now_sort` int(1) NOT NULL default '0',
		`pars_position` bigint(20) NOT NULL default '0',
		`name_column` int(20) NOT NULL default '0',
		`step` varchar(250) NOT NULL default '0',
		`cours1` varchar(250) NOT NULL default '0',
		`cours2` varchar(250) NOT NULL default '0',
		`min_sum` varchar(250) NOT NULL default '0',
		`max_sum` varchar(250) NOT NULL default '0',	
		`min_res` varchar(250) NOT NULL default '0',
		`status` int(1) NOT NULL default '0',
		`parser` bigint(20) NOT NULL default '0',
		`nums1` varchar(50) NOT NULL default '0',
		`elem1` int(2) NOT NULL default '0',
		`nums2` varchar(50) NOT NULL default '0',
		`elem2` int(2) NOT NULL default '0',
		PRIMARY KEY ( `id` )	
	) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";
	$wpdb->query($sql);	
	
	$query = $wpdb->query("SHOW COLUMNS FROM ". $wpdb->prefix ."bcbroker_naps LIKE 'reset_course'");
	if ($query == 0){
		$wpdb->query("ALTER TABLE ". $wpdb->prefix ."bcbroker_naps ADD `reset_course` int(1) NOT NULL default '0'");
	}
	$query = $wpdb->query("SHOW COLUMNS FROM ". $wpdb->prefix ."bcbroker_naps LIKE 'status'");
	if ($query == 0){
		$wpdb->query("ALTER TABLE ". $wpdb->prefix ."bcbroker_naps ADD `status` int(1) NOT NULL default '0'");
	}
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'parser'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `parser` bigint(20) NOT NULL default '0'");
    }		
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'nums1'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `nums1` varchar(50) NOT NULL default '0'");
    }
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'elem1'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `elem1` int(2) NOT NULL default '0'");
    }
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'nums2'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `nums2` varchar(50) NOT NULL default '0'");
    }
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'elem2'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `elem2` int(2) NOT NULL default '0'");
    }	
}

add_action('pn_bd_activated', 'bd_pn_moduls_migrate_bcbroker');
function bd_pn_moduls_migrate_bcbroker(){
global $wpdb;

	$query = $wpdb->query("SHOW COLUMNS FROM ". $wpdb->prefix ."bcbroker_naps LIKE 'reset_course'");
	if ($query == 0){
		$wpdb->query("ALTER TABLE ". $wpdb->prefix ."bcbroker_naps ADD `reset_course` int(1) NOT NULL default '0'");
	}
	$query = $wpdb->query("SHOW COLUMNS FROM ". $wpdb->prefix ."bcbroker_naps LIKE 'status'");
	if ($query == 0){
		$wpdb->query("ALTER TABLE ". $wpdb->prefix ."bcbroker_naps ADD `status` int(1) NOT NULL default '0'");
	}
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'parser'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `parser` bigint(20) NOT NULL default '0'");
    }		
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'nums1'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `nums1` varchar(50) NOT NULL default '0'");
    }
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'elem1'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `elem1` int(2) NOT NULL default '0'");
    }
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'nums2'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `nums2` varchar(50) NOT NULL default '0'");
    }
	$query = $wpdb->query("SHOW COLUMNS FROM ".$wpdb->prefix ."bcbroker_naps LIKE 'elem2'");
    if ($query == 0){
		$wpdb->query("ALTER TABLE ".$wpdb->prefix ."bcbroker_naps ADD `elem2` int(2) NOT NULL default '0'");
    }	
}
/* end BD */

add_action('admin_menu', 'pn_adminpage_bcparser');
function pn_adminpage_bcparser(){
global $premiumbox;
	
	add_menu_page(__('BestChange parser','pn'), __('BestChange parser','pn'), 'administrator', "pn_bc_parser", array($premiumbox, 'admin_temp'), $premiumbox->get_icon_link('parser'));
	add_submenu_page("pn_bc_parser", __('Settings','pn'), __('Settings','pn'), 'read', "pn_bc_parser", array($premiumbox, 'admin_temp'));
	$hook = add_submenu_page("pn_bc_parser", __('Adjustments','pn'), __('Adjustments','pn'), 'read', "pn_bc_adjs", array($premiumbox, 'admin_temp'));
	add_action( "load-$hook", 'pn_trev_hook' );
	add_submenu_page("pn_bc_parser", __('Add adjustment','pn'), __('Add adjustment','pn'), 'read', "pn_bc_add_adjs", array($premiumbox, 'admin_temp'));
}

/* обновление курса */
add_action('update_naps_bcparser', 'def_update_naps_bcparser', 10, 5);
function def_update_naps_bcparser($naps_id, $arr, $data, $rat, $options){
global $wpdb;

	$wpdb->update($wpdb->prefix."naps", $arr, array('id'=>$naps_id));	
	do_action('naps_change_course', $naps_id, '', $arr['curs1'], $arr['curs2'], 'bestchange');
}
/* end обновление курса */

global $premiumbox;
$premiumbox->file_include($path.'/api');
$premiumbox->file_include($path.'/filters');
$premiumbox->file_include($path.'/cron');
$premiumbox->file_include($path.'/settings');
$premiumbox->file_include($path.'/list');
$premiumbox->file_include($path.'/add');