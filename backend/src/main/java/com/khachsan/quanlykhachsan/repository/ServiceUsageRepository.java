package com.khachsan.quanlykhachsan.repository;

import com.khachsan.quanlykhachsan.entity.invoice.ServiceUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceUsageRepository extends JpaRepository<ServiceUsage, String> {
    List<ServiceUsage> findByMaThue(String maThue);
}