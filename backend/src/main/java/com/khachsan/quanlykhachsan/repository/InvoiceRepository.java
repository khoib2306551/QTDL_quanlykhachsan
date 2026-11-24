package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    Page<Invoice> findByMaHoaDonContainingIgnoreCase(String maHoaDon, Pageable pageable);

    boolean existsByMaSddv(String maSddv);

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
}