package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.dto.response.hoadon.HoaDonListResponse;
import com.khachsan.quanlykhachsan.entity.HoaDon;
import com.khachsan.quanlykhachsan.entity.SuDungDichVu;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final HoaDonRepository repo;

    public PageResponse<HoaDonListResponse> timKiem(String maHoaDon, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size,
                Sort.by(Sort.Order.desc("ngayLapHoaDon"), Sort.Order.asc("maHoaDon")));
        return PageResponse.from(
                repo.findByMaHoaDonContainingIgnoreCase(maHoaDon.trim(), pageable)
                        .map(this::toListResponse));
    }

    private HoaDonListResponse toListResponse(HoaDon hd) {
        SuDungDichVu sd = hd.getSuDungDichVu();
        BigDecimal tienPhong = sd == null ? null : repo.tinhTienPhong(sd.getThuePhong().getMaThue());
        return new HoaDonListResponse(
                hd.getMaHoaDon(),
                sd == null ? null : sd.getMaSDDV(),
                hd.getNgayLapHoaDon(),
                tienPhong,
                hd.getTongTien());
    }

    public void xoa(String maHoaDon) {
        HoaDon hd = repo.findById(maHoaDon).orElseThrow(() ->
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