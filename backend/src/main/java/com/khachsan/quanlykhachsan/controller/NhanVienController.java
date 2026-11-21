package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.config.security.CustomUserDetail;
import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.request.NhanVienRequest;
import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import com.khachsan.quanlykhachsan.dto.response.auth.UserInfo;
import com.khachsan.quanlykhachsan.service.NhanVienService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nhan-vien")
@RequiredArgsConstructor
public class NhanVienController {

    private final NhanVienService nhanVienService;
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserInfo>>> getPageNhanVien(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        PageResponse<UserInfo> result = this.nhanVienService.getPageNhanVien(page, size, keyword);
        return ResponseEntity.ok(
                ApiResponse.success("success",result)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserInfo>> createNhanVien(@Valid @RequestBody NhanVienRequest request) {
        UserInfo created = this.nhanVienService.createNhanVien(request);
        return ResponseEntity.ok(
                ApiResponse.success("success",created)
        );
    }

    @PatchMapping("/{maNhanVien}")
    public ResponseEntity<ApiResponse<UserInfo>> updateNhanVien(
            @PathVariable String maNhanVien,
            @Valid @RequestBody NhanVienRequest request
    ) {
        UserInfo updated = this.nhanVienService.updateNhanVien(maNhanVien, request);
        return ResponseEntity.ok(
                ApiResponse.success("success",updated)
        );
    }

    @DeleteMapping("/{maNhanVien}")
    public ResponseEntity<ApiResponse<Void>> deleteNhanVien(@PathVariable String maNhanVien, @AuthenticationPrincipal UserDetails userDetails) {
        CustomUserDetail userDetail = (CustomUserDetail)userDetails;
        this.nhanVienService.deleteNhanVien(maNhanVien,userDetail.getId());
        return ResponseEntity.ok(
                ApiResponse.success("success")
        );
    }

    @GetMapping("/{maNhanVien}")
    public ResponseEntity<ApiResponse<UserInfo>> getNhanVienDetail(@PathVariable String maNhanVien) {
       UserInfo userInfo = this.nhanVienService.getNhanVienDetail(maNhanVien);
        return ResponseEntity.ok(
                ApiResponse.success("success",userInfo)
        );
    }
}
