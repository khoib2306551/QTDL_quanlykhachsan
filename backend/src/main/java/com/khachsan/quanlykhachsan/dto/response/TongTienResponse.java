package com.khachsan.quanlykhachsan.dto.response;

import java.math.BigDecimal;

public record TongTienResponse(String maThue, BigDecimal tienPhong, BigDecimal tienDichVu, BigDecimal tongTien) {
}