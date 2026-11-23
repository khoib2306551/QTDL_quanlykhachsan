package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ThongKeRepository extends JpaRepository<Invoice, String> {

    @Query(value = "CALL sp_ThongKeDoanhThu(:kieuThongKe, :nam)", nativeQuery = true)
    List<Object[]> thongKeDoanhThu(
            @Param("kieuThongKe") String kieuThongKe,
            @Param("nam") Integer nam
    );

    @Query(value = """
            SELECT
                hd.NgayLapHoaDon AS MocThoiGian,
                COUNT(hd.MaHoaDon) AS SoLuongHoaDon,
                MAX(hd.TongTien) AS HoaDonCaoNhat,
                MIN(hd.TongTien) AS HoaDonThapNhat,
                ROUND(AVG(hd.TongTien), 2) AS TrungBinhHoaDon,
                COALESCE(SUM(hd.TongTien), 0) AS TongDoanhThu
            FROM HoaDon hd
            WHERE hd.NgayLapHoaDon >= :tuNgay
              AND hd.NgayLapHoaDon <= :denNgay
            GROUP BY hd.NgayLapHoaDon
            ORDER BY hd.NgayLapHoaDon ASC
            """, nativeQuery = true)
    List<Object[]> thongKeTuNgayDenNgay(
            @Param("tuNgay") LocalDate tuNgay,
            @Param("denNgay") LocalDate denNgay
    );

    @Query(value = """
            SELECT
                COUNT(hd.MaHoaDon) AS SoLuongHoaDon,
                COALESCE(MAX(hd.TongTien), 0) AS HoaDonCaoNhat,
                COALESCE(MIN(hd.TongTien), 0) AS HoaDonThapNhat,
                COALESCE(ROUND(AVG(hd.TongTien), 2), 0) AS TrungBinhHoaDon,
                COALESCE(SUM(hd.TongTien), 0) AS TongDoanhThu
            FROM HoaDon hd
            WHERE hd.NgayLapHoaDon >= :tuNgay
              AND hd.NgayLapHoaDon <= :denNgay
            """, nativeQuery = true)
    List<Object[]> layChiSoTongHop(
            @Param("tuNgay") LocalDate tuNgay,
            @Param("denNgay") LocalDate denNgay
    );
}
