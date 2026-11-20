package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.NhanVien;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NhanVienRepository extends JpaRepository<NhanVien,String> {
    Optional<NhanVien> getByTaiKhoan(String taiKhoan);

    boolean existsByTaiKhoan(String taiKhoan);

    @Query("""
        SELECT nv FROM NhanVien nv
        WHERE (:keyword IS NULL OR :keyword = ''
            OR LOWER(nv.maNhanVien) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(nv.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(nv.taiKhoan) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR nv.soDienThoai LIKE CONCAT('%', :keyword, '%'))
    """)
    Page<NhanVien> searchNhanVien(@Param("keyword") String keyword, Pageable pageable);

}
