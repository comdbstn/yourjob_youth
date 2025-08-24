package com.yourjob.backend.controller.product

import com.yourjob.backend.entity.product.ProductRequest
import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.entity.product.ProductUpdateRequest
import com.yourjob.backend.service.product.ProductService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/products")
class ProductController(private val productService: ProductService) {

    @GetMapping
    fun getAllProducts(@RequestParam(required = false) status: String?,
                       @RequestParam(required = false) type: String?,
                       @RequestParam(defaultValue = "0") page: Int,
                       @RequestParam(defaultValue = "10") size: Int): ResponseEntity<Page<ProductResponse>> {
        val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))

        return ResponseEntity.ok(productService.getAllProducts(status, type, pageRequest))
    }

    @GetMapping("/{id}")
    fun getProductById(@PathVariable id: Long): ResponseEntity<ProductResponse> {
        val product = productService.getProductById(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(product)
    }

    @GetMapping("/product-id/{productId}")
    fun getProductByProductId(@PathVariable productId: String): ResponseEntity<ProductResponse> {
        val product = productService.getProductByProductId(productId) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(product)
    }

    @GetMapping("/status/{status}")
    fun getProductsByStatus(@PathVariable status: String): ResponseEntity<List<ProductResponse>> {
        return ResponseEntity.ok(productService.getProductsByStatus(status))
    }

    @GetMapping("/type/{type}")
    fun getProductsByType(@PathVariable type: String): ResponseEntity<List<ProductResponse>> {
        return ResponseEntity.ok(productService.getProductsByType(type))
    }

    @PostMapping
    fun createProduct(@RequestBody request: ProductRequest): ResponseEntity<ProductResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request))
    }

    @PutMapping("/{id}")
    fun updateProduct(@PathVariable id: Long, @RequestBody request: ProductUpdateRequest): ResponseEntity<ProductResponse> {
        val product = productService.updateProduct(id, request) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(product)
    }

    @DeleteMapping("/{id}")
    fun deleteProduct(@PathVariable id: Long): ResponseEntity<Void> {
        productService.deleteProduct(id)
        return ResponseEntity.noContent().build()
    }
}