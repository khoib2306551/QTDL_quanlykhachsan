package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.request.loaiphong.RoomTypeRequest;
import com.khachsan.quanlykhachsan.dto.response.loaiphong.RoomTypeResponse;
import com.khachsan.quanlykhachsan.entity.LoaiPhong;
import com.khachsan.quanlykhachsan.exception.MissingParamException;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.LoaiPhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoaiPhongService {

    private final LoaiPhongRepository loaiPhongRepository;

    public PageResponse<RoomTypeResponse> getPageRoomType(int page, int size) {
        int pageIndex = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by("maLoai").ascending());

        Page<LoaiPhong> nhanVienPage = this.loaiPhongRepository.findAll(pageable);

        Page<RoomTypeResponse> dtoPage = nhanVienPage.map(RoomTypeResponse::fromEntity);
        return PageResponse.from(dtoPage);
    }


    public RoomTypeResponse createRoomType(RoomTypeRequest request){
        if (request.getTenLoai() == null || request.getTenLoai().isBlank()
            || request.getGiaPhong() == null
        ){
            throw new MissingParamException("Tên loại hoặc giá phòng đang trống!");
        }

        String maLoai = "LP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        LoaiPhong loaiPhong = LoaiPhong.builder()
                .maLoai(maLoai)
                .tenLoai(request.getTenLoai())
                .giaPhong(request.getGiaPhong())
                .build();
        LoaiPhong saved = this.loaiPhongRepository.save(loaiPhong);
        return RoomTypeResponse.fromEntity(saved);
    }

    public RoomTypeResponse updateRoomType(String maLoai,RoomTypeRequest request){
        if (request.getTenLoai() == null && request.getTenLoai().isBlank()
                && request.getGiaPhong() == null
        ){
            throw new MissingParamException("Thông tin cập nhật không hợp lệ!");
        }

        LoaiPhong loaiPhong = this.loaiPhongRepository.findByMaLoai(maLoai).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại phòng với mã loại "+maLoai));
        if(request.getGiaPhong()!=null){
            loaiPhong.setGiaPhong(request.getGiaPhong());
        }
        if(request.getTenLoai()!=null){
            loaiPhong.setTenLoai(request.getTenLoai());
        }

        LoaiPhong saved = this.loaiPhongRepository.save(loaiPhong);
        return RoomTypeResponse.fromEntity(saved);
    }

    public void deleteRoomType(String maLoai){
        LoaiPhong loaiPhong = this.loaiPhongRepository.findByMaLoai(maLoai).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại phòng với mã loại "+maLoai));
        this.loaiPhongRepository.delete(loaiPhong);
    }

}
