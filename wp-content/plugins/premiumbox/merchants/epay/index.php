<?php
/*
title: [ru_RU:]E-Pay[:ru_RU][en_US:]E-Pay[:en_US]
description: [ru_RU:]мерчант E-Pay[:ru_RU][en_US:]E-Pay merchant[:en_US]
version: 1.2
*/

if(!class_exists('merchant_epay')){
	class merchant_epay extends Merchant_Premiumbox {

		function __construct($file, $title)
		{
			$map = array(
				'PAYEE_ACCOUNT', 'PAYEE_NAME', 'API_KEY',
			);
			parent::__construct($file, $map, $title);
			
			add_action('get_merchant_admin_options_'. $this->name, array($this, 'get_merchant_admin_options'), 10, 2);
			add_filter('merchants_settingtext_'.$this->name, array($this, 'merchants_settingtext'));
			add_filter('merchant_formstep_autocheck',array($this, 'merchant_formstep_autocheck'),1,2);
			add_filter('merchants_action_bid_'.$this->name, array($this,'merchants_action_bid'),99,4);
			add_action('myaction_merchant_'. $this->name .'_fail', array($this,'myaction_merchant_fail'));
			add_action('myaction_merchant_'. $this->name .'_success', array($this,'myaction_merchant_success'));
			add_action('myaction_merchant_'. $this->name .'_status' . get_hash_result_url($this->name), array($this,'myaction_merchant_status'));
		}

		function get_merchant_admin_options($options, $data){ 
			
			if(isset($options['bottom_title'])){
				unset($options['bottom_title']);
			}	
			if(isset($options['check_payapi'])){
				unset($options['check_payapi']);
			}			
			
			$text = '
			<strong>RETURN URL:</strong> <a href="'. get_merchant_link($this->name.'_status' . get_hash_result_url($this->name)) .'" target="_blank">'. get_merchant_link($this->name.'_status' . get_hash_result_url($this->name)) .'</a><br />
			<strong>SUCCESS URL:</strong> <a href="'. get_merchant_link($this->name.'_success') .'" target="_blank">'. get_merchant_link($this->name.'_success') .'</a><br />
			<strong>FAIL URL:</strong> <a href="'. get_merchant_link($this->name.'_fail') .'" target="_blank">'. get_merchant_link($this->name.'_fail') .'</a>				
			';

			$options['text'] = array(
				'view' => 'textfield',
				'title' => '',
				'default' => $text,
			);
			$options['bottom_title'] = array(
				'view' => 'h3',
				'title' => '',
				'submit' => __('Save','pn'),
				'colspan' => 2,
			);			
			
			return $options;	
		}							
		
		function merchants_settingtext(){
			$text = '| <span class="bred">'. __('Config file is not set up','pn') .'</span>';
			if(
				is_deffin($this->m_data,'PAYEE_ACCOUNT') 
				or is_deffin($this->m_data,'PAYEE_NAME') 
				or is_deffin($this->m_data,'API_KEY') 
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

		function merchants_action_bid($temp, $pay_sum, $item, $naps){

			$vtype = pn_strip_input($item->vtype1);
			$pay_sum = is_my_money($pay_sum,2);				
			$text_pay = get_text_pay($this->name, $item, $pay_sum);
			
			$PAYEE_ACCOUNT = is_deffin($this->m_data,'PAYEE_ACCOUNT');
			$PAYEE_NAME = is_deffin($this->m_data,'PAYEE_NAME');
			$PAYMENT_AMOUNT = $pay_sum;
			$PAYMENT_UNITS = $vtype;
			$PAYMENT_ID = $item->id;
			$API_KEY = is_deffin($this->m_data,'API_KEY');
			$V2_HASH = MD5($PAYEE_ACCOUNT.':'.$PAYMENT_AMOUNT.':'.$PAYMENT_UNITS.':'.$API_KEY);			
				
			$temp = '
			<form method="post" action="https://api.epay.com/paymentApi/merReceive" >
				<input name="PAYEE_ACCOUNT" type="hidden" value="'. $PAYEE_ACCOUNT .'" />
				<input name="PAYEE_NAME" type="hidden" value="'. $PAYEE_NAME .'" />
				<input name="PAYMENT_AMOUNT" type="hidden" value="'. $PAYMENT_AMOUNT .'" />
				<input name="PAYMENT_UNITS" type="hidden" value="'. $PAYMENT_UNITS .'" />
				<input name="PAYMENT_ID" type="hidden" value="'. $PAYMENT_ID .'" />
				<input name="STATUS_URL" type="hidden" value="'. get_merchant_link($this->name.'_status' . get_hash_result_url($this->name)) .'" />
				<input name="PAYMENT_URL" type="hidden" value="'. get_merchant_link($this->name.'_success') .'" />
				<input name="NOPAYMENT_URL" type="hidden" value="'. get_merchant_link($this->name.'_fail') .'" />
				<input name="BAGGAGE_FIELDS" type="hidden" value="" />
				<input name="KEY_CODE" type="hidden" value="" />
				<input name="BATCH_NUM" type="hidden" value="" />
				<input name="SUGGESTED_MEMO" type="hidden" value="'. $text_pay .'" />
				<input name="FORCED_PAYER_ACCOUNT" type="hidden" value="" />
				<input name="INTERFACE_LANGUAGE" type="hidden" value="" />
				<input name="CHARACTER_ENCODING" type="hidden" value="" />
				<input name="V2_HASH" type="hidden" value="'. $V2_HASH .'" />
				<input type="submit" formtarget="_top" value="'. __('Make a payment','pn') .'" />	
			</form>								
			';				
				
			return $temp;				
		}

		function myaction_merchant_fail(){
	
			$id = get_payment_id('PAYMENT_ID');
			the_merchant_bid_delete($id);
	
		}

		function myaction_merchant_success(){
	
			$id = get_payment_id('PAYMENT_ID');
			the_merchant_bid_success($id);
	
		}

		function myaction_merchant_status(){
	
			do_action('merchant_logs', $this->name);
	
			$PAYEE_ACCOUNT = is_deffin($this->m_data,'PAYEE_ACCOUNT');
			$PAYEE_NAME = is_deffin($this->m_data,'PAYEE_NAME');
			$API_KEY = is_deffin($this->m_data,'API_KEY');	
	
			$sPayeeAccount = isset( $_POST['PAYEE_ACCOUNT'] ) ? trim( $_POST['PAYEE_ACCOUNT'] ) : null;
			$iPaymentID = isset( $_POST['PAYMENT_ID'] ) ? $_POST['PAYMENT_ID'] : null;
			$dPaymentAmount = isset( $_POST['PAYMENT_AMOUNT'] ) ? trim( $_POST['PAYMENT_AMOUNT'] ) : null;
			$sPaymentUnits = isset( $_POST['PAYMENT_UNITS'] ) ? trim( $_POST['PAYMENT_UNITS'] ) : null;
			$iPaymentBatch = isset( $_POST['ORDER_NUM'] ) ? trim( $_POST['ORDER_NUM'] ) : null;
			$sPayerAccount = isset( $_POST['PAYER_ACCOUNT'] ) ? trim( $_POST['PAYER_ACCOUNT'] ) : null;
			$sTimeStampGMT = isset( $_POST['TIMESTAMPGMT'] ) ? trim( $_POST['TIMESTAMPGMT'] ) : null;
			$sV2Hash2 = isset( $_POST['V2_HASH2'] ) ? trim( $_POST['V2_HASH2'] ) : null;
			$Now_status = isset( $_POST['STATUS'] ) ? trim( $_POST['STATUS'] ) : null;

			$V2_HASH2= MD5($iPaymentID.':'. $iPaymentBatch .':'. $sPayeeAccount .':'. $dPaymentAmount .':'. $sPaymentUnits .':'. $sPayerAccount .':'. $Now_status .':'. $sTimeStampGMT .':'. $API_KEY);
			
			if($V2_HASH2 != $sV2Hash2){
				die( 'Invalid control signature' );
			}
			
			$data = get_merch_data($this->name);
			$check_history = intval(is_isset($data, 'check_api'));
			$show_error = intval(is_isset($data, 'show_error'));
			if($check_history == 1){
				try {
					$class = new EPay( $PAYEE_ACCOUNT, $PAYEE_NAME, $API_KEY );
					$hres = $class->getHistory( $iPaymentBatch, 'prihod' );
					if($hres['error'] == 0){
						$histories = $hres['responce'];
						if(isset($histories[$iPaymentBatch])){
							$h = $histories[$iPaymentBatch];
							$sPayerAccount = trim($h['PAYER']); //счет плательщика
							$sPayeeAccount = trim($h['PAYEE']); //счет получателя
							$dPaymentAmount = trim($h['AMOUNT']); //сумма платежа
							$sPaymentUnits = trim($h['CURRENCY']); //валюта платежа
							$Now_status = trim($h['STATUS']); //статус платежа
						} else {
							die( 'Wrong pay' );
						}
					} else {
						die( 'Error history' );
					}
				}
				catch( Exception $e ) {
					if($show_error){
						die( 'Фатальная ошибка: '.$e->getMessage() );
					} else {
						die( 'Фатальная ошибка');
					}
				}		
			}
			
			if( $sPayeeAccount != $PAYEE_ACCOUNT ){
				die( 'Invalid the seller s account' );
			}			
			
				$id = $iPaymentID;
				$data = get_data_merchant_for_id($id);
				$in_summ = $dPaymentAmount;	
				$in_summ = is_my_money($in_summ,2);
				$err = $data['err'];
				$status = $data['status'];
				$m_id = $data['m_id'];
				$pay_purse = is_pay_purse($sPayerAccount, $data, $m_id);
				
				$vtype = $data['vtype'];
			
				$bid_sum = is_my_money($data['pay_sum'],2);
				$bid_sum = apply_filters('merchant_bid_sum', $bid_sum, $m_id);
			
				$pending_arr = array('10','60','61','70');
			
				if($status == 'new' or $status == 'coldpay'){
					if($err == 0){
						if($m_id and $m_id == $this->name){
							if($vtype == $sPaymentUnits){
								if($in_summ >= $bid_sum){		
									
									if($Now_status == 1){
										
										$params = array(
											'pay_purse' => $pay_purse,
											'sum' => $in_summ,
											'naschet' => $sPayeeAccount,
											'trans_in' => $iPaymentBatch,
										);
										the_merchant_bid_status('realpay', $id, 'user', 0, '', $params);
										
									} elseif(in_array($Now_status, $pending_arr)) {
										
										$params = array(
											'pay_purse' => $pay_purse,
											'sum' => $in_summ,
											'naschet' => $sPayeeAccount,
											'trans_in' => $iPaymentBatch,
										);
										the_merchant_bid_status('coldpay', $id, 'user', 0, '', $params);
										
									}

									die('Completed');
									
								} else {
									die('The payment amount is less than the provisions');
								}
							} else {
								die('Wrong type of currency');
							}
						} else {
							die('At the direction of off merchant');
						}
					} else {
						die( 'The application does not exist or the wrong ID' );
					}
				} else {
					die( 'In the application the wrong status' );
				}	
	
		}
		
	}
}

new merchant_epay(__FILE__, 'E-Pay');