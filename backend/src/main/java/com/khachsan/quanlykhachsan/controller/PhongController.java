package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.request.phong.PhongRequest;
import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import com.khachsan.quanlykhachsan.dto.response.phong.PhongDetailResponse;
import com.khachsan.quanlykhachsan.dto.response.phong.PhongListResponse;
import com.khachsan.quanlykhachsan.service.PhongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/phong")
@RequiredArgsConstructor
public class PhongController {
    private final PhongService phongService;


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PhongListResponse>>> getPageRooms(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String maLoai,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) BigDecimal giaTu,
            @RequestParam(required = false) BigDecimal giaDen,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<PhongListResponse> response = this.phongService.getPagePhong(
                keyword, maLoai, trangThai, giaTu, giaDen, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("success", response));
    }

    @GetMapping("/{maPhong}")
    public ResponseEntity<ApiResponse<PhongDetailResponse>> getRoom(@PathVariable String maPhong){
        PhongDetailResponse response = this.phongService.getPhong(maPhong);
        return ResponseEntity.ok(ApiResponse.success("success",response));
    }

    @PatchMapping("/{maPhong}")
    public ResponseEntity<ApiResponse<PhongDetailResponse>> updateRoom(@PathVariable String maPhong,
        @RequestBody PhongRequest request
    ){
        PhongDetailResponse response = this.phongService.updatePhong(maPhong,request);
        return ResponseEntity.ok(ApiResponse.success("success",response));
    }

    @DeleteMapping("/{maPhong}")
    public ResponseEntity<ApiResponse<PhongDetailResponse>> deleteRoom(@PathVariable String maPhong){
        this.phongService.deletePhong(maPhong);
        return ResponseEntity.ok(ApiResponse.success("success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhongDetailResponse>> createRoom(@RequestBody PhongRequest request){
        PhongDetailResponse response = this.phongService.createRoom(request);
        return ResponseEntity.ok(ApiResponse.success("success",response));
    }

}
