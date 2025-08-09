package com.yourjob.backend.util

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtil(
    @Value("\${jwt.secret}") private val secretKey: String
) {

    private val key: SecretKey = Keys.hmacShaKeyFor(secretKey.toByteArray())

    fun generateToken(userId: String, userType: String): String {
        return Jwts.builder()
            .setSubject(userId)
            .claim("userId", userId)
            .claim("userType", userType)
            .setIssuedAt(Date())
            //1 days
            .setExpiration(Date(System.currentTimeMillis() + 86400000))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact()
    }

    private fun extractTokenFromHeader(tokenHeader: String): String {
        return if (tokenHeader.startsWith("Bearer ", ignoreCase = true)) {
            tokenHeader.substring(7) // "Bearer " 이후 부분
        } else {
            tokenHeader // 이미 순수 토큰인 경우
        }
    }

    // 토큰에서 userId를 추출
    fun getUserIdFromToken(tokenHeader: String): String? {
        val token = extractTokenFromHeader(tokenHeader)
        return try {
            val claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).body
            claims.get("userId", String::class.java)
        } catch (e: JwtException) {
            null
        }
    }

    // 토큰에서 userType을 추출
    fun getUserTypeFromToken(tokenHeader: String): String? {
        val token = extractTokenFromHeader(tokenHeader)
        return try {
            val claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).body
            claims.get("userType", String::class.java)
        } catch (e: JwtException) {
            null
        }
    }

    // 토큰에서 userId, userType 동시 추출
    fun getUserInfoFromToken(tokenHeader: String): Pair<String?, String?> {
        val token = extractTokenFromHeader(tokenHeader)
        return try {
            val claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).body
            Pair(
                claims.get("userId", String::class.java),
                claims.get("userType", String::class.java)
            )
        } catch (e: JwtException) {
            Pair(null, null)
        }
    }

    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token)
            true
        } catch (e: JwtException) {
            false
        }
    }

    fun getEmailFromToken(token: String): String? {
        return try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).body.subject
        } catch (e: JwtException) {
            null
        }
    }
}
