package com.khachsan.quanlykhachsan.dto.response.sddv;

import com.khachsan.quanlykhachsan.entity.SuDungDichVu;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SuDungDichVuListResponse(
        String maSddv,
        String maThue,
        String soPhong,
        String maDichVu,
        String tenDichVu,
        int soLuong,
        BigDecimal donGia,
        BigDecimal thanhTien,
        LocalDate ngaySuDung) {

    public static SuDungDichVuListResponse fromEntity(SuDungDichVu s) {
        
        BigDecimal donGia = s.getDichVu().getGiaDichVu();
        int soLuong = s.getSoLuong();
        return new SuDungDichVuListResponse(
                s.getMaSDDV(),
                s.getThuePhong().getMaThue(),
                s.getThuePhong().getPhong().getSoPhong(),
                s.getDichVu().getMaDichVu(),
                s.getDichVu().getTenDichVu(),
                soLuong,
                donGia,
                donGia.multiply(BigDecimal.valueOf(soLuong)),
                s.getNgaySuDung());
    }
}