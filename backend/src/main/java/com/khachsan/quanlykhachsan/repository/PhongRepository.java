package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface PhongRepository extends JpaRepository<Phong, String> {

    Optional<Phong> findByMaPhong(String maPhong);

    Optional<Phong> findBySoPhong(String soPhong);
    boolean existsByLoaiPhong_MaLoai(String maLoai);
}
