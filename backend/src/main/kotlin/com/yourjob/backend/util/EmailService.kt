package com.yourjob.backend.util

import jakarta.mail.internet.MimeMessage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service

@Service
class EmailService {

    @Value("\${spring.mail.username}")
    private lateinit var senderEmail: String

    @Value("\${spring.mail.from}")
    private val fromEmail: String? = null

    @Autowired
    private lateinit var javaMailSender: JavaMailSender

    fun sendVerificationEmail(toEmail: String, verificationCode: String) {
        val message = SimpleMailMessage()
        message.setFrom(fromEmail)
        message.setTo(toEmail)
        message.setSubject("유어잡 이메일 인증번호")
        message.setText("안녕하세요, 유학생 채용 플랫폼 유어잡입니다.\n\n이메일 인증코드는 $verificationCode 입니다.\n\n이 코드는 5분 후에 만료됩니다.")

        javaMailSender.send(message)
    }

    fun sendTemporaryPassword(toEmail: String, tempPassword: String, accountId: String) {
        val message = SimpleMailMessage()
        message.setFrom(fromEmail)
        message.setTo(toEmail)
        message.setSubject("유어잡 임시 비밀번호 안내")

        val emailContent = """
            | 안녕하세요, 유학생 채용 플랫폼 유어잡입니다.
            |
            | 요청하신 임시 비밀번호가 발급되었습니다.
            |
            | 아이디: $accountId
            | 임시 비밀번호: $tempPassword
            |
            | 보안을 위해 로그인 후 비밀번호를 변경해주세요.
            |
            | 감사합니다.
        """.trimMargin()

        message.setText(emailContent)

        javaMailSender.send(message)
    }

    fun sendPositionOfferNotification(
        toEmail: String,
        companyName: String,
        position: String,
        positionInfo: String?,
        message: String,
        manager: String,
        jobSeekerName: String? = null
    ) {
        val mimeMessage: MimeMessage = javaMailSender.createMimeMessage()
        val helper = MimeMessageHelper(mimeMessage, true, "UTF-8")

        helper.setFrom(fromEmail!!)
        helper.setTo(toEmail)
        helper.setSubject("[유어잡]${companyName}에서 ${jobSeekerName ?: ""}님께 포지션을 제안했습니다")

        val htmlContent = """
            <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>포지션 제안</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #2563eb; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">URJOB</h1>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #ffffff;">유학생 채용 플랫폼</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <!-- Greeting -->
                            <h2 style="font-size: 20px; font-weight: 500; color: #1a1a1a; margin: 0 0 20px 0;">
                                안녕하세요, ${jobSeekerName ?: "인재"}님!
                            </h2>
                            
                            <p style="font-size: 15px; color: #555; margin: 0 0 25px 0; line-height: 1.6;">
                                ${companyName}에서 ${jobSeekerName ?: "인재"}님께 포지션 제안을 보냈습니다.
                            </p>
                            
                            <!-- Company Info -->
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 15px; background-color: #f8f9fa; border-left: 3px solid #2563eb;">
                                        <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">제안 기업</p>
                                        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #2563eb;">${companyName}</h3>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Position Section -->
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0 0 10px 0;">제안 포지션</h3>
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding: 15px; background-color: #fafafa; border: 1px solid #e5e5e5;">
                                                    <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                                                        ${position}
                                                    </h4>
                                                    ${
            if (!positionInfo.isNullOrBlank()) """
                                                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #666; line-height: 1.5;">
                                                        $positionInfo
                                                    </p>
                                                    """ else ""
        }
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Message Section -->
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0 0 10px 0;">제안 내용</h3>
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding: 15px; background-color: #fef8e7; border: 1px solid #fcd34d;">
                                                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6; white-space: pre-line;">${message.trim()}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Manager Info -->
                            <p style="font-size: 14px; color: #666; margin: 0 0 25px 0;">
                                담당자: <strong style="color: #333;">${manager}</strong>
                            </p>
                            
                            <!-- CTA Section -->
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
                                            더 자세한 내용을 확인하고 제안에 응답해주세요.
                                        </p>
                                        <a href="https://www.urjob.kr/mypage/proposal" style="display: inline-block; padding: 12px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 15px;">
                                            포지션 제안 확인하기 →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 12px; color: #888; line-height: 1.5;">
                                본 메일은 발신 전용입니다. 문의사항은 <a href="https://www.urjob.kr" style="color: #2563eb; text-decoration: none;">유어잡 홈페이지</a>를 이용해주세요.<br>
                                © 2024 Your Job. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """.trimIndent()

        helper.setText(htmlContent, true)
        javaMailSender.send(mimeMessage)
    }

    fun sendFinalAcceptanceNotification(
        toEmail: String,
        companyName: String,
        position: String,
        title: String,
        content: String,
        jobSeekerName: String? = null
    ) {
        val mimeMessage: MimeMessage = javaMailSender.createMimeMessage()
        val helper = MimeMessageHelper(mimeMessage, true, "UTF-8")

        helper.setFrom(fromEmail!!)
        helper.setTo(toEmail)
        helper.setSubject("[유어잡] $title")

        val htmlContent = """
        <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>최종 합격 안내</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #2563eb; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">URJOB</h1>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #ffffff;">유학생 채용 플랫폼</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <!-- Title -->
                            <h2 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px 0; text-align: center;">
                                최종 합격 발표
                            </h2>
                            
                            <!-- Company & Position Info -->
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 10px;">
                                                    <span style="font-size: 14px; color: #666;">회사명</span><br>
                                                    <strong style="font-size: 16px; color: #2563eb;">$companyName</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span style="font-size: 14px; color: #666;">지원 포지션</span><br>
                                                    <strong style="font-size: 16px; color: #333;">$position</strong>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Content Section -->
                            <div style="background-color: #fff9e6; border: 1px solid #ffd666; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                                <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0 0 15px 0;">합격 안내</h3>
                                <p style="margin: 0; font-size: 15px; color: #555; line-height: 1.8; white-space: pre-line;">$content</p>
                            </div>
                            
                            <!-- CTA Section -->
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #666;">
                                            자세한 내용은 유어잡 마이페이지에서 확인하실 수 있습니다.
                                        </p>
                                        <a href="https://www.urjob.kr/mypage/applications" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                            마이페이지 바로가기 →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 12px; color: #888; line-height: 1.5;">
                                본 메일은 발신 전용입니다. 문의사항은 <a href="https://www.urjob.kr" style="color: #2563eb; text-decoration: none;">유어잡 홈페이지</a>를 이용해주세요.<br>
                                © 2025 Your Job. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    """.trimIndent()

        helper.setText(htmlContent, true)
        javaMailSender.send(mimeMessage)
    }
}