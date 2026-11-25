package com.khachsan.quanlykhachsan.dto.response.phong;

import java.math.BigDecimal;

public interface PhongFilterProjection {
    String getMaPhong();
    String getSoPhong();
    String getTenLoai();
    BigDecimal getGiaPhong();
    String getTrangThai();
    Long getTotalElements();
}