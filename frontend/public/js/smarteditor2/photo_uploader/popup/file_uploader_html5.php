<?php
 	$sFileInfo = '';
	$headers = array();

	foreach($_SERVER as $k => $v) {
		if(substr($k, 0, 9) == "HTTP_FILE") {
			$k = substr(strtolower($k), 5);
			$headers[$k] = $v;
		}
	}

	$filename = rawurldecode($headers['file_name']);
	$filename_ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));  // 수정된 부분
	$allow_file = array("jpg", "png", "bmp", "gif");

	if(!in_array($filename_ext, $allow_file)) {
		echo "NOTALLOW_".$filename;
	} else {
		$file = new stdClass;
		$file->name = date("YmdHis").mt_rand().".".$filename_ext;
		$file->content = file_get_contents("php://input");

		$uploadDir = "../../../../data/design/editor/";
		if(!is_dir($uploadDir)){
			mkdir($uploadDir, 0777);
		}
		$newPath = $uploadDir.$file->name;

		// 임시 파일로 저장
		$tempPath = $uploadDir.'temp_'.$file->name;
		file_put_contents($tempPath, $file->content);

		// 이미지 크기를 조정 및 압축
		$resizedImagePath = resizeImage($tempPath, $newPath, $filename_ext);

		// 임시 파일 삭제
		unlink($tempPath);

		if ($resizedImagePath) {
			$sFileInfo .= "&bNewLine=true";
			$sFileInfo .= "&sFileName=".$filename;
			$sFileInfo .= "&sFileURL="."/data/design/editor/".$file->name;
		}

		echo $sFileInfo;
	}


function resizeImage($sourcePath, $destinationPath, $extension) {
    list($width, $height) = getimagesize($sourcePath);
    $newWidth = 1024; // 원하는 너비
    $newHeight = ($height / $width) * $newWidth; // 비율에 맞춘 높이

    $image_p = imagecreatetruecolor($newWidth, $newHeight);

    // 확장자에 따라 이미지 생성
    switch ($extension) {
        case 'jpg':
        case 'jpeg':
            $image = imagecreatefromjpeg($sourcePath);
            break;
        case 'png':
            $image = imagecreatefrompng($sourcePath);
            break;
        case 'gif':
            $image = imagecreatefromgif($sourcePath);
            break;
        default:
            return false;
    }

    // 이미지 리사이즈
    imagecopyresampled($image_p, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    // 압축된 이미지 저장
    switch ($extension) {
        case 'jpg':
        case 'jpeg':
            imagejpeg($image_p, $destinationPath, 75); // 75는 품질로, 0-100 사이 값을 가짐
            break;
        case 'png':
            imagepng($image_p, $destinationPath, 6); // 0-9 사이의 압축 레벨
            break;
        case 'gif':
            imagegif($image_p, $destinationPath);
            break;
    }

    // 메모리 해제
    imagedestroy($image_p);
    imagedestroy($image);

    return $destinationPath;
}
?>