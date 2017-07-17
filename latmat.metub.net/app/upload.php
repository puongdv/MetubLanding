<?php

header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

require_once("./lib/Helper.php");

@set_time_limit(30*60);
define('__PATH_ROOT',dirname(__FILE__));
//\Helper::setLog($_FILES);

// Settings
$targetDir = __PATH_ROOT . '/videos';
$cleanupTargetDir = true; // Remove old files
$maxFileAge = 5 * 3600; // Temp file age in seconds

if (!file_exists($targetDir)) {
	@mkdir($targetDir);
}

if (isset($_REQUEST["name"])) {
	$fileName = $_REQUEST["name"];
} elseif (!empty($_FILES)) {
	$fileName = $_FILES["file"]["name"];
} else {
	$fileName = uniqid("file_");
}

$filePath = $targetDir . DIRECTORY_SEPARATOR . $fileName;

// Chunking might be enabled
$chunk = isset($_REQUEST["chunk"]) ? intval($_REQUEST["chunk"]) : 0;
$chunks = isset($_REQUEST["chunks"]) ? intval($_REQUEST["chunks"]) : 0;


// Remove old temp files	
if ($cleanupTargetDir) {
	if (!is_dir($targetDir) || !$dir = opendir($targetDir)) {		
		$d = array(
			'error'=> 1, 'msg'=> '102:Failed to open temp directory', 'data'=> $filePath
		);
		die(json_encode($d));
	}

	while (($file = readdir($dir)) !== false) {
		$tmpfilePath = $targetDir . DIRECTORY_SEPARATOR . $file;

		// If temp file is current file proceed to the next
		if ($tmpfilePath == "{$filePath}.part") {
			continue;
		}

		// Remove temp file if it is older than the max age and is not the current file
		if (preg_match('/\.part$/', $file) && (filemtime($tmpfilePath) < time() - $maxFileAge)) {
			@unlink($tmpfilePath);
		}
	}
	closedir($dir);
}	


// Open temp file
if (!$out = @fopen("{$filePath}.part", $chunks ? "ab" : "wb")) {	
	$d = array(
		'error'=> 1, 'msg'=> '102:Failed to open output stream', 'data'=> $filePath
	);
	die(json_encode($d));
}

if (!empty($_FILES)) {
	if ($_FILES["file"]["error"] || !is_uploaded_file($_FILES["file"]["tmp_name"])) {		
		$d = array(
			'error'=> 1, 'msg'=> '101:Failed to move uploaded file', 'data'=> $filePath
		);
		die(json_encode($d));	
	}

	// Read binary input stream and append it to temp file
	if (!$in = @fopen($_FILES["file"]["tmp_name"], "rb")) {
		$d = array(
			'error'=> 1, 'msg'=> '101:Failed to open input stream', 'data'=> $filePath
		);
		die(json_encode($d));		
	}
} else {	
	if (!$in = @fopen("php://input", "rb")) {
		$d = array(
			'error'=> 1, 'msg'=> '101:Failed to open input stream', 'data'=> $filePath
		);
		die(json_encode($d));				
	}
}

while ($buff = fread($in, 4096)) {
	fwrite($out, $buff);
}

@fclose($out);
@fclose($in);

// Check if file has been uploaded
if (!$chunks || $chunk == $chunks - 1) {
	// Strip the temp .part suffix off 
	rename("{$filePath}.part", $filePath);
	$d = array(
		'error'=> 0, 'msg'=> 'Successfull', 'data'=> $filePath
	);
	die(json_encode($d));	
}

die('{"jsonrpc" : "2.0", "result" : null, "id" : "id"}');