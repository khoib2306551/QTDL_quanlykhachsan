package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.request.phong.PhongRequest;
import com.khachsan.quanlykhachsan.dto.response.phong.PhongDetailResponse;
import com.khachsan.quanlykhachsan.dto.response.phong.PhongListResponse;
import com.khachsan.quanlykhachsan.entity.LoaiPhong;
import com.khachsan.quanlykhachsan.entity.Phong;
import com.khachsan.quanlykhachsan.exception.BusinessException;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.PhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public PageResponse<PhongListResponse> getPagePhong(int page, int size){
        int pageIndex = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by("maPhong").ascending());

        Page<Phong> nhanVienPage = this.phongRepository.findAll(pageable);

        Page<PhongListResponse> dtoPage = nhanVienPage.map(PhongListResponse::fromEntity);
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
