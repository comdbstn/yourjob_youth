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
	$filename_ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));  // ������ �κ�
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

		// �ӽ� ���Ϸ� ����
		$tempPath = $uploadDir.'temp_'.$file->name;
		file_put_contents($tempPath, $file->content);

		// �̹��� ũ�⸦ ���� �� ����
		$resizedImagePath = resizeImage($tempPath, $newPath, $filename_ext);

		// �ӽ� ���� ����
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
    $newWidth = 1024; // ���ϴ� �ʺ�
    $newHeight = ($height / $width) * $newWidth; // ������ ���� ����

    $image_p = imagecreatetruecolor($newWidth, $newHeight);

    // Ȯ���ڿ� ���� �̹��� ����
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

    // �̹��� ��������
    imagecopyresampled($image_p, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    // ����� �̹��� ����
    switch ($extension) {
        case 'jpg':
        case 'jpeg':
            imagejpeg($image_p, $destinationPath, 75); // 75�� ǰ����, 0-100 ���� ���� ����
            break;
        case 'png':
            imagepng($image_p, $destinationPath, 6); // 0-9 ������ ���� ����
            break;
        case 'gif':
            imagegif($image_p, $destinationPath);
            break;
    }

    // �޸� ����
    imagedestroy($image_p);
    imagedestroy($image);

    return $destinationPath;
}
?>