package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import com.khachsan.quanlykhachsan.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Invoice>>> timKiem(
            @RequestParam(defaultValue = "") String maHoaDon,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("success", service.timKiem(maHoaDon, page, size)));
    }

    @DeleteMapping("/{maHoaDon}")
    public ResponseEntity<ApiResponse<Void>> xoa(@PathVariable String maHoaDon) {
        service.xoa(maHoaDon);
        return ResponseEntity.ok(ApiResponse.success("success"));
    }

    @GetMapping("/tinh-tong-tien/{maThue}")
    public TongTienResponse tinhTongTien(@PathVariable String maThue) {
        return service.tinhTongTien(maThue);
    }
}