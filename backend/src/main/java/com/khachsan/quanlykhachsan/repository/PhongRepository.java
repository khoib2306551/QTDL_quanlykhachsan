package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhongRepository extends JpaRepository<Phong, String> {

    Optional<Phong> findByMaPhong(String maPhong);

    Optional<Phong> findBySoPhong(String soPhong);
    boolean existsByLoaiPhong_MaLoai(String maLoai);
}
