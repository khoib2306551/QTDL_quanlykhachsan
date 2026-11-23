package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.request.ServiceUsageRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.khachsan.quanlykhachsan.entity.invoice.ServiceUsage;
import com.khachsan.quanlykhachsan.repository.ServiceUsageRepository;
import com.khachsan.quanlykhachsan.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceUsageService {
    private final ServiceUsageRepository repo;
    private final InvoiceRepository invoiceRepo;

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
        if (invoiceRepo.existsByMaSddv(maSddv)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SDDV " + maSddv + " đang gắn với một hóa đơn");
        }
        repo.deleteById(maSddv);
    }
    
    public ServiceUsage them(ServiceUsageRequest req) {
        Long max = repo.layMaSoLonNhat();
        ServiceUsage s = new ServiceUsage();
        s.setMaSddv(String.format("SD%02d", (max == null ? 0 : max) + 1));
        s.setMaThue(req.getMaThue());
        s.setMaDichVu(req.getMaDichVu());
        s.setSoLuong(req.getSoLuong());
        s.setNgaySuDung(req.getNgaySuDung());
        return luu(s);
    }

    public ServiceUsage sua(String maSddv, ServiceUsageRequest req) {
        ServiceUsage s = layChiTiet(maSddv);
        s.setMaDichVu(req.getMaDichVu());
        s.setSoLuong(req.getSoLuong());
        s.setNgaySuDung(req.getNgaySuDung());
        return luu(s);
    }

    private ServiceUsage luu(ServiceUsage s) {
        try {
            return repo.saveAndFlush(s);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã thuê hoặc mã dịch vụ không tồn tại");
        }
    }
}

