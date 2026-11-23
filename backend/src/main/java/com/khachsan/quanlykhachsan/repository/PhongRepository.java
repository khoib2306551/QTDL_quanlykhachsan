package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhongRepository extends JpaRepository<Phong, String> {
}