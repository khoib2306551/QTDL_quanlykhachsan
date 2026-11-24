package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.SuDungDichVu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuDungDichVuRepository extends JpaRepository<SuDungDichVu, String> {
    Page<SuDungDichVu> findByMaSDDVContainingIgnoreCase(String maSDDV, Pageable pageable);
}