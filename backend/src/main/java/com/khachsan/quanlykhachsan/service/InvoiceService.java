package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.response.InvoiceDetailResponse;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import com.khachsan.quanlykhachsan.entity.invoice.ServiceUsage;
import com.khachsan.quanlykhachsan.repository.InvoiceRepository;
import com.khachsan.quanlykhachsan.repository.ServiceUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final ServiceUsageRepository usageRepo;
    private final InvoiceRepository repo;

    public TongTienResponse tinhTongTien(String maThue) {
        BigDecimal tienPhong = repo.tinhTienPhong(maThue);
        if (tienPhong == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiếu thuê " + maThue);
        }
        BigDecimal tienDichVu = repo.tinhTienDichVu(maThue);
        return new TongTienResponse(maThue, tienPhong, tienDichVu, tienPhong.add(tienDichVu));
    }

    public List<Invoice> timKiem(String maHoaDon, String maKhachHang, String ngayLap) {
        return repo.timKiem(maHoaDon.trim(), maKhachHang.trim(), ngayLap.trim());
    }

    public InvoiceDetailResponse layChiTiet(String maHoaDon) {
        Invoice hd = repo.findById(maHoaDon).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn " + maHoaDon));

        String maThue = null;
        List<ServiceUsage> dsDichVu = List.of();
        if (hd.getMaSddv() != null) {
            ServiceUsage sd = usageRepo.findById(hd.getMaSddv()).orElse(null);
            if (sd != null) {
                maThue = sd.getMaThue();
                dsDichVu = usageRepo.findByMaThue(maThue);
            }
        }
        return new InvoiceDetailResponse(hd.getMaHoaDon(), hd.getMaSddv(), maThue,
                hd.getNgayLapHoaDon(), hd.getTongTien(), dsDichVu);
    }
}