<?php
if(!class_exists('AskBtc')){
class AskBtc
{
    private $key = "";
    private $secret="";
	private $test = 0;

    function __construct($key,$secret)
    {
        $this->key = trim($key);
        $this->secret = trim($secret);
    }	
	
	public function generate_adress($currency){
		$currency = trim($currency);
		
		$address = '';
		$request = $this->request('generate-address', array('currency'=>$currency));
		$res = @json_decode($request);
		if(is_object($res) and isset($res->success) and $res->success == 1){
			$address = trim($res->address);
		}
		
		return $address;
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