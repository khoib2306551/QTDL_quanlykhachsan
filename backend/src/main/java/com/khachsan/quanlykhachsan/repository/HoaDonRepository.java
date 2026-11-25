package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.HoaDon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;

public interface HoaDonRepository extends JpaRepository<HoaDon, String> {

    interface ChiPhiThue {
        Integer getSoNgay();
        BigDecimal getGiaPhong();
        BigDecimal getTienDichVu();
    }

    @Query(value = """
        SELECT fn_TinhSoNgayLuuTru(tp.NgayNhan, tp.NgayTra) AS soNgay,
               lp.GiaPhong AS giaPhong,
               (SELECT IFNULL(SUM(s.SoLuong * dv.GiaDichVu), 0)
                  FROM SuDungDichVu s
                  JOIN DichVu dv ON dv.MaDichVu = s.MaDichVu
                 WHERE s.MaThue = tp.MaThue) AS tienDichVu
        FROM ThuePhong tp
        JOIN Phong p ON p.MaPhong = tp.MaPhong
        JOIN LoaiPhong lp ON lp.MaLoai = p.MaLoai
        WHERE tp.MaThue = :maThue
        """, nativeQuery = true)
    ChiPhiThue layChiPhiThue(@Param("maThue") String maThue);

    @Query(value = "SELECT MAX(CAST(SUBSTRING(MaHoaDon, 3) AS UNSIGNED)) " +
            "FROM HoaDon WHERE MaHoaDon REGEXP '^HD[0-9]+$'", nativeQuery = true)
    Long layMaSoLonNhat();

    Page<HoaDon> findByMaHoaDonContainingIgnoreCase(String maHoaDon, Pageable pageable);
    @Query("""
        SELECT h FROM HoaDon h
        WHERE LOWER(h.maHoaDon) LIKE LOWER(CONCAT('%', :maHoaDon, '%'))
          AND (:tuNgay IS NULL OR h.ngayLapHoaDon >= :tuNgay)
          AND (:denNgay IS NULL OR h.ngayLapHoaDon <= :denNgay)
        """)
    Page<HoaDon> timKiemNangCao(@Param("maHoaDon") String maHoaDon,
                                @Param("tuNgay") LocalDate tuNgay,
                                @Param("denNgay") LocalDate denNgay,
                                Pageable pageable);

    @Query(value = """
        SELECT fn_TinhSoNgayLuuTru(tp.NgayNhan, tp.NgayTra) * lp.GiaPhong
        FROM ThuePhong tp
        JOIN Phong p ON p.MaPhong = tp.MaPhong
        JOIN LoaiPhong lp ON lp.MaLoai = p.MaLoai
        WHERE tp.MaThue = :maThue
        """, nativeQuery = true)
    BigDecimal tinhTienPhong(@Param("maThue") String maThue);

    @Query(value = """
        SELECT IFNULL(SUM(s.SoLuong * dv.GiaDichVu), 0)
        FROM SuDungDichVu s
        JOIN DichVu dv ON dv.MaDichVu = s.MaDichVu
        WHERE s.MaThue = :maThue
        """, nativeQuery = true)
    BigDecimal tinhTienDichVu(@Param("maThue") String maThue);

    @Query(value = """
        SELECT COUNT(*)
        FROM HoaDon hd
        JOIN SuDungDichVu sd ON sd.MaSDDV = hd.MaSDDV
        WHERE sd.MaThue = :maThue
        """, nativeQuery = true)
    long demHoaDonCuaPhieuThue(@Param("maThue") String maThue);
}