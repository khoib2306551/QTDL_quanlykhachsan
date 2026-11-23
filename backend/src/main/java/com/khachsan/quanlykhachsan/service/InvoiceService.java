package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.response.InvoiceDetailResponse;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import com.khachsan.quanlykhachsan.entity.invoice.ServiceUsage;
import com.khachsan.quanlykhachsan.repository.InvoiceRepository;
import com.khachsan.quanlykhachsan.repository.ServiceUsageRepository;
import com.khachsan.quanlykhachsan.dto.request.InvoiceRequest;
import com.khachsan.quanlykhachsan.dto.request.InvoiceUpdateRequest;
import org.springframework.dao.DataIntegrityViolationException;
import java.time.LocalDate;
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

    public InvoiceDetailResponse them(InvoiceRequest req) {
        ServiceUsage sd = usageRepo.findById(req.getMaSddv()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã SDDV không tồn tại: " + req.getMaSddv()));

        Long max = repo.layMaSoLonNhat();
        Invoice hd = new Invoice();
        hd.setMaHoaDon(String.format("HD%02d", (max == null ? 0 : max) + 1));
        hd.setMaSddv(req.getMaSddv());
        hd.setNgayLapHoaDon(req.getNgayLapHoaDon() != null ? req.getNgayLapHoaDon() : LocalDate.now());
        hd.setTongTien(tinhTongTien(sd.getMaThue()).tongTien());

        try {
            repo.saveAndFlush(hd);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu hóa đơn không hợp lệ");
        }
        return layChiTiet(hd.getMaHoaDon());
    }

    public InvoiceDetailResponse sua(String maHoaDon, InvoiceUpdateRequest req) {
        Invoice hd = repo.findById(maHoaDon).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn " + maHoaDon));

        if (req.getNgayLapHoaDon() != null) {
            hd.setNgayLapHoaDon(req.getNgayLapHoaDon());
        }
        if (req.getMaSddv() != null && !req.getMaSddv().isBlank()) {
            ServiceUsage sd = usageRepo.findById(req.getMaSddv()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã SDDV không tồn tại: " + req.getMaSddv()));
            hd.setMaSddv(req.getMaSddv());
            hd.setTongTien(tinhTongTien(sd.getMaThue()).tongTien());
        }
        if (req.getTongTien() != null) {
            hd.setTongTien(req.getTongTien());
        }
        repo.saveAndFlush(hd);
        return layChiTiet(maHoaDon);
    }

    public void xoa(String maHoaDon) {
        if (!repo.existsById(maHoaDon)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn " + maHoaDon);
        }
        repo.deleteById(maHoaDon);
    }
}