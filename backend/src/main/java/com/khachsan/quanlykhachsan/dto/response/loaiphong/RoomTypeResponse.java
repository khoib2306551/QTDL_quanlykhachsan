package com.khachsan.quanlykhachsan.dto.response.loaiphong;

import com.khachsan.quanlykhachsan.entity.LoaiPhong;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RoomTypeResponse {
    private String maLoai;
    private String tenLoai;
    private BigDecimal giaPhong;
    private String moTa;

    public static RoomTypeResponse fromEntity(LoaiPhong loaiPhong){
        return RoomTypeResponse.builder()
                .maLoai(loaiPhong.getMaLoai())
                .tenLoai(loaiPhong.getTenLoai())
                .giaPhong(loaiPhong.getGiaPhong())
                .moTa(loaiPhong.getMoTa())
                .build();
    }
}
