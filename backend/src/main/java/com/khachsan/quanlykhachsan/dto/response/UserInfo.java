package com.khachsan.quanlykhachsan.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.khachsan.quanlykhachsan.entity.NhanVien;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String taiKhoan;
    private String maNhanVien;
    private String hoTen;
    private String soDienThoai;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngaySinh;

    public static UserInfo fromEntity(NhanVien nv) {
        return UserInfo.builder()
                .maNhanVien(nv.getMaNhanVien())
                .hoTen(nv.getHoTen())
                .soDienThoai(nv.getSoDienThoai())
                .ngaySinh(nv.getNgaySinh())
                .taiKhoan(nv.getTaiKhoan())
                .build();
    }
}