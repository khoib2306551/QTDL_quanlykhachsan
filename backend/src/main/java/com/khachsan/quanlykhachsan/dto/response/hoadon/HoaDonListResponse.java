package com.khachsan.quanlykhachsan.dto.response.hoadon;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HoaDonListResponse(
        String maHoaDon,
        String maSddv,
        String maThue,
        String tenKhachHang,
        String soPhong,
        Integer soNgay,
        LocalDate ngayLapHoaDon,
        BigDecimal tienPhong,
        BigDecimal tienDichVu,
        BigDecimal tongTien,
        String maNhanVien) {
}