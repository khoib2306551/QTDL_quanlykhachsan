package com.khachsan.quanlykhachsan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuePhongResponse {
    private String maThue;
    private String maKhachHang;
    private String tenKhachHang;
    private String soDienThoai;
    private String maPhong;
    private String soPhong;
    private String tenLoai;
    private BigDecimal giaPhong;
    private LocalDate ngayThue;
    private LocalDate ngayNhan;
    private LocalDate ngayTra;
    private Integer soNgayLuuTru;
    private String trangThai;
}