package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.config.security.CustomUserDetail;
import com.khachsan.quanlykhachsan.config.security.JwtUtil;
import com.khachsan.quanlykhachsan.dto.request.auth.LoginRequest;
import com.khachsan.quanlykhachsan.dto.request.auth.RegisterRequest;
import com.khachsan.quanlykhachsan.dto.response.auth.AuthResponse;
import com.khachsan.quanlykhachsan.dto.response.auth.UserInfo;
import com.khachsan.quanlykhachsan.entity.NhanVien;
import com.khachsan.quanlykhachsan.exception.AuthException;
import org.springframework.security.core.AuthenticationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final NhanVienService nhanVienService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    public AuthResponse register(RegisterRequest request){

        if (request.getTaiKhoan() == null || request.getTaiKhoan().isBlank()
                || request.getMatKhau() == null || request.getMatKhau().isBlank()
                || request.getHoTen() == null || request.getHoTen().isBlank()|| request.getXacNhanMk() ==null || request.getXacNhanMk().isBlank()) {
            throw new AuthException("Invalid info");
        }

        if(!request.getMatKhau().equals(request.getXacNhanMk())){
            throw new AuthException("Confirm password not correct");
        }
       NhanVien saved = this.nhanVienService.createNhanVien(request.getHoTen(),request.getTaiKhoan(),request.getMatKhau(),request.getNgaySinh(), request.getSoDienThoai());
        String token = this.jwtUtil.generateAccessToken(saved.getTaiKhoan());
        return AuthResponse.builder()
                .userInfo(UserInfo.builder()
                        .taiKhoan(saved.getTaiKhoan())
                        .maNhanVien(saved.getMaNhanVien())
                        .hoTen(saved.getHoTen())
                        .soDienThoai(saved.getSoDienThoai())
                        .ngaySinh(saved.getNgaySinh())
                        .build())
                .token(token)
                .build();
    }


    public AuthResponse login(LoginRequest request){
        if (request.getTaiKhoan() == null || request.getTaiKhoan().isBlank()
                || request.getMatKhau() ==null|| request.getMatKhau().isBlank()
        ){
            throw new AuthException("Vui lòng nhập đầy thủ thông tin");
        }
        Authentication authentication;
        try{
             authentication = this.authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getTaiKhoan(), request.getMatKhau()));
        }
        catch (AuthenticationException e) {
            throw new AuthException("Tài khoản hoặc mật khẩu không chính xác");
        }
        CustomUserDetail userDetail  = (CustomUserDetail)authentication.getPrincipal();
        String token = this.jwtUtil.generateAccessToken(userDetail.getUsername());
        return AuthResponse.builder()
                .userInfo(UserInfo.builder()
                        .taiKhoan(userDetail.getUsername())
                        .maNhanVien(userDetail.getId())
                        .hoTen(userDetail.getFullName())
                        .soDienThoai(userDetail.getPhone())
                        .ngaySinh(userDetail.getBirthDay())
                        .build())
                .token(token)
                .build();
    }


}
