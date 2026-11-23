package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.ThuePhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ThuePhongRepository extends JpaRepository<ThuePhong, String> {

    // 1. Lấy danh sách thuê phòng kèm số ngày lưu trú từ SQL Function fn_TinhSoNgayLuuTru
    @Query(value = "SELECT " +
            "tp.MaThue, " +
            "kh.MaKhachHang, " +
            "kh.TenKhachHang, " +
            "kh.SoDienThoai, " +
            "p.MaPhong, " +
            "p.SoPhong, " +
            "lp.TenLoai, " +
            "lp.GiaPhong, " +
            "tp.NgayThue, " +
            "tp.NgayNhan, " +
            "tp.NgayTra, " +
            "fn_TinhSoNgayLuuTru(tp.NgayNhan, tp.NgayTra) AS SoNgayLuuTru, " +
            "tp.TrangThai " +
            "FROM ThuePhong tp " +
            "INNER JOIN KhachHang kh ON tp.MaKhachHang = kh.MaKhachHang " +
            "INNER JOIN Phong p ON tp.MaPhong = p.MaPhong " +
            "INNER JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai " +
            "ORDER BY tp.MaThue ASC", nativeQuery = true)
    List<Object[]> layDanhSachThuePhongKemSoNgay();

    // 2. Gọi trực tiếp SQL Function fn_TinhSoNgayLuuTru(p_NgayNhan, p_NgayTra)
    @Query(value = "SELECT fn_TinhSoNgayLuuTru(:ngayNhan, :ngayTra)", nativeQuery = true)
    Integer tinhSoNgayLuuTru(
            @Param("ngayNhan") LocalDate ngayNhan,
            @Param("ngayTra") LocalDate ngayTra
    );

    // 3. Gọi Stored Procedure sp_DanhSachDatPhongTheoThoiGian(p_NgayBatDau, p_NgayKetThuc)
    @Query(value = "CALL sp_DanhSachDatPhongTheoThoiGian(:ngayBatDau, :ngayKetThuc)", nativeQuery = true)
    List<Object[]> timTheoThoiGian(
            @Param("ngayBatDau") LocalDate ngayBatDau,
            @Param("ngayKetThuc") LocalDate ngayKetThuc
    );

    // 4. Lấy số thứ tự lớn nhất để tự sinh mã TP01, TP02...
    @Query(value = "SELECT MAX(CAST(SUBSTRING(MaThue, 3) AS UNSIGNED)) " +
            "FROM ThuePhong WHERE MaThue REGEXP '^TP[0-9]+$'", nativeQuery = true)
    Long layMaSoLonNhat();
}