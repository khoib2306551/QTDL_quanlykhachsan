package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NhanVienRepository extends JpaRepository<NhanVien,String> {
    Optional<NhanVien> getByTaiKhoan(String taiKhoan);
}
