package com.khachsan.quanlykhachsan.dto.response;

import com.khachsan.quanlykhachsan.entity.invoice.ServiceUsage;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InvoiceDetailResponse(
        String maHoaDon,
        String maSddv,
        String maThue,
        LocalDate ngayLapHoaDon,
        BigDecimal tongTien,
        List<ServiceUsage> danhSachDichVu) {
}