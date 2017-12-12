<?php
if(!class_exists('QIWI')){
class QIWI {
    public $qiwi_account, $balances = array( 'USD' => 0, 'RUB' => 0, 'EUR' => 0, 'KZT' => 0 );
    private $cookie_path;

    public function __construct( $merch_name, $qiwi_account, $password ) {

		$this->qiwi_account = str_replace('+','',$qiwi_account);
	
		$cookie_path = PN_PLUGIN_DIR.'merchants/'. $merch_name .'/cookie.php';
	
        if( !is_writable( $cookie_path ) ){
            throw new Exception( 'cookie file not writeable' );
		}

        $this->cookie_path = $cookie_path;
		
        $balans_res = $this->get_balans();
		if($balans_res){
			return;
		}

        $res = $this->request( 'https://auth.qiwi.com/cas/tgts', json_encode( array( 'login' => '+'.$this->qiwi_account, 'password' => $password ) ) );
		
			if(!is_array($res)){
				throw new Exception('link 1 not array');
			}
		
			if(isset($res['entity']['error']['message'])){
				throw new Exception($res['entity']['error']['message']);
			}
			
			if(!isset($res['entity']['ticket'])){
				throw new Exception( 'ticket not found - '.$res );
			}
        
		$token = $res['entity']['ticket'];
		
        $new_res = $this->request( 'https://auth.qiwi.com/cas/sts', json_encode( array( 'service' => 'https://qiwi.com/j_spring_cas_security_check', 'ticket' => $token ) ) );
        
			if(!is_array($new_res)){
				throw new Exception('link 2 not array');
			}		
		
			if( isset( $new_res['entity']['error']['message'] ) ){
				throw new Exception( $new_res['entity']['error']['message'] );
			}
			
			if( !isset( $new_res['entity']['ticket'] ) ){
				throw new Exception( 'ticket not found - '.$new_res );
			}
			
        $token = $new_res['entity']['ticket'];	
        
        $now_res = $this->request( 'https://qiwi.com/j_spring_cas_security_check?ticket='. $token );
        
			if(!is_array($now_res)){
				throw new Exception('link 3 not array');
			}		
		
			if( isset( $now_res['message'] ) and $now_res['message'] != '' ){
				throw new Exception( $now_res['message'] );
			}
        
			$code_name = '';
			if(isset( $now_res['code']['_name'])){
				$code_name = $now_res['code']['_name'];
			}
		
			if( $code_name != 'NORMAL' ){
				throw new Exception( 'error authorize - '.$now_res );
			}
        
		$balans_res = $this->get_balans();
		if(!$balans_res){
			throw new Exception( 'error authorize' );	
		}
		
    }
	
	public function get_balans() {
		
		$res = $this->request('person/state.action');
		if(is_array($res) and isset($res['data']['person'], $res['data']['balances'])){
			if($res['data']['person'] == $this->qiwi_account){
				$this->balances = $res['data']['balances'];
				return true;
			} else {
				throw new Exception( 'error qiwi account, you: '. $this->qiwi_account . ', original:' . $res['data']['person']);
			}
		}
		
		return false;
		
	}
	
    public function get_history( $start_date, $end_date, $cur_type='RUB', $trans_type='all' ) { 
		
		/* d.m.Y */
        $res = $this->request( 'user/report/list.action?paymentModeType=QIWI&paymentModeValue=qiwi_'. $cur_type .'&daterange=true&start='. $start_date .'&finish='. $end_date );

		$now_data = explode( '<div class="reportsLine', $res );
		
        $trans = array();
        foreach( $now_data as $data ) {

			$data = '<div class="reportsLine'.$data;
		
			$t_arr = array();
			$t_arr['trans_id'] = 0;
			if(preg_match('/<div class="transaction">(.*?)<\/div>/s',$data, $item)){
				$t_arr['trans_id'] = trim($item[1]);
			}
		
			if($t_arr['trans_id']){	
		
				$date = '';
				if(preg_match('/<span class="date">(.*?)<\/span>/s',$data, $item)){
					$date = trim($item[1]);
				}

				$time = '';
				if(preg_match('/<span class="time">(.*?)<\/span>/s',$data, $item)){
					$time = trim($item[1]);
				}		

				$t_arr['datetime'] = $date.' '.$time;
				
				$t_arr['comment'] = '';
				$site_id = 0;
				if(preg_match('/<div class="comment">(.*?)<\/div>/s',$data, $item)){
					$t_arr['comment'] = trim($item[1]);
					if(preg_match('/\((.*?)\)/s',$t_arr['comment'], $item)){
						$site_id = trim(preg_replace("/[^0-9]/", '', $item[1]));
					}					
				}
				$t_arr['site_id'] = $site_id;

				$status = '';
				if(preg_match('/<div class="reportsLine status_(.*?)\"/s',$data, $item)){
					$status = strtolower($item[1]);
				}		

				$t_arr['status'] = $status;
				
				$sender = '';
				if(preg_match('/<span class="opNumber">(.*?)<\/span>/s',$data, $item)){
					$sender = trim(preg_replace("/[^0-9]/", '', $item[1]));
				}		

				$t_arr['sender'] = $sender;				
				
				$type = '';
				if(preg_match('/<div class="IncomeWithExpend (.*?)\"/s',$data, $item)){ /* income - приход, expenditure - расход */
					$type = strtolower($item[1]);
				}		

				$t_arr['type'] = $type;				
				
				$amount = 0;
				$currency_text = '';
				if(preg_match('/<div class="cash">(.*?)<\/div>/s',$data, $item)){
					$now_item = $item[1];
					$amount = trim(str_replace(',','.',preg_replace("/[^0-9,]/", '', $now_item)));
					$currency_text = trim(preg_replace("/[^a-zA-ZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧЩШЭЮЯЪЬфбвгдеёщзийклмнопрстуфхцчшщэюяъъ]/u", '', $now_item));
				}
				$t_arr['amount'] = $amount;

				$comiss = 0;
				if(preg_match('/<div class="commission">(.*?)<\/div>/s',$data, $item)){
					$comiss = trim(str_replace(',','.',preg_replace("/[^0-9,]/", '', $item[1])));
					if(!$comiss){ $comiss = 0; }
				}				
				
				$t_arr['comiss'] = $comiss;
				$t_arr['currency_text'] = $currency_text;
				$t_arr['currency'] = $cur_type;
				
				if($trans_type == 'all'){
					$trans[] = $t_arr;
				} elseif($trans_type == 'income' and $t_arr['type'] == 'income'){
					$trans[] = $t_arr;
				} elseif($trans_type == 'expenditure' and $t_arr['type'] == 'expenditure'){
					$trans[] = $t_arr;
				}
			
			}
		}
		
		
        return $trans;
    }	
	
    private function request($url, $data = null, $options=array()) {
        
        # Инициализация статических переменных :
        static $referer = null;
        
		$http_header = array( 'Accept: application/json, text/javascript, */*; q=0.01', 'X-Requested-With: XMLHttpRequest' );
		
		if(mb_substr( $url, 0, 4 ) == 'http'){
			$request_url = $url;
			if(!is_null($data)){
				$http_header = array( 'Content-Type: application/json; charset=UTF-8' );
			}
		} else {
			$request_url = 'https://qiwi.com/'.$url;
		}		
		
		$c_options = array(
			CURLOPT_COOKIEJAR => $this->cookie_path,
			CURLOPT_COOKIEFILE => $this->cookie_path,
			CURLOPT_HTTPHEADER => $http_header,
			CURLOPT_POST => true,
			CURLOPT_POSTFIELDS => is_array( $data ) ? http_build_query( $data ) : $data,
		);
		
		$prox = array();
	
		/*
		для добавления еще одного proxy,
		копируем код и повторяем со своими данными
		*/
	
		/* code */
		$prox[] = array(
			'ip' => '', /* 255.255.255.0 */
			'port' => '', /* 80 */
			'login' => '', /* login */
			'password' => '', /* password */
		);
		/* end code */
	
		shuffle($prox);
	
		$now = is_isset($prox,'0');
		$ip = trim(is_isset($now,'ip'));
		$port = trim(is_isset($now,'port'));
		$login = trim(is_isset($now,'login'));
		$password = trim(is_isset($now,'password'));
		if($ip and $port){
			
			/* 	$c_options[CURLOPT_HTTPPROXYTUNNEL] = 0; */
			
			$c_options[CURLOPT_PROXY] = $ip;
			$c_options[CURLOPT_PROXYPORT] = $port;
			
			if($password and $login){
				$c_options[CURLOPT_PROXYUSERPWD] = $login.':'.$password;
			} elseif($password){
				$c_options[CURLOPT_PROXYAUTH] = $password;
			}
		}		
		
		if( !is_null( $referer ) ){
			$c_options[CURLOPT_REFERER] = $referer;
		}		
		
		if( is_array( $options ) and count( $options ) > 0){
			foreach($options as $k => $v){
				$c_options[$k] = $v;
			}
		}	
		
		$result = get_curl_parser($request_url, $c_options, 'merchant', 'qiwi');
		if( $result['err'] ){
			throw new Exception( $result['err'] );
		}
			
		$result_array = @json_decode( $result['output'], true );
			
		$referer = $request_url;
			
		if(is_array($result_array)){
			return $result_array;
		} else {
			return $result['output'];
		}
	
    }
}
}