package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.config.security.CustomUserDetail;
import com.khachsan.quanlykhachsan.entity.NhanVien;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {
    private final NhanVienService nhanVienService;


    @Override
    public UserDetails loadUserByUsername(String tk) throws UsernameNotFoundException {
        NhanVien nhanVien = this.nhanVienService.getByTaiKhoan(tk);
        return new CustomUserDetail(nhanVien);
    }
}
