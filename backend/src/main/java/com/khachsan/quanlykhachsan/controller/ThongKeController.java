package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.response.ChiSoTongHopResponse;
import com.khachsan.quanlykhachsan.dto.response.ThongKeResponse;
import com.khachsan.quanlykhachsan.service.ThongKeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * REST API phục vụ chức năng thống kê doanh thu.
 * Tất cả endpoint được bảo vệ bởi cơ chế JWT hiện có của dự án.
 */
@RestController
@RequestMapping("/api/thong-ke")
@RequiredArgsConstructor
public class ThongKeController {

    private final ThongKeService thongKeService;

    /**
     * GET /api/thong-ke/doanh-thu?kieuThongKe=THANG&nam=2026
     *
     * Các kiểu hỗ trợ: NGAY, TUAN, THANG, QUY, NAM.
     */
    @GetMapping("/doanh-thu")
    public List<ThongKeResponse> thongKeDoanhThu(
            @RequestParam String kieuThongKe,
            @RequestParam Integer nam) {
        return thongKeService.thongKeDoanhThu(kieuThongKe, nam);
    }

    /**
     * GET /api/thong-ke/tu-ngay-den-ngay?tuNgay=2026-11-01&denNgay=2026-11-30
     */
    @GetMapping("/tu-ngay-den-ngay")
    public List<ThongKeResponse> thongKeTuNgayDenNgay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        return thongKeService.thongKeTuNgayDenNgay(tuNgay, denNgay);
    }

    /**
     * GET /api/thong-ke/theo-quy?quy=4&nam=2026
     * Trả về một đối tượng thống kê của riêng quý được chọn.
     */
    @GetMapping("/theo-quy")
    public ThongKeResponse thongKeTheoQuy(
            @RequestParam Integer quy,
            @RequestParam Integer nam) {
        return thongKeService.thongKeTheoQuy(quy, nam);
    }

    /**
     * GET /api/thong-ke/chi-so-tong-hop?tuNgay=2026-11-01&denNgay=2026-11-30
     *
     * Khoảng ngày bao gồm cả ngày bắt đầu và ngày kết thúc.
     */
    @GetMapping("/chi-so-tong-hop")
    public ChiSoTongHopResponse layChiSoTongHop(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        return thongKeService.layChiSoTongHop(tuNgay, denNgay);
    }
}
