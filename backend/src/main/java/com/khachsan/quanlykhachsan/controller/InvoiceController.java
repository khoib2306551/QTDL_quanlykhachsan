package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService service;

    @GetMapping("/tinh-tong-tien/{maThue}")
    public TongTienResponse tinhTongTien(@PathVariable String maThue) {
        return service.tinhTongTien(maThue);
    }
}