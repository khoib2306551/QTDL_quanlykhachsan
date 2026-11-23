package com.khachsan.quanlykhachsan.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import com.khachsan.quanlykhachsan.dto.request.ServiceUsageRequest;
import com.khachsan.quanlykhachsan.entity.invoice.ServiceUsage;
import com.khachsan.quanlykhachsan.service.ServiceUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/su-dung-dich-vu")
@RequiredArgsConstructor
public class ServiceUsageController {
    private final ServiceUsageService service;

    @GetMapping
    public List<ServiceUsage> layDanhSach(@RequestParam(defaultValue = "") String maThue) {
        return service.layDanhSach(maThue);
    }

    @GetMapping("/{maSddv}")
    public ServiceUsage layChiTiet(@PathVariable String maSddv) {
        return service.layChiTiet(maSddv);
    }

    @DeleteMapping("/{maSddv}")
    public void xoa(@PathVariable String maSddv) {
        service.xoa(maSddv);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceUsage them(@Valid @RequestBody ServiceUsageRequest req) {
        return service.them(req);
    }

    @PutMapping("/{maSddv}")
    public ServiceUsage sua(@PathVariable String maSddv, @Valid @RequestBody ServiceUsageRequest req) {
        return service.sua(maSddv, req);
    }
}