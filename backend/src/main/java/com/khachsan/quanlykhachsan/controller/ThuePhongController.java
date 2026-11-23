package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.request.ThuePhongRequest;
import com.khachsan.quanlykhachsan.dto.response.ThuePhongResponse;
import com.khachsan.quanlykhachsan.service.ThuePhongService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thue-phong")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ThuePhongController {

    private final ThuePhongService thuePhongService;

    @GetMapping
    public List<ThuePhongResponse> layDSThuePhong() {
        return thuePhongService.layDanhSachThuePhong();
    }

    @GetMapping("/tinh-so-ngay")
    public Integer tinhSoNgay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngayNhan,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngayTra) {
        return thuePhongService.tinhSoNgayLuuTru(ngayNhan, ngayTra);
    }

    @GetMapping("/tim-theo-thoi-gian")
    public List<ThuePhongResponse> timTheoThoiGian(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngayBatDau,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngayKetThuc) {
        return thuePhongService.timTheoThoiGian(ngayBatDau, ngayKetThuc);
    }

    @PostMapping
    public ResponseEntity<Object> themThuePhong(@RequestBody ThuePhongRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(thuePhongService.taoPhieuThue(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{maThue}")
    public ResponseEntity<Object> suaThuePhong(
            @PathVariable String maThue,
            @RequestBody ThuePhongRequest request) {
        try {
            return ResponseEntity.ok(thuePhongService.capNhatPhieuThue(maThue, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{maThue}")
    public ResponseEntity<Object> xoaThuePhong(@PathVariable String maThue) {
        try {
            thuePhongService.xoaPhieuThue(maThue);
            return ResponseEntity.ok(Map.of("message", "Đã xóa phiếu thuê " + maThue));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}