package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.request.phong.PhongRequest;
import com.khachsan.quanlykhachsan.dto.response.phong.PhongDetailResponse;
import com.khachsan.quanlykhachsan.dto.response.phong.PhongFilterProjection;
import com.khachsan.quanlykhachsan.dto.response.phong.PhongListResponse;
import com.khachsan.quanlykhachsan.entity.LoaiPhong;
import com.khachsan.quanlykhachsan.entity.Phong;
import com.khachsan.quanlykhachsan.exception.BusinessException;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.PhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhongService {

    private final PhongRepository phongRepository;
    private final LoaiPhongService loaiPhongService;
    private final ArrayList<String> status = new ArrayList<>(List.of("Trống", "Đang sử dụng"));
    @Transactional(readOnly = true)
    public PageResponse<PhongListResponse> getPagePhong(
            String keyword,
            String maLoai,
            String trangThai,
            BigDecimal giaTu,
            BigDecimal giaDen,
            int page,
            int size
    ) {
        if (giaTu != null && giaDen != null && giaTu.compareTo(giaDen) > 0) {
            throw new BusinessException("Giá từ không được lớn hơn giá đến");
        }

        int validPage = Math.max(page, 1);
        int validSize = Math.max(size, 1);
        int pageIndex = validPage - 1;

        String cleanKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String cleanMaLoai = (maLoai != null && !maLoai.isBlank()) ? maLoai.trim() : null;
        String cleanTrangThai = (trangThai != null && !trangThai.isBlank()) ? trangThai.trim() : null;

        List<PhongFilterProjection> rows = this.phongRepository.timKiemPhongByProcedure(
                cleanKeyword,
                cleanMaLoai,
                cleanTrangThai,
                giaTu,
                giaDen,
                validPage,
                validSize
        );

        long totalElements = rows.isEmpty() ? 0L : rows.get(0).getTotalElements();

        List<PhongListResponse> content = rows.stream()
                .map(r -> PhongListResponse.builder()
                        .maPhong(r.getMaPhong())
                        .soPhong(r.getSoPhong())
                        .tenLoai(r.getTenLoai())
                        .giaPhong(r.getGiaPhong())
                        .trangThai(r.getTrangThai())
                        .build())
                .toList();

        Pageable pageable = PageRequest.of(pageIndex, validSize);
        Page<PhongListResponse> dtoPage = new PageImpl<>(content, pageable, totalElements);

        return PageResponse.from(dtoPage);
    }

    public PhongDetailResponse getPhong(String maPhong){
        Phong phong = this.phongRepository.findByMaPhong(maPhong).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với mã phòng "+maPhong));
        return PhongDetailResponse.fromEntity(phong);

    }

    @Transactional
    public PhongDetailResponse updatePhong(String maPhong, PhongRequest request){
        Phong phong = this.phongRepository.findByMaPhong(maPhong).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với mã phòng "+maPhong));

        if(request.getMaLoai()!=null && !request.getMaLoai().isBlank()){
            LoaiPhong loaiPhong = this.loaiPhongService.findByMaLoai(request.getMaLoai());
            phong.setLoaiPhong(loaiPhong);
        }

        if(request.getSoPhong()!=null && !request.getSoPhong().isBlank()){
            Optional<Phong> exist =  this.phongRepository.findBySoPhong(request.getSoPhong());
            if (exist.isPresent() && !exist.get().getMaPhong().equals(maPhong)) {
                throw new BusinessException("Số phòng đã tồn tại");
            }
            phong.setSoPhong(request.getSoPhong());
        }

        if(request.getTrangThai()!=null&& !request.getTrangThai().isBlank()){
            if(!status.contains(request.getTrangThai())){
                throw new BusinessException("Trạng thái phòng không hợp lệ");
            }
            if(request.getTrangThai().equals(phong.getTrangThai())){
                throw new BusinessException("Không thể cập nhật, trạng thái hiện tại đang là "+phong.getTrangThai());
            }
                phong.setTrangThai(request.getTrangThai());
        }

        Phong saved = this.phongRepository.save(phong);
        return PhongDetailResponse.fromEntity(saved);

    }

    @Transactional
    public void deletePhong(String maPhong) {
        if (maPhong == null || maPhong.isBlank()) {
            throw new BusinessException("Mã phòng không được để trống");
        }

        Phong phong = this.phongRepository.findByMaPhong(maPhong)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với mã phòng " + maPhong));

        if ("Đang sử dụng".equals(phong.getTrangThai())) {
            throw new BusinessException("Không thể xóa phòng " + phong.getSoPhong() + " vì đang được sử dụng");
        }

        try {
            this.phongRepository.delete(phong);
            this.phongRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Không thể xóa phòng " + phong.getSoPhong() + " vì đang được tham chiếu ở dữ liệu thuê phòng");
        }
    }

    public PhongDetailResponse createRoom(PhongRequest request){
        Optional<Phong> exist =  this.phongRepository.findBySoPhong(request.getSoPhong());
        if (exist.isPresent()) {
            throw new BusinessException("Số phòng đã tồn tại");
        }

        LoaiPhong loaiPhong = this.loaiPhongService.findByMaLoai(request.getMaLoai());

        if(request.getTrangThai()!=null&& !request.getTrangThai().isBlank()) {
            if (!status.contains(request.getTrangThai())) {
                throw new BusinessException("Trạng thái phòng không hợp lệ");
            }
        }
        String maPhong = "P-" + UUID.randomUUID().toString().substring(0, 7).toUpperCase();

        Phong phong = Phong.builder()
                .maPhong(maPhong)
                .soPhong(request.getSoPhong())
                .loaiPhong(loaiPhong)
                .trangThai(request.getTrangThai())
                .build();

        Phong saved = this.phongRepository.save(phong);
        return PhongDetailResponse.fromEntity(saved);
    }


}
