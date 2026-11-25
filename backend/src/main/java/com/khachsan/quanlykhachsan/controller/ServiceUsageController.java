package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import com.khachsan.quanlykhachsan.dto.response.sddv.SuDungDichVuListResponse;
import com.khachsan.quanlykhachsan.service.ServiceUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/su-dung-dich-vu")
@RequiredArgsConstructor
public class ServiceUsageController {
    private final ServiceUsageService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SuDungDichVuListResponse>>> timKiem(
            @RequestParam(defaultValue = "") String maSddv,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("success", service.timKiem(maSddv, page, size)));
    }

    @DeleteMapping("/{maSddv}")
    public ResponseEntity<ApiResponse<Void>> xoa(@PathVariable String maSddv) {
        service.xoa(maSddv);
        return ResponseEntity.ok(ApiResponse.success("success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SuDungDichVuListResponse>> them(
            @RequestBody ServiceUsageService.SddvRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("success", service.them(req)));
    }

    @PutMapping("/{maSddv}")
    public ResponseEntity<ApiResponse<SuDungDichVuListResponse>> sua(
            @PathVariable String maSddv,
            @RequestBody ServiceUsageService.SddvRequest req) {
        return ResponseEntity.ok(ApiResponse.success("success", service.sua(maSddv, req)));
    }
}