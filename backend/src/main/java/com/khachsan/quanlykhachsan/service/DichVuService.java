package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.entity.DichVu;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.DichVuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DichVuService {

    private final DichVuRepository dichVuRepository;

    public List<DichVu> layDanhSach(String tuKhoa) {
        return dichVuRepository.timKiemDichVu(tuKhoa);
    }

    @Transactional
    public DichVu themDichVu(DichVu dv) {
        if (dv.getTenDichVu() == null || dv.getTenDichVu().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên dịch vụ không được để trống");
        }
        if (dv.getGiaDichVu() == null || dv.getGiaDichVu().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Giá dịch vụ phải lớn hơn hoặc bằng 0");
        }

        String maDV = (dv.getMaDichVu() == null || dv.getMaDichVu().trim().isEmpty())
                ? taoMaDichVuTuDong()
                : dv.getMaDichVu().trim();

        if (dichVuRepository.existsById(maDV)) {
            throw new IllegalArgumentException("Mã dịch vụ " + maDV + " đã tồn tại");
        }

        dv.setMaDichVu(maDV);
        return dichVuRepository.save(dv);
    }

    @Transactional
    public DichVu capNhatDichVu(String maDV, DichVu capNhat) {
        DichVu hienTai = dichVuRepository.findById(maDV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ có mã " + maDV));

        hienTai.setTenDichVu(capNhat.getTenDichVu());
        hienTai.setGiaDichVu(capNhat.getGiaDichVu());
        return dichVuRepository.save(hienTai);
    }

    @Transactional
    public void xoaDichVu(String maDV) {
        if (!dichVuRepository.existsById(maDV)) {
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ có mã " + maDV);
        }
        dichVuRepository.deleteById(maDV);
    }

    private String taoMaDichVuTuDong() {
        Long maxSo = dichVuRepository.layMaSoLonNhat();
        long nextSo = (maxSo == null ? 0 : maxSo) + 1;
        String maMoi = String.format("DV%02d", nextSo);
        while (dichVuRepository.existsById(maMoi)) {
            nextSo++;
            maMoi = String.format("DV%02d", nextSo);
        }
        return maMoi;
    }
}