package com.khachsan.quanlykhachsan.dto.response.phong;
import java.math.BigDecimal;

public interface LoaiPhongFilterProjection {
    String getMaLoai();
    String getTenLoai();
    BigDecimal getGiaPhong();
    String getMoTa();
    Long getTongSoPhong();
    Long getSoPhongTrong();
    Long getTotalElements();
}