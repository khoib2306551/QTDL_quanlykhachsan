package com.khachsan.quanlykhachsan.dto.request.loaiphong;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomTypeRequest {
    private String tenLoai;
    private BigDecimal giaPhong;

}
