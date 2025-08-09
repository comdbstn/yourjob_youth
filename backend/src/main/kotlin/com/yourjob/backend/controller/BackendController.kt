package com.yourjob.backend.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/backend")
class BackendController {

    @GetMapping("/echo")
    fun echoFromBackend(): String {
        return "Echo from Backend!"
    }
}
