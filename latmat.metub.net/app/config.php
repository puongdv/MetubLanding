<?php
	error_reporting(E_ALL);
	ini_set('display_errors', TRUE);
	ini_set('display_startup_errors', TRUE);
	date_default_timezone_set('Asia/Ho_Chi_Minh');
    session_start();
    ini_set('max_execution_time', 0);
    // OAUTH Configuration
    $oauthClientID = '748993291105-6cli0g98vavbhesjjv9fqvfh3oqbieue.apps.googleusercontent.com';
    $oauthClientSecret = '0RtSM0o4WZioPP5VBnKWTWk1';
    $baseUri = 'http://www.123dramas.com';
    $redirectUri = 'http://www.123dramas.com/oauth2callback';
    
    define('OAUTH_CLIENT_ID',$oauthClientID);
    define('OAUTH_CLIENT_SECRET',$oauthClientSecret);
    define('REDIRECT_URI',$redirectUri);
    define('BASE_URI',$baseUri);
    
    // Include google client libraries
    require_once 'lib/Google/autoload.php';
    require_once 'lib/Google/Client.php';
    require_once 'lib/Google/Service/YouTube.php';
    
	$scope = array(
		'https://www.googleapis.com/auth/youtube.upload', 
		'https://www.googleapis.com/auth/youtube', 
		'https://www.googleapis.com/auth/youtubepartner'
	);
	
    $client = new Google_Client();
    $client->setClientId(OAUTH_CLIENT_ID);
    $client->setClientSecret(OAUTH_CLIENT_SECRET);
    $client->setScopes('https://www.googleapis.com/auth/youtube');
    $client->setRedirectUri(REDIRECT_URI);
	$client->setScopes($scope);
	$client->setAccessType('offline');
    
    // Define an object that will be used to make all API requests.
    $youtube = new Google_Service_YouTube($client);
	$token = file_get_contents('./token.json',true);
    define('__TOKEN',$token);
	define('__PATH_ROOT',dirname(__FILE__));
?>
