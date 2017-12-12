<?php
/*
title: [ru_RU:]Qiwi[:ru_RU][en_US:]Qiwi[:en_US] 
description: [ru_RU:]мерчант Qiwi[:ru_RU][en_US:]Qiwi merchant[:en_US]
version: 1.2
*/

if(!class_exists('merchant_qiwi')){
	class merchant_qiwi extends Merchant_Premiumbox {

		function __construct($file, $title)
		{
			$map = array(
				'QIWI_ACCOUNT', 'QIWI_PASSWORD', 
			);
			parent::__construct($file, $map, $title);
			
			add_action('get_merchant_admin_options_'. $this->name, array($this, 'get_merchant_admin_options'), 10, 2);
			add_filter('merchants_settingtext_'.$this->name, array($this, 'merchants_settingtext'));
			add_filter('merchant_formstep_autocheck',array($this, 'merchant_formstep_autocheck'),1,2);
			add_filter('merchant_pay_button_'.$this->name, array($this,'merchant_pay_button'),99,4);
			add_filter('get_text_pay', array($this,'get_text_pay'), 99, 3);
			add_action('myaction_merchant_'. $this->name .'_cron' . get_hash_result_url($this->name), array($this,'myaction_merchant_cron'));
		}

		function get_merchant_admin_options($options, $data){ 
			
			$text = '
			<strong>Cron:</strong> <a href="'. get_merchant_link($this->name.'_cron' . get_hash_result_url($this->name)) .'" target="_blank">'. get_merchant_link($this->name.'_cron' . get_hash_result_url($this->name)) .'</a>			
			';

			$options['currency_type'] = array(
				'view' => 'select',
				'title' => __('Currency code','pn'),
				'options' => array('0'=> 'RUB', '1'=> 'KZT', '2'=> 'USD', '3' => 'EUR'),
				'default' => is_isset($data, 'currency_type'),
				'name' => 'currency_type',
				'work' => 'int',
			);			
			
			$options['link_type'] = array(
				'view' => 'select',
				'title' => __('Link type','pn'),
				'options' => array('0'=> 'transfer', '1'=> 'payment'),
				'default' => is_isset($data, 'link_type'),
				'name' => 'link_type',
				'work' => 'int',
			);

			$options['vnaccount'] = array(
				'view' => 'select',
				'title' => __('Use VS account','pn'),
				'options' => array('0'=> __('No','pn'), '1'=> __('Yes','pn')),
				'default' => is_isset($data, 'vnaccount'),
				'name' => 'vnaccount',
				'work' => 'int',
			);			
			
			$options['provider'] = array(
				'view' => 'input',
				'title' => __('Provider ID','pn'),
				'default' => is_isset($data, 'provider'),
				'name' => 'provider',
				'work' => 'int',
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

			$options[] = array(
				'view' => 'textfield',
				'title' => '',
				'default' => $text,
			);
			if(isset($options['enableip'])){
				unset($options['enableip']);
			}
			if(isset($options['check_api'])){
				unset($options['check_api']);
			}
			if(isset($options['check_payapi'])){
				unset($options['check_payapi']);
			}			
			
			return $options;	
		}		
		
		function merchants_settingtext(){
			$text = '| <span class="bred">'. __('Config file is not set up','pn') .'</span>';
			if(
				is_deffin($this->m_data,'QIWI_ACCOUNT') 
				and is_deffin($this->m_data,'QIWI_PASSWORD') 
			){
				$text = '';
			}
			
			return $text;
		}

		function merchant_formstep_autocheck($autocheck, $m_id){
			
			if($m_id and $m_id == $this->name){
				$autocheck = 1;
			}
			
			return $autocheck;
		}		

		function get_text_pay($text, $m_id, $item){
			if($m_id and $m_id == $this->name){
				$text = str_replace('[id]','('.$item->id.')',$text);
			
			}
			return $text;
		}

		function merchant_pay_button($temp, $pay_sum, $item, $naps){
		global $bids_data, $wpdb;
		
			$pay_sum = is_my_money($pay_sum,2); 
			$text_pay = get_text_pay($this->name, $item, $pay_sum);						
				
			$data = get_merch_data($this->name);
			$vnaccount = intval(is_isset($data, 'vnaccount'));
			$provider = intval(is_isset($data, 'provider'));
			$link_type = intval(is_isset($data, 'link_type'));				
			$currency_type = intval(is_isset($data, 'currency_type'));	
				
			$qiwi_account = '';	
			if($vnaccount == 1){
				if(isset($bids_data->id)){
					$bid_id = $bids_data->id;
					$bid = $wpdb->get_row("SELECT * FROM ". $wpdb->prefix ."bids WHERE id='$bid_id'");
					if(isset($bid->id)){
						$qiwi_account = pn_maxf_mb(pn_strip_input(is_isset($bid,'naschet')),500);
					}
				}
			}
			if(!$qiwi_account){
				$qiwi_account = is_deffin($this->m_data,'QIWI_ACCOUNT');
			}
			
			$qiwi_account = trim(str_replace('+','',$qiwi_account));
	
			$pay_sum = sprintf("%0.2F",$pay_sum);
			$sum = explode('.',$pay_sum);
				
			if($link_type == 1){
				$l_type = 'payment';
			} else {
				$l_type = 'transfer';
			}
			$prov_link = '';
			if($provider){
				$prov_link = '&provider='.$provider;
			}
			$def_currency = 'RUB';
			if($currency_type == 1){
				$def_currency = 'KZT';
			} elseif($currency_type == 2){
				$def_currency = 'USD';
			} elseif($currency_type == 3){
				$def_currency = 'EUR';
			}
				
			$url = "https://qiwi.com/". $l_type ."/form.action?extra['account']=". $qiwi_account ."&source=qiwi_". $def_currency ."&amountInteger=". $sum[0] ."&amountFraction=". $sum[1] ."&currency=". $def_currency ."". $prov_link ."&extra['comment']=".urldecode($text_pay);					
		
			$temp = '<a href="'. $url .'" target="_blank" class="success_paybutton">'. __('Make a payment','pn') .'</a>';
		
			return $temp;			
		}

		function myaction_merchant_cron(){
			global $wpdb;

			$m_in = $this->name;
			
			$data = get_merch_data($this->name);
			$currency_type = intval(is_isset($data, 'currency_type'));
			$show_error = intval(is_isset($data, 'show_error'));
			$def_currency = 'RUB'; 
			$def_curr = 'руб'; 
			if($currency_type == 1){
				$def_currency = 'KZT'; 
				$def_curr = 'тенге'; 
			} elseif($currency_type == 2){
				$def_currency = 'USD'; 
				$def_curr = 'долл';
			} elseif($currency_type == 3){
				$def_currency = 'EUR'; 
				$def_curr = 'евро';				
			}	
			
			try {
				$req = new QIWI($m_in,is_deffin($this->m_data,'QIWI_ACCOUNT'),is_deffin($this->m_data,'QIWI_PASSWORD'));
				$orders = $req->get_history(date('d.m.Y',strtotime('-3 days')),date('d.m.Y',strtotime('+1 day')),$def_currency,'income');
				if(is_array($orders)){
					
					$items = $wpdb->get_results("SELECT * FROM ".$wpdb->prefix."bids WHERE status = 'new' AND vtype1='$def_currency' AND m_in LIKE 'qiwi%'");
					foreach($items as $item){
						
						foreach($orders as $res){
							$currency_text = $res['currency_text'];
							$id = $res['site_id'];
							if($id == $item->id and $currency_text == $def_curr and $res['status'] == 'success'){
								
								$data = get_data_merchant_for_id($id, $item);
								$in_summ = $res['amount'];
								$in_summ = is_my_money($in_summ,2);
								$err = $data['err'];
								$status = $data['status'];
								$m_id = $data['m_id'];
								$vtype = $data['vtype'];
								$pay_purse = is_pay_purse($res['sender'], $data, $m_id);
									
								$bid_sum = is_my_money($data['pay_sum'],2);	
								$bid_sum = apply_filters('merchant_bid_sum', $bid_sum, $m_id);
								if($err == 0){
									if($in_summ >= $bid_sum){
										$params = array(
											'pay_purse' => $pay_purse,
											'sum' => $in_summ,
											'naschet' => '',
											'trans_in' => $res['trans_id'],
										);
										the_merchant_bid_status('realpay', $id, 'user', 0, '', $params);														
									}		 		 
								}
							}
						
						}
						
					}
					
				}
			}
			catch (Exception $e)
			{
				if($show_error){
					die($e);
				}
			}			
		}
		
	}
}

new merchant_qiwi(__FILE__, 'Qiwi');