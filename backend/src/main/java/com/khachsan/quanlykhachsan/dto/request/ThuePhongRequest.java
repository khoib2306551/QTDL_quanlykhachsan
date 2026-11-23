package com.khachsan.quanlykhachsan.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuePhongRequest {
    private String maThue;
    private String maKhachHang;
    private String maPhong;
    private LocalDate ngayThue;
    private LocalDate ngayNhan;
    private LocalDate ngayTra;
    private String trangThai;
}