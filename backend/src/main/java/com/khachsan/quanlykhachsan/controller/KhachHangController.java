package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.entity.KhachHang;
import com.khachsan.quanlykhachsan.service.KhachHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/khach-hang")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KhachHangController {

    private final KhachHangService khachHangService;

    @GetMapping
    public List<KhachHang> layDSKhachHang(
            @RequestParam(required = false, defaultValue = "") String tuKhoa) {
        return khachHangService.layDanhSach(tuKhoa);
    }

    @PostMapping
    public ResponseEntity<Object> themKhachHang(@RequestBody KhachHang khachHang) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(khachHangService.themKhachHang(khachHang));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{maKH}")
    public ResponseEntity<Object> capNhatKhachHang(
            @PathVariable String maKH,
            @RequestBody KhachHang khachHang) {
        try {
            return ResponseEntity.ok(khachHangService.capNhatKhachHang(maKH, khachHang));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{maKH}")
    public ResponseEntity<Object> xoaKhachHang(@PathVariable String maKH) {
        try {
            khachHangService.xoaKhachHang(maKH);
            return ResponseEntity.ok(Map.of("message", "Đã xóa khách hàng " + maKH));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}