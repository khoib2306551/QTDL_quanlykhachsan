package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.response.sddv.SuDungDichVuListResponse;
import com.khachsan.quanlykhachsan.entity.SuDungDichVu;
import com.khachsan.quanlykhachsan.exception.BusinessException;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.HoaDonRepository;
import com.khachsan.quanlykhachsan.repository.SuDungDichVuRepository;
import com.khachsan.quanlykhachsan.entity.DichVu;
import com.khachsan.quanlykhachsan.entity.ThuePhong;
import com.khachsan.quanlykhachsan.repository.DichVuRepository;
import com.khachsan.quanlykhachsan.repository.ThuePhongRepository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ServiceUsageService {
    private final SuDungDichVuRepository repo;
    private final HoaDonRepository hoaDonRepo;
    private final ThuePhongRepository thueRepo;
    private final DichVuRepository dichVuRepo;

    public record SddvRequest(String maThue, String maDichVu, Integer soLuong, LocalDate ngaySuDung) {
    }

    public PageResponse<SuDungDichVuListResponse> timKiem(String maSddv, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size,
                Sort.by(Sort.Order.desc("ngaySuDung"), Sort.Order.asc("maSDDV")));
        return PageResponse.from(
                repo.findByMaSDDVContainingIgnoreCase(maSddv.trim(), pageable)
                        .map(SuDungDichVuListResponse::fromEntity));
    }

    public void xoa(String maSddv) {
        SuDungDichVu s = repo.findById(maSddv).orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy lượt sử dụng dịch vụ " + maSddv));
        String maThue = s.getThuePhong().getMaThue();
        if (hoaDonRepo.demHoaDonCuaPhieuThue(maThue) > 0) {
            throw new BusinessException("Không thể xóa " + maSddv + " vì phiếu thuê " + maThue + " đã có hóa đơn");
        }
        repo.delete(s);
    }

    @Transactional
    public SuDungDichVuListResponse them(SddvRequest req) {
        if (req.maThue() == null || req.maThue().isBlank()) {
            throw new BusinessException("Vui lòng chọn phiếu thuê");
        }
        ThuePhong tp = thueRepo.findById(req.maThue().trim()).orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy phiếu thuê " + req.maThue()));
        DichVu dv = kiemTra(tp, req);

        SuDungDichVu s = SuDungDichVu.builder()
                .maSDDV(taoMaTuDong())
                .thuePhong(tp)
                .dichVu(dv)
                .soLuong(req.soLuong())
                .ngaySuDung(req.ngaySuDung())
                .build();
        return SuDungDichVuListResponse.fromEntity(repo.save(s));
    }

    @Transactional
    public SuDungDichVuListResponse sua(String maSddv, SddvRequest req) {
        SuDungDichVu s = repo.findById(maSddv).orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy lượt sử dụng dịch vụ " + maSddv));
        DichVu dv = kiemTra(s.getThuePhong(), req);

        s.setDichVu(dv);
        s.setSoLuong(req.soLuong());
        s.setNgaySuDung(req.ngaySuDung());
        return SuDungDichVuListResponse.fromEntity(repo.save(s));
    }

    // Kiểm tra dùng chung cho thêm và sửa, trả về dịch vụ được chọn
    private DichVu kiemTra(ThuePhong tp, SddvRequest req) {
        if (hoaDonRepo.demHoaDonCuaPhieuThue(tp.getMaThue()) > 0) {
            throw new BusinessException("Phiếu thuê " + tp.getMaThue() + " đã có hóa đơn, không thể thêm/sửa dịch vụ");
        }
        if (req.maDichVu() == null || req.maDichVu().isBlank()) {
            throw new BusinessException("Vui lòng chọn dịch vụ");
        }
        DichVu dv = dichVuRepo.findById(req.maDichVu().trim()).orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy dịch vụ " + req.maDichVu()));
        if (req.soLuong() == null || req.soLuong() < 1) {
            throw new BusinessException("Số lượng phải lớn hơn 0");
        }
        LocalDate ngay = req.ngaySuDung();
        if (ngay == null) {
            throw new BusinessException("Vui lòng chọn ngày sử dụng");
        }
        if (ngay.isBefore(tp.getNgayNhan()) || ngay.isAfter(tp.getNgayTra())) {
            throw new BusinessException("Ngày sử dụng phải nằm trong thời gian lưu trú ("
                    + tp.getNgayNhan() + " đến " + tp.getNgayTra() + ")");
        }
        return dv;
    }

    private String taoMaTuDong() {
        Long max = repo.layMaSoLonNhat();
        long next = (max == null ? 0 : max) + 1;
        String ma = String.format("SD%02d", next);
        while (repo.existsById(ma)) {
            next++;
            ma = String.format("SD%02d", next);
        }
        return ma;
    }
}