package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.DichVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DichVuRepository extends JpaRepository<DichVu, String> {

    @Query("SELECT dv FROM DichVu dv WHERE " +
            ":tuKhoa IS NULL OR :tuKhoa = '' " +
            "OR LOWER(dv.maDichVu) LIKE LOWER(CONCAT('%', :tuKhoa, '%')) " +
            "OR LOWER(dv.tenDichVu) LIKE LOWER(CONCAT('%', :tuKhoa, '%'))")
    List<DichVu> timKiemDichVu(@Param("tuKhoa") String tuKhoa);

    @Query(value = "SELECT MAX(CAST(SUBSTRING(MaDichVu, 3) AS UNSIGNED)) " +
            "FROM DichVu WHERE MaDichVu REGEXP '^DV[0-9]+$'", nativeQuery = true)
    Long layMaSoLonNhat();
}