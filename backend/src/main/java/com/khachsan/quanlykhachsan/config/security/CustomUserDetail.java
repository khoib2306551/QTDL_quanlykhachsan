package com.khachsan.quanlykhachsan.config.security;

import com.khachsan.quanlykhachsan.entity.NhanVien;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class CustomUserDetail implements UserDetails {
    private final NhanVien user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("NhanVien"));
    }

    public String getRole(){
        return  "NhanVien";
    }
    @Override
    public @Nullable String getPassword() {
        return this.user.getMatKhau();
    }

    @Override
    public String getUsername() {
        return this.user.getTaiKhoan();
    }


    public String getId(){
        return this.user.getMaNhanVien();
    }

    public String getFullName(){
        return this.user.getHoTen();
    }

    public String getPhone(){
        return this.user.getSoDienThoai();
    }

}
