<?php
/*
title: [ru_RU:]AskBTC[:ru_RU][en_US:]AskBTC[:en_US]
description: [ru_RU:]мерчант AskBTC[:ru_RU][en_US:]AskBTC merchant[:en_US]
version: 1.2
*/

if(!class_exists('merchant_askbtc')){
	class merchant_askbtc extends Merchant_Premiumbox {

		function __construct($file, $title)
		{
			$map = array(
				'CONFIRM_COUNT', 'API_KEY', 'API_SECRET', 'SECRET', 'SECRET2',
			);
			parent::__construct($file, $map, $title);
			
			add_filter('merchants_settingtext_'.$this->name, array($this, 'merchants_settingtext'));
			add_filter('merchant_formstep_autocheck',array($this, 'merchant_formstep_autocheck'),1,2);
			add_filter('get_merchant_admin_options_'.$this->name,array($this, 'get_merchant_admin_options'),1,2);
			add_filter('summ_to_pay',array($this,'summ_to_pay'),10,4);
			add_filter('merchants_action_bid_'.$this->name, array($this,'merchants_action_bid'),99,4);
			add_action('myaction_merchant_'. $this->name .'_status', array($this,'myaction_merchant_status'));
			add_filter('user_mailtemp',array($this,'user_mailtemp'));
			add_filter('admin_mailtemp',array($this,'admin_mailtemp'));
			add_filter('mailtemp_tags_generate_address1_askbtc',array($this,'mailtemp_tags_generate_address'));
			add_filter('mailtemp_tags_generate_address2_askbtc',array($this,'mailtemp_tags_generate_address'));
		}
		
		function user_mailtemp($places_admin){
			$places_admin['generate_address1_askbtc'] = sprintf(__('Address generation for %s','pn'), 'AskBTC');
			return $places_admin;
		}

		function admin_mailtemp($places_admin){
			$places_admin['generate_address2_askbtc'] = sprintf(__('Address generation for %s','pn'), 'AskBTC');
			return $places_admin;
		}

		function mailtemp_tags_generate_Address($tags){
			
			$tags['bid_id'] = __('ID Order','pn');
			$tags['address'] = __('Address','pn');
			$tags['sum'] = __('Amount','pn');
			$tags['count'] = __('Confirmations','pn');
			
			return $tags;
		}	
		
		function summ_to_pay($sum, $m_id ,$item, $naps){ 
			
			if($m_id and $m_id == $this->name){
				return $item->summ1_dc;
			}	
			
			return $sum;
		}		
				
		function merchants_settingtext(){
			$text = '| <span class="bred">'. __('Config file is not set up','pn') .'</span>';
			if(
				is_deffin($this->m_data,'CONFIRM_COUNT') 
				and is_deffin($this->m_data,'API_KEY') 
				and is_deffin($this->m_data,'API_SECRET') 
				and is_deffin($this->m_data,'SECRET') 
				and is_deffin($this->m_data,'SECRET2') 
			){
				$text = '';
			}
			
			return $text;
		}	

		function get_merchant_admin_options($options, $data){
			
			if(isset($options['check'])){
				unset($options['check']);
			}
			if(isset($options['note'])){
				unset($options['note']);
			}
			if(isset($options['type'])){
				unset($options['type']);
			}
			if(isset($options['help_type'])){
				unset($options['help_type']);
			}
			if(isset($options['check_api'])){
				unset($options['check_api']);
			}
			if(isset($options['check_payapi'])){
				unset($options['check_payapi']);
			}
			if(isset($options['resulturl'])){
				unset($options['resulturl']);
			}			

			$text = '
			<strong>BACK URL:</strong> <a href="'. get_merchant_link($this->name.'_status') . '?secret=' . urlencode(is_deffin($this->m_data,'SECRET')) .'&secret2='. urlencode(is_deffin($this->m_data,'SECRET2')) .'" target="_blank">'. get_merchant_link($this->name.'_status') .'?secret='. urlencode(is_deffin($this->m_data,'SECRET')) .'&secret2='. urlencode(is_deffin($this->m_data,'SECRET2')) .'</a>
			';

			$options[] = array(
				'view' => 'textfield',
				'title' => '',
				'default' => $text,
			);			
			if(isset($options['bottom_title'])){
				unset($options['bottom_title']);
			}
			$options['bottom_title'] = array(
				'view' => 'h3',
				'title' => '',
				'submit' => __('Save','pn'),
				'colspan' => 2,
			);			
			
			return $options;
		}		
		
		function merchant_formstep_autocheck($autocheck, $m_id){
			
			if($m_id and $m_id == $this->name){
				$autocheck = 1;
			}
			
			return $autocheck;
		}		
		
 		function merchants_action_bid($temp, $pay_sum, $item, $naps){
			global $wpdb;

			$item_id = $item->id;	
			$sum = pn_strip_input($item->summ1_dc);	
			$currency = $item->vtype1;
			$currency_m = strtolower($currency);
				
			$my_api_secret = is_deffin($this->m_data,'API_SECRET');
			$my_api_key = is_deffin($this->m_data,'API_KEY');
			
			$naschet = pn_strip_input($item->naschet);
			if(!$naschet){
				$data = get_merch_data($this->name);
				$show_error = intval(is_isset($data, 'show_error'));
				try {
					$class = new AskBtc($my_api_key, $my_api_secret);
					$naschet = $class->generate_adress($currency_m);
				} catch (Exception $e) { 
					if($show_error){
						die($e);
					}	
				}
				if($naschet){
					$naschet = pn_strip_input($naschet);
					update_bids_naschet($item_id, $naschet);
					
					$mailtemp = get_option('mailtemp');
					if(isset($mailtemp['generate_address2_askbtc'])){
						$data = $mailtemp['generate_address2_askbtc'];
						if($data['send'] == 1){
							$ot_mail = is_email($data['mail']);
							$ot_name = pn_strip_input($data['name']);
							$sitename = pn_strip_input(get_bloginfo('sitename'));			
							$subject = pn_strip_input(ctv_ml($data['title']));
										
							$html = pn_strip_text(ctv_ml($data['text']));
										
							if($data['tomail']){
										
								$to_mail = $data['tomail'];
												
								$sarray = array(
									'[sitename]' => $sitename,
									'[bid_id]' => $item_id,
									'[address]' => $naschet,
									'[sum]' => $sum,
									'[count]' => intval(is_deffin($this->m_data,'CONFIRM_COUNT')),
								);							
								$subject = get_replace_arrays($sarray, $subject);										
											
								$html = get_replace_arrays($sarray, $html);
								$html = apply_filters('comment_text',$html);
																						
								pn_mail($to_mail, $subject, $html, $ot_name, $ot_mail);			
							}
						}
					}

					if(isset($mailtemp['generate_address1_askbtc'])){
						$data = $mailtemp['generate_address1_askbtc'];
						if($data['send'] == 1){
							$ot_mail = is_email($data['mail']);
							$ot_name = pn_strip_input($data['name']);
						
							$subject = pn_strip_input(ctv_ml($data['title']));
							$sitename = pn_strip_input(get_bloginfo('sitename'));
							$html = pn_strip_text(ctv_ml($data['text']));
						
							$to_mail = is_email($item->user_email);
							if($to_mail){
						
								$sarray = array(
									'[sitename]' => $sitename,
									'[bid_id]' => $item_id,
									'[address]' => $naschet,
									'[sum]' => $sum,
									'[count]' => intval(is_deffin($this->m_data,'CONFIRM_COUNT')),
								);							
								$subject = get_replace_arrays($sarray, $subject);								
														
								$html = get_replace_arrays($sarray, $html);											
								$html = apply_filters('comment_text',$html);
						
								pn_mail($to_mail, $subject, $html, $ot_name, $ot_mail);	 
							}
						}
					}					
					
				} 
			}
			
 			if($naschet){	
				?>				
				<div class="zone">
					<p><?php printf(__('In order to pay an ID <b>%1$s</b> order send amount <b>%2$s</b> %4$s on address <b>%3$s</b>','pn'),$item_id, $sum, $naschet, $currency); ?></p>
					<?php echo sprintf(__('The order status changes to "Paid" when we get <b>%1$s</b> confirmations','pn'), is_deffin($this->m_data,'CONFIRM_COUNT')); ?></p>
				</div>				
				<?php
			} else { 
				?>
				<div class="error_div"><?php _e('Error','pn'); ?></div>
				<?php
			}  					
		}
		
		function myaction_merchant_status(){
		global $wpdb;
		
			do_action('merchant_logs', $this->name);
	
			$address = pn_strip_input(is_param_req('address')); 
			$txid = pn_strip_input(is_param_req('txid'));
			$secret = is_param_req('secret'); 
			$secret2 = is_param_req('secret2'); 
			$currency = strtoupper(is_param_req('currency'));
			$in_summ = is_my_money(is_param_req('volume'));
			$confirmations = intval(is_param_req('confirmations'));
			
			if(urldecode($secret) != is_deffin($this->m_data,'SECRET')){
				die('wrong secret!');
			}

			if(urldecode($secret2) != is_deffin($this->m_data,'SECRET2')){
				die('wrong secret!');
			}
  
			$item = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."bids WHERE naschet='$address'");
			$id = intval(is_isset($item, 'id'));
			$data = get_data_merchant_for_id($id, $item);
			
			$err = $data['err'];
			$status = $data['status'];
			$m_id = $data['m_id'];
			$pay_purse = is_pay_purse('', $data, $m_id);
			$vtype = $data['vtype'];	
			$bid_sum = $data['sum'];
			$bid_sum = apply_filters('merchant_bid_sum', $bid_sum, $m_id);
				 
			if($err == 0){
				if($m_id and $m_id == $this->name){
					if($vtype == $currency){
						if($in_summ >= $bid_sum){		
						
							$conf_count = intval(is_deffin($this->m_data,'CONFIRM_COUNT'));
							do_action('merchant_confirm_count', $id, $confirmations, $data['bids_data'], $data['naps_data'], $conf_count, $this->name);
						
							if( $confirmations >= $conf_count ) {
								
								if($status == 'new' or $status == 'coldpay'){ 
									$params = array(
										'pay_purse' => $pay_purse,
										'sum' => $in_summ,
										'naschet' => '',
										'trans_in' => $txid,
									);
									the_merchant_bid_status('realpay', $id, 'user', 0, '', $params);	
									die( 'ok' );
								}
								
							} else {
								
								if($status == 'new'){
									$params = array(
										'pay_purse' => $pay_purse,
										'sum' => $in_summ,
										'naschet' => '',
										'trans_in' => $txid,
									);
									the_merchant_bid_status('coldpay', $id, 'user', 0, '', $params);									
								}
								
							}	
									
						} else {
							die('Payment amount is less than the provisions');
						}
					} else {
						die('Wrong type of currency');
					}
				} else {
					die('Merchant is off in this direction');
				}
			} else {
				die( 'Bid does not exist or the wrong ID' );
			}
			
		} 
		
	}
}
new merchant_askbtc(__FILE__, 'AskBTC');