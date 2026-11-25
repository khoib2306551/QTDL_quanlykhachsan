package com.khachsan.quanlykhachsan.dto.response.loaiphong;

import com.khachsan.quanlykhachsan.entity.LoaiPhong;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    private String maLoai;
    private String tenLoai;
    private BigDecimal giaPhong;
    private String moTa;
    private Long tongSoPhong;
    private Long soPhongTrong;

    public static RoomTypeResponse fromEntity(LoaiPhong loaiPhong) {
        return RoomTypeResponse.builder()
                .maLoai(loaiPhong.getMaLoai())
                .tenLoai(loaiPhong.getTenLoai())
                .giaPhong(loaiPhong.getGiaPhong())
                .moTa(loaiPhong.getMoTa())
                .build();
    }
}
