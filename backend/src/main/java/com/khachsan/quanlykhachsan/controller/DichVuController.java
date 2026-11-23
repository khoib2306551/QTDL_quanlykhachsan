package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.entity.DichVu;
import com.khachsan.quanlykhachsan.service.DichVuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dich-vu")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DichVuController {

    private final DichVuService dichVuService;

    @GetMapping
    public List<DichVu> layDSDichVu(
            @RequestParam(required = false, defaultValue = "") String tuKhoa) {
        return dichVuService.layDanhSach(tuKhoa);
    }

    @PostMapping
    public ResponseEntity<Object> themDichVu(@RequestBody DichVu dichVu) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(dichVuService.themDichVu(dichVu));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{maDV}")
    public ResponseEntity<Object> capNhatDichVu(
            @PathVariable String maDV,
            @RequestBody DichVu dichVu) {
        try {
            return ResponseEntity.ok(dichVuService.capNhatDichVu(maDV, dichVu));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{maDV}")
    public ResponseEntity<Object> xoaDichVu(@PathVariable String maDV) {
        try {
            dichVuService.xoaDichVu(maDV);
            return ResponseEntity.ok(Map.of("message", "Đã xóa dịch vụ " + maDV));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}