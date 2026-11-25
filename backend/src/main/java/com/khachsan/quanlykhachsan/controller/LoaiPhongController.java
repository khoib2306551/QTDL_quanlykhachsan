package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.request.loaiphong.RoomTypeRequest;
import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import com.khachsan.quanlykhachsan.dto.response.loaiphong.RoomTypeResponse;
import com.khachsan.quanlykhachsan.service.LoaiPhongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/loai-phong")
@RequiredArgsConstructor
public class LoaiPhongController {

    private final LoaiPhongService loaiPhongService;
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RoomTypeResponse>>> getPageLoaiPhong(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal giaTu,
            @RequestParam(required = false) BigDecimal giaDen,
            @RequestParam(required = false) Boolean chiConPhongTrong,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<RoomTypeResponse> response = this.loaiPhongService.getPageRoomType(
                keyword, giaTu, giaDen, chiConPhongTrong, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("success", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoomTypeResponse>> createRoomType(@RequestBody RoomTypeRequest request){
        RoomTypeResponse response = this.loaiPhongService.createRoomType(request);
        return ResponseEntity.ok(ApiResponse.success("success",response));
    }

    @PatchMapping("/{maLoai}")
    public ResponseEntity<ApiResponse<RoomTypeResponse>> updateRoomType(@PathVariable String maLoai, @RequestBody RoomTypeRequest request){
        RoomTypeResponse response = this.loaiPhongService.updateRoomType(maLoai,request);
        return ResponseEntity.ok(ApiResponse.success("success",response));
    }

    @DeleteMapping("/{maLoai}")
    public ResponseEntity<ApiResponse<Void>> deleteRoomType(@PathVariable String maLoai){
        this.loaiPhongService.deleteRoomType(maLoai);
        return ResponseEntity.ok(ApiResponse.success("success"));
    }
}


