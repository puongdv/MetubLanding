<?php

/**
 * Created by PhpStorm.
 * User: Bee
 * Date: 7/15/2017
 * Time: 6:58 PM
 */
class Helper
{
    public static function addVideoToPlaylist($videoId, $playlistId, $title, $youtube){
        try{
            $resourceId = new Google_Service_YouTube_ResourceId();
            $resourceId->setVideoId($videoId);
            $resourceId->setKind('youtube#video');
            // Then define a snippet for the playlist item. Set the playlist item's
            // title if you want to display a different value than the title of the
            // video being added. Add the resource ID and the playlist ID retrieved
            // in step 4 to the snippet as well.
            $playlistItemSnippet = new Google_Service_YouTube_PlaylistItemSnippet();
            $playlistItemSnippet->setTitle($title);
            $playlistItemSnippet->setPlaylistId($playlistId);
            $playlistItemSnippet->setResourceId($resourceId);
            // Finally, create a playlistItem resource and add the snippet to the
            // resource, then call the playlistItems.insert method to add the playlist
            // item.
            $playlistItem = new Google_Service_YouTube_PlaylistItem();
            $playlistItem->setSnippet($playlistItemSnippet);
            $playlistItemResponse = $youtube->playlistItems->insert('snippet,contentDetails', $playlistItem, array());

            return (object)array("error" => 0, "msg" => 'OK');
        } catch (Google_Service_Exception $e) {
            return (object)array("error" => 111, "msg" => 'An client error occurred: ' + $e->getMessage());
        } catch (Google_Exception $e) {
            return (object)array("error" => 112, "msg" => 'An client error occurred: ' + $e->getMessage());
        }

    }

    public static function setVideoThumb($client, $youtube, $videoId, $imgPath){
        try{
            $chunkSizeBytes = 1 * 1024 * 1024;
            $client->setDefer(true);
            $setRequest = $youtube->thumbnails->set($videoId);
            $media = new Google_Http_MediaFileUpload(
                $client,
                $setRequest,
                'image/png',
                null,
                true,
                $chunkSizeBytes
            );
            $media->setFileSize(filesize($imgPath));

            $status = false;
            $handle = fopen($imgPath, "rb");
            while (!$status && !feof($handle)) {
                $chunk = fread($handle, $chunkSizeBytes);
                $status = $media->nextChunk($chunk);
            }
            fclose($handle);
            $client->setDefer(false);

            return (object)array("error" => 0, "msg" => 'OK');
        }catch (\Exception $e){
            return (object)array("error" => 221, "msg" => 'An client error occurred: ' + $e->getMessage());
        }
    }

    public static function setLog($data){
        $content = file_get_contents(__PATH_ROOT . '/logs/main.log');
        $content.= "\nYOUTUBE " . date('d-m-y h:i') . json_encode($data);
        file_put_contents(__PATH_ROOT . '/logs/main.log', $content);
    }

    public static function pushLog($data, $model){
        $content = json_encode($data) . PHP_EOL;
        file_put_contents(__PATH_ROOT . '/logs/'.$model.'.log', $content, FILE_APPEND);
    }

    public static function addVideo($v){
        Helper::pushLog($v, "video");
        $url = "http://api.metub.tk/video";
        return Helper::curl($url, $v);
    }

    public static function addUser($u){
        Helper::pushLog($u, "user");
        $url = "http://api.metub.tk/user";
        return Helper::curl($url, $u);
    }

    public static function curl($url, $fields = array()){
        try{
            $jsonString = json_encode($fields);
            //open connection
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonString);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                    'Content-Type: application/json',
                    'Content-Length: ' . strlen($jsonString))
            );
            //execute post
            $result = curl_exec($ch);

            //close connection
            curl_close($ch);
            if(empty($result)){
                return (object)array("status" => "ERROR", "msg" => 'Data not found');
            }
            return json_decode($result);
        }catch (\Exception $e){
            return (object)array("status" => "ERROR", "msg" => 'An client error occurred: ' + $e->getMessage());
        }

    }
}