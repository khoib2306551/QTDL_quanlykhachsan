package com.khachsan.quanlykhachsan.dto.response.phong;
import com.khachsan.quanlykhachsan.entity.Phong;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PhongListResponse {
    private String maPhong;
    private String soPhong;
    private String tenLoai;
    private BigDecimal giaPhong;
    private String trangThai;

    public static PhongListResponse fromEntity(Phong phong) {
        return PhongListResponse.builder()
                .maPhong(phong.getMaPhong())
                .soPhong(phong.getSoPhong())
                .tenLoai(phong.getLoaiPhong().getTenLoai())
                .giaPhong(phong.getLoaiPhong().getGiaPhong())
                .trangThai(phong.getTrangThai())
                .build();
    }
}