<?php
if( !defined( 'ABSPATH')){ exit(); }

add_action('pn_adminpage_content_pn_bc_parser','bcbroker_pn_admin_content_pn_bc_parser', 0);
function bcbroker_pn_admin_content_pn_bc_parser(){
	$text = '<a href="'. get_site_url_or() .'/request-bc_parser.html'. get_hash_cron('?') .'" target="_blank">'. __('Cron URL for updating rates in BestChange parser module','pn') .'</a>';
	pn_admin_substrate($text);
}

add_action('myaction_request_bc_parser','def_request_bc_parser');
function def_request_bc_parser(){
global $wpdb;
	if(check_hash_cron()){
		if(function_exists('download_data_bcparser')){
			download_data_bcparser();
		}
		if(function_exists('set_naps_bcparser')){
			set_naps_bcparser();
		}
		_e('Done','pn');
		exit;
	}
}