package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.config.security.CustomUserDetail;
import com.khachsan.quanlykhachsan.config.security.JwtUtil;
import com.khachsan.quanlykhachsan.dto.request.LoginRequest;
import com.khachsan.quanlykhachsan.dto.request.RegisterRequest;
import com.khachsan.quanlykhachsan.dto.response.AuthResponse;
import com.khachsan.quanlykhachsan.dto.response.UserInfo;
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

import java.util.UUID;

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
        if(this.nhanVienService.existsByTaiKhoan(request.getTaiKhoan())){
            throw new AuthException("Tên đăng nhập đã tồn tại ");
        }
        String shortUuid = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        NhanVien nhanVien = NhanVien.builder()
                .maNhanVien(shortUuid)
                .taiKhoan(request.getTaiKhoan())
                .matKhau(passwordEncoder.encode(request.getMatKhau()))
                .hoTen(request.getHoTen())
                .ngaySinh(request.getNgaySinh())
                .soDienThoai(request.getSoDienThoai())
                .build();

        if(request.getNgaySinh()!=null){
            nhanVien.setNgaySinh(request.getNgaySinh());
        }
        if(request.getSoDienThoai()!=null){
            nhanVien.setSoDienThoai(request.getSoDienThoai());
        }
       NhanVien saved = this.nhanVienService.save(nhanVien);
        String token = this.jwtUtil.generateAccessToken(saved.getMaNhanVien());
        return AuthResponse.builder()
                .userInfo(UserInfo.builder()
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
        String token = this.jwtUtil.generateAccessToken(userDetail.getId());
        return AuthResponse.builder()
                .userInfo(UserInfo.builder()
                        .maNhanVien(userDetail.getId())
                        .hoTen(userDetail.getFullName())
                        .soDienThoai(userDetail.getPhone())
                        .ngaySinh(userDetail.getBirthDay())
                        .build())
                .token(token)
                .build();
    }
}
