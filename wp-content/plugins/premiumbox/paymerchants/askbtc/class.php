<?php
if(!class_exists('AP_AskBtc')){
class AP_AskBtc
{
    private $key = "";
    private $secret="";
	private $test = 0;

    function __construct($key,$secret)
    {
        $this->key = trim($key);
        $this->secret = trim($secret);
    }	

	public function send_money($currency, $address, $amount){		
		$currency = trim((string)$currency);
		$address = trim((string)$address);
		$amount = trim($amount);
		
		$data = array();
		$data['error'] = 1;
		$data['trans_id'] = 0;
		$request = $this->request('send-coin', array('currency'=>$currency, 'address'=>$address, 'amount' => $amount));
		$res = @json_decode($request);
		if(is_object($res) and isset($res->success) and $res->success == 1){
			$data['error'] = 0;
			$data['trans_id'] = trim($res->txid);
		}	
	
		return $data;
	}	
	
	public function get_balans(){
		
		$request = $this->request('get-coin-info', array());
		$res = @json_decode($request);
		if(is_object($res) and isset($res->balance)){
			$purses = array();
			foreach($res->balance as $currency => $value){
				$purses[$currency] = $value;
			}
			return $purses;
		}
		/* или массив или пустота */

	}
	
	public function request($method, $nparams = array()){
		$nparams = (array)$nparams;
		$method = trim((string)$method);
		
		$params = array();
		$params['key'] = $this->key;
		$params['secret'] = $this->secret;
		foreach($nparams as $k => $v){
			$params[$k] = $v;
		}
		$postFields = http_build_query($params, '', '&');
		
		$c_options = array();
		$c_options[CURLOPT_POST] = 'POST';
		$c_options[CURLOPT_POSTFIELDS] = $postFields;
		
		$result = get_curl_parser('https://askbtc.org/v1/tapi/'.$method, $c_options, 'merchant', 'askbtc');
		
		$err  = $result['err'];
		$out = $result['output'];
		if(!$err){
					
			if($this->test == 1){
				echo $out;
				exit;
			}					
					
			return $out;
					
		} elseif($this->test == 1){
			echo $err;
			exit;
		}		
		
	}
}
}