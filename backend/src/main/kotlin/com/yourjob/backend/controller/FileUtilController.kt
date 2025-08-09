package com.yourjob.backend.controller

import com.yourjob.backend.service.FileUtilService
import jakarta.servlet.http.HttpSession
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.InputStreamResource
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.util.UriUtils
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.nio.charset.StandardCharsets
import java.nio.file.Paths

@RestController
@RequestMapping("/api/v1")
class FileUtilController (private var fileUtilService: FileUtilService){
    @Value("\${servlet.multipart.location}")
    lateinit var save_path: String

    @GetMapping("/image/show/{fileidx}")
    fun api_v1_corplogoimg_get_fileidx(@PathVariable fileidx: Int, session: HttpSession): ResponseEntity<UrlResource> {
        var mMap = mutableMapOf<String, Any>()
        mMap.put("fileidx", fileidx)
        var attached_file_inform = fileUtilService.getFileDataByIdx(mMap)
        var file_type = attached_file_inform.get("type").toString()
        var file_year_date = attached_file_inform.get("year_date").toString()
        var file_file_name = attached_file_inform.get("file_name").toString()

        val imageResource = ClassPathResource("C:\\Users\\admin\\dev\\123.png")
        val uyfuyf = save_path
        //"d8259d02-ab48-494f-aef9-8c292cd4c53a_20250114_105729593.jpg"
        val uuid = "d8259d02-ab48-494f-aef9-8c292cd4c53a"
        val fileNm = "20250114_105729593.jpg"
        //val savePath = Paths.get(uyfuyf, uuid + "_" + fileNm)
        val savePath = Paths.get(uyfuyf, file_type + "\\" + file_year_date + "\\" + file_file_name)
        val resource = UrlResource("file:" + savePath)
        //한글 파일 이름이나 특수 문자의 경우 깨질 수 있으니 인코딩 한번 해주기
        val encodedUploadFileName: String = UriUtils.encode(
            "uploadFileName",
            StandardCharsets.UTF_8
        )
        //아래 문자를 ResponseHeader에 넣어줘야 한다. 그래야 링크를 눌렀을 때 다운이 된다.
        //정해진 규칙이다.
        val contentDisposition = "attachment; filename=\"$encodedUploadFileName\""
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
            .body<UrlResource>(resource)
    }
    @GetMapping("/image/show")
    fun api_v1_corplogoimg_get(session: HttpSession): ResponseEntity<UrlResource> {
        val imageResource = ClassPathResource("C:\\Users\\admin\\dev\\123.png")
        val uyfuyf = save_path
        //"d8259d02-ab48-494f-aef9-8c292cd4c53a_20250114_105729593.jpg"
        val uuid = "d8259d02-ab48-494f-aef9-8c292cd4c53a"
        val fileNm = "20250114_105729593.jpg"
        val savePath = Paths.get(uyfuyf, uuid + "_" + fileNm)
        val resource = UrlResource("file:" + savePath)
        //한글 파일 이름이나 특수 문자의 경우 깨질 수 있으니 인코딩 한번 해주기
        val encodedUploadFileName: String = UriUtils.encode(
            "uploadFileName",
            StandardCharsets.UTF_8
        )
        //아래 문자를 ResponseHeader에 넣어줘야 한다. 그래야 링크를 눌렀을 때 다운이 된다.
        //정해진 규칙이다.
        val contentDisposition = "attachment; filename=\"$encodedUploadFileName\""
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
            .body<UrlResource>(resource)
    }
    @GetMapping("/image/show/bin")
    fun api_v1_corplogoimg_get_binary(session: HttpSession): ByteArray {
        val uyfuyf = save_path
        //"d8259d02-ab48-494f-aef9-8c292cd4c53a_20250114_105729593.jpg"
        val uuid = "d8259d02-ab48-494f-aef9-8c292cd4c53a"
        val fileNm = "20250114_105729593.jpg"
        val savePath = Paths.get(uyfuyf, uuid + "_" + fileNm)
        val resource = UrlResource("file:" + savePath)
        val b = resource.contentAsByteArray
        return b
    }
    @GetMapping("/image/download")
    fun api_v1_corplogoimg_download(session: HttpSession): ResponseEntity<UrlResource> {
        val imageResource = ClassPathResource("C:\\Users\\admin\\dev\\123.png")
        val uyfuyf = save_path
        //"d8259d02-ab48-494f-aef9-8c292cd4c53a_20250114_105729593.jpg"
        val uuid = "d8259d02-ab48-494f-aef9-8c292cd4c53a"
        val fileNm = "20250114_105729593.jpg"
        val savePath = Paths.get(uyfuyf, uuid + "_" + fileNm)
        val resource = UrlResource("file:" + savePath)
        //한글 파일 이름이나 특수 문자의 경우 깨질 수 있으니 인코딩 한번 해주기
        val encodedUploadFileName: String = UriUtils.encode(
            "uploadFileName",
            StandardCharsets.UTF_8
        )
        //아래 문자를 ResponseHeader에 넣어줘야 한다. 그래야 링크를 눌렀을 때 다운이 된다.
        //정해진 규칙이다.
        val contentDisposition = "attachment; filename=\"$encodedUploadFileName\""
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
            .body<UrlResource>(resource)
    }
    @GetMapping("/image/download/{fileidx}")
    fun api_v1_file_download_request(@PathVariable fileidx: Int, session: HttpSession): ResponseEntity<UrlResource> {
        var mMap = mutableMapOf<String, Any>()
        mMap.put("fileidx", fileidx)
        var attached_file_inform = fileUtilService.getFileDataByIdx(mMap)
        var file_type = attached_file_inform.get("type").toString()
        var file_year_date = attached_file_inform.get("year_date").toString()
        var file_file_name = attached_file_inform.get("file_name").toString()
        val uyfuyf = save_path
        //"d8259d02-ab48-494f-aef9-8c292cd4c53a_20250114_105729593.jpg"
        val uuid = "d8259d02-ab48-494f-aef9-8c292cd4c53a"
        val fileNm = "20250114_105729593.jpg"
        //val savePath = Paths.get(uyfuyf, uuid + "_" + fileNm)
        val savePath = Paths.get(uyfuyf, file_type + "\\" + file_year_date + "\\" + file_file_name)
        val resource = UrlResource("file:" + savePath)
        //한글 파일 이름이나 특수 문자의 경우 깨질 수 있으니 인코딩 한번 해주기
        val encodedUploadFileName: String = UriUtils.encode(
            file_file_name.split("_")[1],
            StandardCharsets.UTF_8
        )
        //아래 문자를 ResponseHeader에 넣어줘야 한다. 그래야 링크를 눌렀을 때 다운이 된다.
        //정해진 규칙이다.
        val contentDisposition = "attachment; filename=\"$encodedUploadFileName\""
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
            .body<UrlResource>(resource)
    }
}