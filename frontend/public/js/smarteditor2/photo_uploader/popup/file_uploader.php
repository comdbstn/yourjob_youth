<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/admin/_common.php";

$url = $_REQUEST["callback"].'?callback_func='.$_REQUEST["callback_func"];
$bSuccessUpload = is_uploaded_file($_FILES['Filedata']['tmp_name']);

$dateTime = date('YmdHis');
$randomString = substr(md5(uniqid(rand(), true)), 0, 6);

// SUCCESSFUL
if(bSuccessUpload) {
	$tmp_name = $_FILES['Filedata']['tmp_name'];
	$temp_var= explode(".", rawurldecode($_FILES['Filedata']['name']));
	$name = str_replace("\0", "", time().'-'.rand(0,100).'.'.$temp_var[1]);

	$filename_ext = strtolower(array_pop(explode('.',$name)));
	$allow_file = array("jpg", "png", "bmp", "gif");

	//$upFile = $name[0].$wdate;
	$upFile = $dateTime."_".$randomString;

	if(!in_array($filename_ext, $allow_file)) {
		$url .= '&errstr='.$upFile;
	} else {
		$uploadDir = "../../../../data/design/editor/";
		$newPath = urlencode($upFile.".".$filename_ext);
		if(move_uploaded_file($tmp_name, $uploadDir.$newPath)){//파일저장
			resizeImage(1024,$uploadDir.$newPath,$uploadDir.$newPath);
		}
		
		$url .= "&bNewLine=true";
		$url .= "&sFileName=".urlencode(urlencode($upFile.".".$filename_ext));
		$url .= "&sFileURL=/data/design/editor/".urlencode(urlencode($upFile.".".$filename_ext));
	}
}
// FAILED
else {
	$url .= '&errstr=error';
}
	
header('Location: '. $url);
?>