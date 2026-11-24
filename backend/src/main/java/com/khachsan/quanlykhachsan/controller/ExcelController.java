package com.khachsan.quanlykhachsan.controller;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.khachsan.quanlykhachsan.dto.request.ExcelImportRequest;
import com.khachsan.quanlykhachsan.dto.response.ExcelImportResponse;
import com.khachsan.quanlykhachsan.service.ExcelImportService;
import com.khachsan.quanlykhachsan.service.ExcelService;

import lombok.RequiredArgsConstructor;

/** REST API phục vụ tải báo cáo và nhập dữ liệu Excel. */
@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
public class ExcelController {

    private static final MediaType XLSX_MEDIA_TYPE = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private final ExcelService excelService;
    private final ExcelImportService excelImportService;

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

    /** POST /api/excel/doc-file (multipart/form-data, field: file). */
    @PostMapping(value = "/doc-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExcelImportResponse> docFile(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(excelImportService.docFile(file));
    }

    /** POST /api/excel/ghi-database (application/json). */
    @PostMapping(value = "/ghi-database", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ExcelImportResponse> ghiDatabase(@RequestBody ExcelImportRequest request) {
        ExcelImportResponse response = excelImportService.ghiDatabase(request);
        if (Boolean.FALSE.equals(response.getThanhCong())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.ok(response);
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
