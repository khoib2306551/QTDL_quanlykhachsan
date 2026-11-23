package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

/** REST API phục vụ tải các báo cáo Excel của hệ thống. */
@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
public class ExcelController {

    private static final MediaType XLSX_MEDIA_TYPE = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private final ExcelService excelService;

    /** GET /api/excel/xuat-phong */
    @GetMapping("/xuat-phong")
    public ResponseEntity<byte[]> xuatPhong() {
        return taoFileExcel(excelService.xuatDanhSachPhong(), "danh-sach-phong.xlsx");
    }

    /** GET /api/excel/xuat-thue-phong */
    @GetMapping("/xuat-thue-phong")
    public ResponseEntity<byte[]> xuatThuePhong() {
        return taoFileExcel(excelService.xuatDanhSachThuePhong(), "danh-sach-thue-phong.xlsx");
    }

    /** GET /api/excel/xuat-hoa-don */
    @GetMapping("/xuat-hoa-don")
    public ResponseEntity<byte[]> xuatHoaDon() {
        return taoFileExcel(excelService.xuatDanhSachHoaDon(), "danh-sach-hoa-don.xlsx");
    }

    /**
     * GET /api/excel/xuat-thong-ke?kieuThongKe=THANG&nam=2026
     * GET /api/excel/xuat-thong-ke?kieuThongKe=QUY&quy=4&nam=2026
     * GET /api/excel/xuat-thong-ke?tuNgay=2026-11-01&denNgay=2026-11-30
     */
    @GetMapping("/xuat-thong-ke")
    public ResponseEntity<byte[]> xuatThongKe(
            @RequestParam(required = false, defaultValue = "THANG") String kieuThongKe,
            @RequestParam(required = false) Integer nam,
            @RequestParam(required = false) Integer quy,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {

        byte[] file = excelService.xuatBaoCaoThongKe(kieuThongKe, nam, quy, tuNgay, denNgay);
        return taoFileExcel(file, "bao-cao-doanh-thu.xlsx");
    }

    private ResponseEntity<byte[]> taoFileExcel(byte[] file, String tenFile) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(XLSX_MEDIA_TYPE);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(tenFile, StandardCharsets.UTF_8)
                        .build()
        );
        headers.setContentLength(file.length);
        return new ResponseEntity<>(file, headers, HttpStatus.OK);
    }
}
