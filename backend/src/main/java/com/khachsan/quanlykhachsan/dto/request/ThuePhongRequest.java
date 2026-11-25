package com.khachsan.quanlykhachsan.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ThuePhongRequest {
    private String maThue;
    private String maKhachHang;
    private String maPhong;
    private LocalDate ngayThue;
    private LocalDate ngayNhan;
    private LocalDate ngayTra;
    private String trangThai;
}