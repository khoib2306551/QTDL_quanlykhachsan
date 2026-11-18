package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {

    @Query("SELECT kh FROM KhachHang kh WHERE " +
            ":tuKhoa IS NULL OR :tuKhoa = '' " +
            "OR LOWER(kh.maKhachHang) LIKE LOWER(CONCAT('%', :tuKhoa, '%')) " +
            "OR LOWER(kh.tenKhachHang) LIKE LOWER(CONCAT('%', :tuKhoa, '%')) " +
            "OR LOWER(kh.diaChi) LIKE LOWER(CONCAT('%', :tuKhoa, '%')) " +
            "OR LOWER(kh.soDienThoai) LIKE LOWER(CONCAT('%', :tuKhoa, '%'))")
    List<KhachHang> timKiemKhachHang(@Param("tuKhoa") String tuKhoa);
}