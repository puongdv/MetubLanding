<?php

require_once 'config.php';
require_once 'lib/Helper.php';

$isThumb = false;
$imagePath = null;
if(empty($_POST) || empty($_POST['fileName']) || $_POST['fileName'] == '' || empty($_POST['ID'])){
	die(json_encode(array('error'=> 7777, 'msg'=> 'Có lỗi xảy ra, vui lòng thử lại sau')));
}
if(empty($_POST['role']) || empty($_POST['roleName'])){
	die(json_encode(array('error'=> 1, 'msg'=> 'Yêu cầu chọn vai diễn')));
}
if(empty($_POST['fullname'])){
	die(json_encode(array('error'=> 1, 'msg'=> 'Yêu cầu nhập họ và tên của bạn')));
}
if(empty($_POST['phone'])){
	die(json_encode(array('error'=> 1, 'msg'=> 'Yêu cầu nhập số điện thoại của bạn')));
}
if(empty($_POST['content'])){
	die(json_encode(array('error'=> 1, 'msg'=> 'Yêu cầu nhập nội dung mô tả')));
}
if(strlen($_POST['phone']) < 10 || strlen($_POST['phone']) > 11){
	die(json_encode(array('error'=> 1, 'msg'=> 'Số điện thoại không hợp lệ, Yêu cầu nhập đúng số điện thoại của bạn')));
}
if (!empty($_POST['email']) && !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
	die(json_encode(array('error'=> 1, 'msg'=> 'Địa chỉ email không hợp lệ, Yêu cầu nhập đúng email của bạn')));
}
\Helper::setLog($_POST);
if($_FILES && $_FILES["thumbnailFile"]["name"] != ''){
	$fileName = str_shuffle('nityanandamaity').'-'.basename($_FILES["thumbnailFile"]["name"]);
	$targetDir = __PATH_ROOT . "/videos/";
	$targetFile = $targetDir . $fileName;
	if(move_uploaded_file($_FILES['thumbnailFile']['tmp_name'], $targetFile)) {
		$imagePath = $targetFile;
		$isThumb = true;
	}else{
		die(json_encode(array('error'=> 8888, 'msg'=> 'Có lỗi xảy ra, không lưu được thumbnail')));
	}
}

$client->setAccessToken(__TOKEN);

if ($client->getAccessToken()) {
	$t = json_decode(__TOKEN);
	$client->refreshToken($t->refresh_token);
	try{
		$description = "Commission...";
		$title = 'Casting Online Phim Lật Mặt 3 | SBD: '. $_POST['ID'] .' - '.  $_POST['fullname'] .' - ' . $_POST['roleName'];
		$videoPath = $_POST['fileName'];
		$playlistId = $_POST['role'];
		$tags = "metub network, casting online, casting, lật mặt 3, phim lật mặt 3, lat mat 3, ly hai, ly hai production, lat mat 2 ly hai, lat mat 3 ly hai, ly hai lat mat, ly hai lat mat 3, lý hải";

		$snippet = new Google_Service_YouTube_VideoSnippet();
		$snippet->setTitle($title);
		$snippet->setDescription($description);
		$snippet->setCategoryId("22");
		$snippet->setTags(explode(",",$tags));
		// Set the video's status to "public". Valid statuses are "public",
		// "private" and "unlisted".
		$status = new Google_Service_YouTube_VideoStatus();
		$status->privacyStatus = "private";

		// Associate the snippet and status objects with a new video resource.
		$video = new Google_Service_YouTube_Video();
		$video->setSnippet($snippet);
		$video->setStatus($status);

		// Specify the size of each chunk of data, in bytes. Set a higher value for
		// reliable connection as fewer chunks lead to faster uploads. Set a lower
		// value for better recovery on less reliable connections.
		$chunkSizeBytes = 10 * 1024 * 1024;

		$client->setDefer(true);

		// Create a request for the API's videos.insert method to create and upload the video.
		$insertRequest = $youtube->videos->insert("status,snippet", $video);
		// Create a MediaFileUpload object for resumable uploads.
		$media = new Google_Http_MediaFileUpload(
			$client,
			$insertRequest,
			'video/*',
			null,
			true,
			$chunkSizeBytes
		);
		$media->setFileSize(filesize($videoPath));
		// Read the media file and upload it.
		$status = false;
		$handle = fopen($videoPath, "rb");
		while (!$status && !feof($handle)) {			
			$chunk = fread($handle, $chunkSizeBytes);			
			$status = $media->nextChunk($chunk);
			\Helper::setLog(array("CHUNK" => $title . json_encode($status)));
		}
		fclose($handle);
		// If you want to make other calls after the file upload, set setDefer back to false
		$client->setDefer(false);
		@unlink($videoPath);
		$videoId = $status['id'];	
		//Set thumbnail		
		/*if($isThumb){
			$imgResult = \Helper::setVideoThumb($client, $youtube, $videoId, $imagePath);
			if($imgResult->error != 0){
				die(json_encode($imgResult));
			}
		}*/
		$plsResult = \Helper::addVideoToPlaylist($videoId, $playlistId, $title, $youtube);
		if($plsResult->error != 0){
			die(json_encode($plsResult));
		}
		$u = array(
			"ID" => $_POST["ID"],
			"fullname" => $_POST['fullname'],
			"email" => $_POST['email'],
			"phone" => $_POST['phone'],
		);
		$uResult = \Helper::addUser($u);
		if(empty($uResult) || $uResult->status != "OK"){
			\Helper::setLog($uResult);
		}
		$v = array(
			"playlistId" => $playlistId,
			"userId" => $_POST['ID'],
			"title" => $title,
			"description" => $description,
			"tags" => $tags
		);
		$vResult = \Helper::addVideo($v);
		if(empty($vResult) || $vResult->status != "OK"){
			\Helper::setLog($vResult);
		}
		file_put_contents(__PATH_ROOT . '/token.json', $client->getAccessToken());
		die(json_encode(array('error'=> 0, 'msg'=> 'Successfull', 'data' => $videoId)));
	} catch (Google_ServiceException $e) {
		\Helper::setLog($e);
		$msg = sprintf('<p>A service error occurred: <code>%s</code></p>',htmlspecialchars($e->getMessage()));
		die(json_encode(array('error'=> 9999, 'msg'=> $msg)));
	} catch (Google_Exception $e) {
		\Helper::setLog($e);
		$msg = sprintf('<p>An client error occurred: <code>%s</code></p>', htmlspecialchars($e->getMessage()));
		$msg .= 'Please contact administrator';
		die(json_encode(array('error'=> 9999, 'msg'=> $msg)));
	} 
} else {
	die(json_encode(array('error'=> 9999, 'msg'=> 'Có lỗi xảy ra, vui lòng thử lại sau')));
}
?>