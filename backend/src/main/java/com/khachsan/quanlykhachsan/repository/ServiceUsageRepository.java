package com.khachsan.quanlykhachsan.repository;

import org.springframework.data.jpa.repository.Query;
import com.khachsan.quanlykhachsan.entity.invoice.ServiceUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceUsageRepository extends JpaRepository<ServiceUsage, String> {
    List<ServiceUsage> findByMaThue(String maThue);
    @Query(value = "SELECT MAX(CAST(SUBSTRING(MaSDDV, 3) AS SIGNED)) FROM SuDungDichVu", nativeQuery = true)
    Long layMaSoLonNhat();
}