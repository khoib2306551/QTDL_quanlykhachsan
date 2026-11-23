package com.khachsan.quanlykhachsan.dto.request.phong;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PhongRequest {
    private String soPhong;
    private String maLoai;
    private String trangThai;
}
