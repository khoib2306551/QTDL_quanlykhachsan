package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.dto.response.phong.PhongFilterProjection;
import com.khachsan.quanlykhachsan.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
@Repository
public interface PhongRepository extends JpaRepository<Phong, String> {

    Optional<Phong> findByMaPhong(String maPhong);

    Optional<Phong> findBySoPhong(String soPhong);
    boolean existsByLoaiPhong_MaLoai(String maLoai);

    @Query(value = "CALL sp_TimKiemPhong(:keyword, :maLoai, :trangThai, :giaTu, :giaDen, :page, :size)", nativeQuery = true)
    List<PhongFilterProjection> timKiemPhongByProcedure(
            @Param("keyword") String keyword,
            @Param("maLoai") String maLoai,
            @Param("trangThai") String trangThai,
            @Param("giaTu") BigDecimal giaTu,
            @Param("giaDen") BigDecimal giaDen,
            @Param("page") int page,
            @Param("size") int size
    );
}
