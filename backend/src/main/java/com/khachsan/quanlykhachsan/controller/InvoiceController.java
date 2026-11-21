package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.response.InvoiceDetailResponse;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import com.khachsan.quanlykhachsan.service.InvoiceService;
import com.khachsan.quanlykhachsan.dto.request.InvoiceRequest;
import com.khachsan.quanlykhachsan.dto.request.InvoiceUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService service;

    @GetMapping("/tinh-tong-tien/{maThue}")
    public TongTienResponse tinhTongTien(@PathVariable String maThue) {
        return service.tinhTongTien(maThue);
    }

    @GetMapping
    public List<Invoice> timKiem(@RequestParam(defaultValue = "") String maHoaDon,
                                @RequestParam(defaultValue = "") String maKhachHang,
                                @RequestParam(defaultValue = "") String ngayLap) {
        return service.timKiem(maHoaDon, maKhachHang, ngayLap);
    }

    @GetMapping("/{maHoaDon}")
    public InvoiceDetailResponse layChiTiet(@PathVariable String maHoaDon) {
        return service.layChiTiet(maHoaDon);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceDetailResponse them(@Valid @RequestBody InvoiceRequest req) {
        return service.them(req);
    }

    @PutMapping("/{maHoaDon}")
    public InvoiceDetailResponse sua(@PathVariable String maHoaDon,
                                    @Valid @RequestBody InvoiceUpdateRequest req) {
        return service.sua(maHoaDon, req);
    }

    @DeleteMapping("/{maHoaDon}")
    public void xoa(@PathVariable String maHoaDon) {
        service.xoa(maHoaDon);
    }
}