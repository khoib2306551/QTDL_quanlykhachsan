package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.dto.response.hoadon.HoaDonListResponse;
import com.khachsan.quanlykhachsan.service.InvoiceService;
import com.khachsan.quanlykhachsan.dto.response.sddv.SuDungDichVuListResponse;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<HoaDonListResponse>>> timKiem(
            @RequestParam(defaultValue = "") String maHoaDon,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(defaultValue = "desc") String sapXep) {
        return ResponseEntity.ok(ApiResponse.success("success", service.timKiem(maHoaDon, tuNgay, denNgay, sapXep, page, size)));
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

    @GetMapping("/dich-vu/{maThue}")
    public ResponseEntity<ApiResponse<List<SuDungDichVuListResponse>>> layDichVu(@PathVariable String maThue) {
        return ResponseEntity.ok(ApiResponse.success("success", service.layDichVuTheoThue(maThue)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HoaDonListResponse>> them(
            @RequestBody InvoiceService.HoaDonRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("success", service.them(req)));
    }
}