package com.khachsan.quanlykhachsan.dto.response.hoadon;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HoaDonListResponse(
        String maHoaDon,
        String maSddv,
        LocalDate ngayLapHoaDon,
        BigDecimal tienPhong,
        BigDecimal tongTien) {
}