<?php
/* 
https://wex.nz/tapi/docs#getInfo
*/

if(!class_exists('AP_WEX')){
class AP_WEX {
	
    private $api_key = "";
    private $api_secret="";
	private $test = 0;
	protected $noonce;
	private $retry_flag = 0;

    function __construct($key,$secret)
    {
        $this->api_key = trim($key);
        $this->api_secret = trim($secret);
		$this->noonce = time();
    }	
	
	protected function getnoonce(){
		
		$this->noonce++;
        return array(0.05, $this->noonce);
		
	}	
	
	public function make_voucher($amount, $currency, $receiver=''){
		$data = array();
		$data['error'] = 1;
		$data['trans_id'] = 0;
		$data['coupon'] = 0;
		
		/*
			[usd] => 0
			[eur] => 0
			[rur] => 0
			[btc] => 0
			[ltc] => 0
			[nmc] => 0
			[nvc] => 0
			[trc] => 0
			[ppc] => 0
			[ftc] => 0
			[xpm] => 0
			[cnh] => 0
			[gbp] => 0
			[DSH] => 0
			[ETH] => 0
		*/
		$amount = sprintf("%0.6F",$amount);
		$amount = rtrim($amount,'0');
		$amount = rtrim($amount,'.');
		
		$currency = trim((string)$currency);
		
		$receiver = trim((string)$receiver);
		
		$array = array('currency' => $currency, 'amount'=>$amount);
		if($receiver){
			$array['receiver'] = $receiver;
		}

		$res = $this->request('CreateCoupon', $array);
		if(is_array($res) and isset($res['return']['coupon'])){
			$data['error'] = 0;
			$data['trans_id'] = trim($res['return']['transID']);
			$data['coupon'] = trim($res['return']['coupon']);
		}
		/* или купон или пустота */
		
		return $data;
	}	
	
	public function get_balans(){
		
		$res = $this->request('getInfo', array());
		if(is_array($res) and isset($res['return']['funds'])){

			$purses = $res['return']['funds'];
			
			return $purses;
		}
		/* или массив или пустота */
		
	}	
	
 	public function get_transfer($amount, $currency, $receiver){
		$data = array();
		$data['error'] = 1;
		$data['trans_id'] = 0;
		
		$amount = sprintf("%0.8F",$amount);
		$amount = rtrim($amount,'0');
		$amount = rtrim($amount,'.');
		
		$currency = strtoupper(trim((string)$currency));
		
		$receiver = trim((string)$receiver);		
		
		$params = array();
		$params['coinName'] = $currency;
		$params['amount'] = $amount;
		$params['address'] = $receiver;
		
		$res = $this->request('WithdrawCoin', $params);
		if(is_array($res) and isset($res['return']['tId'])){
				
			$data['error'] = 0;
			$data['trans_id'] = intval($res['return']['tId']);
	
		}
			
		return $data;
	}	
	
	public function request($method, $params = array()){
		$params = (array)$params;
		$params['method'] = trim((string)$method);
		$mt = $this->getnoonce();
		$params['nonce'] = $mt[1];
		
		$post_data = http_build_query($params, '', '&');
		$sign = hash_hmac("sha512", $post_data, $this->api_secret);
	 
        $headers = array(
            'Sign: '.$sign,
            'Key: '.$this->api_key,
        );
		
		$c_options = array(
			CURLOPT_POST => true,
			CURLOPT_POSTFIELDS => $post_data,
			CURLOPT_USERAGENT => 'Mozilla/4.0 (compatible; Marinu666 BTCE PHP client; '.php_uname('s').'; PHP/'.phpversion().')',
			CURLOPT_HTTPHEADER => $headers,
			CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
		);
						
		$c_result = get_curl_parser('https://wex.nz/tapi/', $c_options, 'autopay', 'wex');
		$err  = $c_result['err'];
		$out = $c_result['output'];		
		if(!$err){
			
			if($this->test == 1){
				echo $out;
				exit;
			}
				
			$result = @json_decode($out, true);
				
			if(isset($result['error'])) {
				if(strpos($result['error'], 'nonce') > -1 && $this->retry_flag == 0) {
					$matches = array();
					if(preg_match_all('/([0-9])+/', $result['error'], $matches, PREG_PATTERN_ORDER)){
						$this->retry_flag = 1;
						$this->noonce = end($matches[0]);
						return $this->request($method, $params);
					}
				} 				
			}	
				
			$this->retry_flag = 0;
					
			return $result;
					
		} elseif($this->test == 1){
			echo $err;
			exit;
		}		
		
	}   
}    
}