package com.khachsan.quanlykhachsan.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.khachsan.quanlykhachsan.entity.invoice.ServiceUsage;
import com.khachsan.quanlykhachsan.repository.ServiceUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceUsageService {
    private final ServiceUsageRepository repo;

    public List<ServiceUsage> layDanhSach(String maThue) {
        if (maThue == null || maThue.isBlank()) {
            return repo.findAll();
        }
        return repo.findByMaThue(maThue);
    }

    public ServiceUsage layChiTiet(String maSddv) {
        return repo.findById(maSddv).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy SDDV " + maSddv));
    }

    public void xoa(String maSddv) {
        layChiTiet(maSddv);
        repo.deleteById(maSddv);
    }
}

