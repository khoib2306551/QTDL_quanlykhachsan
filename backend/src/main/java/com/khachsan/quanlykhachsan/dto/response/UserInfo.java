package com.khachsan.quanlykhachsan.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String maNhanVien;
    private String hoTen;
    private String soDienThoai;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngaySinh;
}