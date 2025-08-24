package com.yourjob.backend.util

import jakarta.servlet.http.HttpSession
import jakarta.servlet.http.HttpSessionEvent
import jakarta.servlet.http.HttpSessionListener
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap

@Component
class SessionTracker : HttpSessionListener{

    companion object{
        val sessions = ConcurrentHashMap<String, HttpSession>()
    }

    override fun sessionCreated(se: HttpSessionEvent?) {
        if (se != null) {
            sessions[se.session.id] = se.session
        }
    }

    override fun sessionDestroyed(se: HttpSessionEvent?) {
        if (se != null) {
            sessions.remove(se.session.id)
        }
    }

    fun invalicateAllSessions(){
        sessions.values.forEach {
            try {
                it.invalidate()
            }catch (e: IllegalStateException){
                // 세션이 이미 무효화 된 경우
            }
        }
        sessions.clear()
    }
}