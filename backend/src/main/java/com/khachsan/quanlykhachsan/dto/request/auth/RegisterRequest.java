package com.khachsan.quanlykhachsan.dto.request.auth;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    @NotBlank(message = "Tài khoản không được để trống")
    private String taiKhoan;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String matKhau;

    @NotBlank(message = "Confirm password is required")
    private String xacNhanMk;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngaySinh;

    @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự")
    private String soDienThoai;
}