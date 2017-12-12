<?php
if( !defined( 'ABSPATH')){ exit(); }

add_action('pn_naps_copy', 'pn_naps_copy_bcbroker', 1, 2);
function pn_naps_copy_bcbroker($last_id, $new_id){
global $wpdb;
	$broker = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."bcbroker_naps WHERE naps_id='$last_id'"); 
	if(isset($broker->id)){
		$arr = array();
		foreach($broker as $k => $v){
			$arr[$k] = $v;
		}
		$arr['naps_id'] = $new_id;		
		$wpdb->insert($wpdb->prefix.'bcbroker_naps', $arr);
	}
}

add_filter('list_tabs_naps', 'bcbroker_list_tabs_naps');
function bcbroker_list_tabs_naps($list_tabs_naps){
	$new_list_tabs_naps = array();
		
	foreach($list_tabs_naps as $k => $v){
		$new_list_tabs_naps[$k] = $v;
		if($k == 'tab2'){
			$new_list_tabs_naps['bcbroker'] = __('BestChange parser','pn');
		}
	}
		
	return $new_list_tabs_naps;
}

add_action('tab_naps_bcbroker', 'def_tab_naps_bcbroker');
function def_tab_naps_bcbroker($data){	
global $wpdb;
	if(isset($data->id)){ 
		$data_id = $data->id;
		
		$name_column = 0;
		$now_sort = 0;
		$v1 = 0;
		$v2 = 0;
		$reset_course = 0;
		$status = 0;
		
		$broker = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."bcbroker_naps WHERE naps_id='$data_id'"); 
		if(isset($broker->id)){
			$name_column = $broker->name_column;
			$now_sort = $broker->now_sort;
			$v1 = $broker->v1;
			$v2 = $broker->v2;
			$reset_course = $broker->reset_course;
			$status = $broker->status;
		}
		
		$alls = $wpdb->get_results("SELECT * FROM ".$wpdb->prefix."bcbroker_vtypes ORDER BY vtype_title ASC"); 
 	?>
		<tr>
			<th><?php _e('Enable parser','pn'); ?></th>
			<td colspan="2">
				<div class="premium_wrap_standart">
					<select name="bcbroker_status" autocomplete="off">
						<option value="0" <?php selected($status,0); ?>><?php _e('No','pn'); ?></option>
						<option value="1" <?php selected($status,1); ?>><?php _e('Yes','pn'); ?></option>
					</select>
				</div>	
			</td>
		</tr>	
		<tr>
			<th><?php _e('BestChange parser','pn'); ?></th>
			<td>
				<div class="premium_wrap_standart">
					<div style="margin: 0 0 10px 0;">
						<select name="bcbroker_v1" autocomplete="off">
							<option value="0">--<?php _e('Send','pn'); ?>--</option>
							<?php foreach($alls as $all){ ?>
								<option value="<?php echo $all->vtype_id; ?>" <?php if($all->vtype_id == $v1){ ?>selected="selected"<?php } ?>><?php echo pn_strip_input($all->vtype_title); ?></option>
							<?php } ?>
						</select>

						<select name="bcbroker_v2" autocomplete="off">
							<option value="0">--<?php _e('Receive','pn'); ?>--</option>
							<?php foreach($alls as $all){ ?>
								<option value="<?php echo $all->vtype_id; ?>" <?php if($all->vtype_id == $v2){ ?>selected="selected"<?php } ?>><?php echo pn_strip_input($all->vtype_title); ?></option>
							<?php } ?>
						</select>							
					</div>
					<div>
						<select name="bcbroker_name_column" autocomplete="off">
							<option value="0" <?php selected($name_column,0); ?>><?php printf(__('Correct rate "%s"','pn'), __('Send','pn')); ?></option>
							<option value="1" <?php selected($name_column,1); ?>><?php printf(__('Correct rate "%s"','pn'), __('Receive','pn')); ?></option>
						</select>
						
						<select name="bcbroker_now_sort" autocomplete="off">
							<option value="0" <?php selected($now_sort,0); ?>><?php _e('Sort rate by desc','pn'); ?></option>
							<option value="1" <?php selected($now_sort,1); ?>><?php _e('Sort rate by asc','pn'); ?></option>
						</select>
					</div>					
				</div>			
			</td>
			<td>
				<div class="premium_wrap_standart">
					<div><input type="text" name="bcbroker_pars_position" style="width: 100px;" value="<?php echo is_my_money(is_isset($broker, 'pars_position')); ?>" /> <?php _e('Position','pn'); ?></div>
					<div><input type="text" name="bcbroker_min_res" style="width: 100px;" value="<?php echo is_my_money(is_isset($broker, 'min_res')); ?>" /> <?php _e('Min reserve for position','pn'); ?></div>
					<div><input type="text" name="bcbroker_step" style="width: 100px;" value="<?php echo is_my_money(is_isset($broker, 'step')); ?>" /> <?php _e('Step','pn'); ?></div>
					<div><input type="text" name="bcbroker_min_sum" style="width: 100px;" value="<?php echo is_my_money(is_isset($broker, 'min_sum')); ?>" /> <?php _e('Min rate','pn'); ?></div>
					<div><input type="text" name="bcbroker_max_sum" style="width: 100px;" value="<?php echo is_my_money(is_isset($broker, 'max_sum')); ?>" /> <?php _e('Max rate','pn'); ?></div>
				</div>							
			</td>			
		</tr>
		<tr>
			<th><?php _e('Reset to standard rate','pn'); ?></th>
			<td colspan="2">
				<div class="premium_wrap_standart">
					<select name="bcbroker_reset_course" autocomplete="off">
						<option value="0" <?php selected($reset_course,0); ?>><?php _e('Yes','pn'); ?></option>
						<option value="1" <?php selected($reset_course,1); ?>><?php _e('No','pn'); ?></option>
					</select>
				</div>	
			</td>
		</tr>		
		<tr>
			<th><?php _e('Standard rate','pn'); ?></th>
			<td>
				<div class="premium_wrap_standart">
					<input type="text" name="bcbroker_cours1" style="width: 200px;" value="<?php echo is_my_money(is_isset($broker, 'cours1')); ?>" />
				</div>			
			</td>
			<td>
				<div class="premium_wrap_standart">
					<input type="text" name="bcbroker_cours2" style="width: 200px;" value="<?php echo is_my_money(is_isset($broker, 'cours2')); ?>" />	
				</div>			
			</td>
		</tr>
	<?php  
	} 
} 

add_action('pn_naps_edit', 'pn_naps_edit_bcbroker', 10, 2);
add_action('pn_naps_add', 'pn_naps_edit_bcbroker', 10, 2);
function pn_naps_edit_bcbroker($data_id, $array){
global $wpdb;	
	if($data_id){
		$vid1 = intval(is_param_post('bcbroker_v1'));
		$vid2 = intval(is_param_post('bcbroker_v2'));
		if($vid1 > 0 and $vid2 > 0){
			$v1 = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."bcbroker_vtypes WHERE vtype_id='$vid1'");
			$v2 = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."bcbroker_vtypes WHERE vtype_id='$vid2'");
			if(isset($v1->id) and isset($v2->id)){
				
				$arr = array();
				$arr['naps_id'] = $data_id;
				$arr['v1'] = intval($v1->vtype_id);
				$arr['v2'] = intval($v2->vtype_id);
				$arr['now_sort'] = intval(is_param_post('bcbroker_now_sort'));
				$arr['name_column'] = intval(is_param_post('bcbroker_name_column'));
				$pars_position = intval(is_param_post('bcbroker_pars_position'));
				if($pars_position < 0){ $pars_position = 0; }
				$arr['pars_position'] = $pars_position;
				
				$arr['step'] = pn_strip_input(is_param_post('bcbroker_step'));
				$arr['min_res'] = is_my_money(is_param_post('bcbroker_min_res'));
				$arr['min_sum'] = is_my_money(is_param_post('bcbroker_min_sum'));
				$arr['max_sum'] = is_my_money(is_param_post('bcbroker_max_sum'));
				$arr['cours1'] = is_my_money(is_param_post('bcbroker_cours1'));
				$arr['cours2'] = is_my_money(is_param_post('bcbroker_cours2'));
				$arr['reset_course'] = intval(is_param_post('bcbroker_reset_course'));
				$arr['status'] = intval(is_param_post('bcbroker_status'));
				
				$broker = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."bcbroker_naps WHERE naps_id='$data_id'"); 
				if(isset($broker->id)){
					$wpdb->update($wpdb->prefix."bcbroker_naps", $arr, array('id'=>$broker->id));
				} else {
					$wpdb->insert($wpdb->prefix."bcbroker_naps", $arr);
				}
				
			} else {
				$wpdb->query("DELETE FROM ".$wpdb->prefix."bcbroker_naps WHERE naps_id = '$data_id'");
			}
		} else {
			$wpdb->query("DELETE FROM ".$wpdb->prefix."bcbroker_naps WHERE naps_id = '$data_id'");
		}
	}
}

add_action('pn_naps_delete', 'pn_naps_delete_bcbroker', 10, 2);
function pn_naps_delete_bcbroker($item_id, $item){
global $wpdb;	

	$wpdb->query("DELETE FROM ".$wpdb->prefix."bcbroker_naps WHERE naps_id = '$item_id'");
}