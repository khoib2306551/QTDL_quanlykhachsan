package com.khachsan.quanlykhachsan.dto.response.phong;

import com.khachsan.quanlykhachsan.dto.response.loaiphong.RoomTypeResponse;
import com.khachsan.quanlykhachsan.entity.Phong;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PhongDetailResponse {
    private String maPhong;
    private String soPhong;
    private String trangThai;
    private RoomTypeResponse loaiPhong;

    public static PhongDetailResponse fromEntity(Phong phong) {
        return PhongDetailResponse.builder()
                .maPhong(phong.getMaPhong())
                .soPhong(phong.getSoPhong())
                .trangThai(phong.getTrangThai())
                .loaiPhong(RoomTypeResponse.fromEntity(phong.getLoaiPhong()))
                .build();
    }
}