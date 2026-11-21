package com.khachsan.quanlykhachsan.dto.request.loaiphong;

import jakarta.validation.constraints.Size;
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
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String moTa;

}
