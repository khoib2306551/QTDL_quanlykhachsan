package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.response.sddv.SuDungDichVuListResponse;
import com.khachsan.quanlykhachsan.entity.SuDungDichVu;
import com.khachsan.quanlykhachsan.exception.BusinessException;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.InvoiceRepository;
import com.khachsan.quanlykhachsan.repository.SuDungDichVuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ServiceUsageService {
    private final SuDungDichVuRepository repo;
    private final InvoiceRepository invoiceRepo;

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
        if (invoiceRepo.existsByMaSddv(maSddv)) {
            throw new BusinessException("Không thể xóa " + maSddv + " vì đang gắn với một hóa đơn");
        }
        repo.delete(s);
    }
}