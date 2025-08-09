package com.yourjob.backend.service

import com.yourjob.backend.entity.MetaTagResponse
import org.springframework.stereotype.Service

@Service
class MetaTagHtmlService {

    /**
     * 메타태그를 HTML 형태로 생성
     */
    fun generateMetaTagHtml(metaTag: MetaTagResponse): String {
        return buildString {
            appendLine("<meta name=\"description\" content=\"${escapeHtml(metaTag.description)}\"/>")
            appendLine("<meta property=\"og:title\" content=\"${escapeHtml(metaTag.title)}\"/>")
            appendLine("<meta property=\"og:description\" content=\"${escapeHtml(metaTag.description)}\"/>")
            appendLine("<meta property=\"og:url\" content=\"${escapeHtml(metaTag.url)}\"/>")
            if (metaTag.image != null) {
                appendLine("<meta property=\"og:image\" content=\"${metaTag.image}\"/>")
            }
            appendLine("<meta name=\"twitter:card\" content=\"summary\">")
            appendLine("<meta name=\"twitter:title\" content=\"${escapeHtml(metaTag.title)}\">")
            if (metaTag.image != null) {
                appendLine("<meta name=\"twitter:image\" content=\"${metaTag.image}\">")
            }
            appendLine("<meta name=\"twitter:description\" content=\"${escapeHtml(metaTag.description)}\">")
        }
    }

    /**
     * 완전한 HTML 페이지 생성 (크롤링 봇용)
     */
    fun generateFullHtmlPage(metaTag: MetaTagResponse, additionalContent: String = ""): String {
        return """
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta http-equiv="content-type" content="text/html; charset=UTF-8">
                <title>${escapeHtml(metaTag.title)}</title>
                ${generateMetaTagHtml(metaTag)}
            </head>
            <body>
            </body>
            </html>
        """.trimIndent()
    }

    /**
     * HTML 특수문자 이스케이프
     */
    private fun escapeHtml(text: String): String {
        return text.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&#39;")
    }
} 