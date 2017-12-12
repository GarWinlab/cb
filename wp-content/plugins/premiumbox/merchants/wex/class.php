<?php

/* 
https://wex.nz/tapi/docs
*/

if(!class_exists('WEX')){
class WEX {
	
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
	
	public function get_transactions($from_id=''){
		$arr = array();
		$from_id = trim($from_id);
		if($from_id){
			$arr['from_id'] = $from_id;
		}
		$res = $this->request('TransHistory', $arr);
		if(is_array($res) and isset($res['return'])){
			return $res['return'];
		}	
	}
	
	public function redeem_voucher($code){
		
		$res = $this->request('RedeemCoupon', array('coupon'=>$code));
		if(is_array($res) and isset($res['return']['transID'])){
			return array(
				'amount'=> (string)$res['return']['couponAmount'],
				'currency'=> (string)$res['return']['couponCurrency'],
				'trans_id'=> (string)$res['return']['transID'],
			);
		}
		/* или данные или пустота */
		
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
		
		if($ch = curl_init()){
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; Marinu666 BTCE PHP client; '.php_uname('s').'; PHP/'.phpversion().')');
			curl_setopt($ch, CURLOPT_URL, 'https://wex.nz/tapi/');
			curl_setopt($ch, CURLOPT_POST, 'POST');
			curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);	
			curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);			
			$err  = curl_errno($ch);
			$res = curl_exec($ch);
			curl_close($ch);
			if(!$err){
						
				if($this->test == 1){
					echo $res;
					exit;
				}
				
				$result = @json_decode($res, true);
				
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
}