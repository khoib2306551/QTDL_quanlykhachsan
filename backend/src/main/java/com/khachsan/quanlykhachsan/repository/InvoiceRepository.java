package com.khachsan.quanlykhachsan.repository;

import java.util.List;
import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {

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
        SELECT hd.*
        FROM HoaDon hd
        LEFT JOIN SuDungDichVu sd ON sd.MaSDDV = hd.MaSDDV
        LEFT JOIN ThuePhong tp ON tp.MaThue = sd.MaThue
        WHERE (:maHoaDon = '' OR hd.MaHoaDon LIKE CONCAT('%', :maHoaDon, '%'))
        AND (:maKhachHang = '' OR tp.MaKhachHang LIKE CONCAT('%', :maKhachHang, '%'))
        AND (:ngayLap = '' OR CAST(hd.NgayLapHoaDon AS CHAR) = :ngayLap)
        ORDER BY hd.NgayLapHoaDon DESC, hd.MaHoaDon
        """, nativeQuery = true)
    List<Invoice> timKiem(@Param("maHoaDon") String maHoaDon,
                        @Param("maKhachHang") String maKhachHang,
                        @Param("ngayLap") String ngayLap);

    @Query(value = "SELECT MAX(CAST(SUBSTRING(MaHoaDon, 3) AS SIGNED)) FROM HoaDon", nativeQuery = true)
    Long layMaSoLonNhat();
}