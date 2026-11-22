package com.khachsan.quanlykhachsan.dto.request.phong;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PhongUpdateRequest {
    private String soPhong;
    private String maLoai;
    private String trangThai;
}
