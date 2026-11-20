package com.khachsan.quanlykhachsan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.Date;

@Data
public class RegisterRequest {
    @NotBlank(message = "Account is required")
    private String taiKhoan;

    @NotBlank(message = "Password is required")
    private String matKhau;

    @NotBlank(message = "Confirm password is required")
    private String xacNhanMk;

    @NotBlank(message = "Name is required")
    private String hoTen;

    private LocalDate ngaySinh;

    private String soDienThoai;
}
