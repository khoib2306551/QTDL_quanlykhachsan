package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.dto.response.phong.LoaiPhongFilterProjection;
import com.khachsan.quanlykhachsan.entity.LoaiPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface LoaiPhongRepository extends JpaRepository<LoaiPhong,String> {

    Optional<LoaiPhong> findByMaLoai(String maLoai);
    @Query(value = "CALL sp_LocLoaiPhong(:keyword, :giaTu, :giaDen, :chiConPhongTrong, :page, :size)", nativeQuery = true)
    List<LoaiPhongFilterProjection> filterLoaiPhongByProcedure(
            @Param("keyword") String keyword,
            @Param("giaTu") BigDecimal giaTu,
            @Param("giaDen") BigDecimal giaDen,
            @Param("chiConPhongTrong") Boolean chiConPhongTrong,
            @Param("page") int page,
            @Param("size") int size
    );
}
