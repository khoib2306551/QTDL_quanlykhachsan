package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository repo;

    public PageResponse<Invoice> timKiem(String maHoaDon, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size,
                Sort.by(Sort.Order.desc("ngayLapHoaDon"), Sort.Order.asc("maHoaDon")));
        return PageResponse.from(repo.findByMaHoaDonContainingIgnoreCase(maHoaDon.trim(), pageable));
    }

    public void xoa(String maHoaDon) {
        Invoice hd = repo.findById(maHoaDon).orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy hóa đơn " + maHoaDon));
        repo.delete(hd);
    }

    public TongTienResponse tinhTongTien(String maThue) {
        BigDecimal tienPhong = repo.tinhTienPhong(maThue);
        if (tienPhong == null) {
            throw new ResourceNotFoundException("Không tìm thấy phiếu thuê " + maThue);
        }
        BigDecimal tienDichVu = repo.tinhTienDichVu(maThue);
        return new TongTienResponse(maThue, tienPhong, tienDichVu, tienPhong.add(tienDichVu));
    }
}