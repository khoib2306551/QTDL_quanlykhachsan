package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.LoaiPhong;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoaiPhongRepository extends JpaRepository<LoaiPhong,String> {

    Optional<LoaiPhong> findByMaLoai(String maLoai);
}
