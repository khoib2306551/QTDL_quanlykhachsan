package com.khachsan.quanlykhachsan.repository;

import java.util.List;
import com.khachsan.quanlykhachsan.entity.SuDungDichVu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SuDungDichVuRepository extends JpaRepository<SuDungDichVu, String> {
    Page<SuDungDichVu> findByMaSDDVContainingIgnoreCase(String maSDDV, Pageable pageable);
    List<SuDungDichVu> findByThuePhong_MaThueOrderByNgaySuDungAsc(String maThue);
    @Query(value = "SELECT MAX(CAST(SUBSTRING(MaSDDV, 3) AS UNSIGNED)) " +
            "FROM SuDungDichVu WHERE MaSDDV REGEXP '^SD[0-9]+$'", nativeQuery = true)
    Long layMaSoLonNhat();
}