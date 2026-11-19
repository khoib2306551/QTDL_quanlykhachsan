package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.entity.invoice.Invoice;
import java.util.List;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InvoiceService {
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
}