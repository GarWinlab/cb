<?php
if( !defined( 'ABSPATH')){ exit(); }

add_action('pn_adminpage_title_pn_bc_parser', 'pn_adminpage_title_pn_bc_parser');
function pn_adminpage_title_pn_bc_parser(){
	_e('BestChange parser','pn');
} 

add_action('pn_adminpage_content_pn_bc_parser','def_pn_adminpage_content_pn_bc_parser');
function def_pn_adminpage_content_pn_bc_parser(){
global $premiumbox, $wpdb;

	$data = get_option('bcbroker');
	if(!is_array($data)){ $data = array(); }

	$options = array();
	$options['top_title'] = array(
		'view' => 'h3',
		'title' => __('Settings','pn'),
		'submit' => __('Save','pn'),
		'colspan' => 2,
	);
	$options['hideid'] = array(
		'view' => 'inputbig',
		'title' => __('Black list of exchangers ID (separate coma)','pn'),
		'default' => is_isset($data, 'hideid'),
		'name' => 'hideid',
		'not_auto' => 1,
	);
	$options['onlyid'] = array(
		'view' => 'inputbig',
		'title' => __('White list of exchangers ID (separate coma)','pn'),
		'default' => is_isset($data, 'onlyid'),
		'name' => 'onlyid',
		'not_auto' => 1,
	);	
	$options['test'] = array(
		'view' => 'select',
		'title' => __('Test mode','pn'),
		'default' => is_isset($data, 'test'),
		'options' => array('0'=>  __('No','pn'), '1'=> __('Yes','pn')),
		'name' => 'test',
		'not_auto' => 1,
	);	
	$options['bottom_title'] = array(
		'view' => 'h3',
		'title' => '',
		'submit' => __('Save','pn'),
		'colspan' => 2,
	);			
	pn_admin_one_screen('', $options, '', pn_link_post('pn_bc_parser_save'));
?>
<form method="post" action="<?php pn_the_link_post(); ?>">
	<?php wp_referer_field(); ?>
	
	<div class="premium_body">
		<table class="premium_standart_table">
		
			<?php 
			$lists = array();
			
			$my_dir = wp_upload_dir();
			$path = $my_dir['basedir'].'/bcparser/bm_cy.dat';
			
			if(is_file($path)){
				$fdata = @file_get_contents($path);
				$lists = explode("\n", $fdata);
			}
			
			$in_w = array();
			$works = $wpdb->get_results("SELECT * FROM ". $wpdb->prefix ."bcbroker_vtypes");
			foreach($works as $work){
				$in_w[] = $work->vtype_id;
			}
			
			pn_h3('', __('Save','pn'));
			
			$new_lists = array();
			foreach($lists as $val){
				$in = explode(";",$val);
				$title = get_tgncp($in[2]).' ('. get_tgncp($in[3]) .')';
				$title = pn_strip_input($title);
				$new_lists[$in[0]] = $title;
			}	

			asort($new_lists);
			
			foreach($new_lists as $key => $title){
				$checked = '';
				if(in_array($key, $in_w)){
					$checked = 'checked="checked"';
				}
			?>		
			<tr>
				<td>		
					<label><input type="checkbox" name="pars[]" <?php echo $checked; ?> value="<?php echo $key; ?>" /> <?php echo $title; ?></label>
				</td>
			</tr>
			<?php 
			}  
			
			pn_h3('', __('Save','pn'));
			?>
			
		</table>
	</div>
</form>	
<?php
}   
 
add_action('premium_action_pn_bc_parser_save','def_premium_action_pn_bc_parser_save');
function def_premium_action_pn_bc_parser_save(){
global $wpdb;	

	only_post();
	pn_only_caps(array('administrator'));

	$bcbroker = array();
	$bcbroker['hideid'] = is_param_post('hideid');
	$bcbroker['onlyid'] = is_param_post('onlyid');
	$bcbroker['test'] = intval(is_param_post('test'));
	update_option('bcbroker', $bcbroker);

	$back_url = is_param_post('_wp_http_referer');
	$back_url .= '&reply=true';
			
	wp_safe_redirect($back_url);
	exit;
}
 
add_action('premium_action_pn_bc_parser','def_premium_action_pn_bc_parser');
function def_premium_action_pn_bc_parser(){
global $wpdb;	
	
	only_post();
	pn_only_caps(array('administrator'));
	
	$my_dir = wp_upload_dir();
	$path = $my_dir['basedir'].'/bcparser/bm_cy.dat';
	$lists = array();
	if(is_file($path)){
		$fdata = file_get_contents($path);
		$lists = explode("\n", $fdata);
	}	
	
	$pars = is_param_post('pars'); if(!is_array($pars)){ $pars = array(); }
	$wpdb->query("DELETE FROM ".$wpdb->prefix."bcbroker_vtypes");
	
	foreach($lists as $val){
		$in = explode(";",$val);
		if(in_array($in[0], $pars)){
			$arr = array();
			$arr['vtype_id'] = intval($in[0]);
			$arr['vtype_title'] = pn_strip_input(get_tgncp($in[2])).' ('. pn_strip_input(get_tgncp($in[3])) .')';
			$wpdb->insert($wpdb->prefix."bcbroker_vtypes", $arr);
		}
	}
	
	$back_url = is_param_post('_wp_http_referer');
	$back_url .= '&reply=true';
			
	wp_safe_redirect($back_url);
	exit;	
} 