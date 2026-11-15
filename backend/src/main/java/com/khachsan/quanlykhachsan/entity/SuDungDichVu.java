package com.khachsan.quanlykhachsan.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "SuDungDichVu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuDungDichVu {

    @Id
    @Column(name = "MaSDDV", length = 10, nullable = false)
    private String maSDDV;

    @ManyToOne
    @JoinColumn(name = "MaThue", nullable = false)
    private ThuePhong thuePhong;

    @ManyToOne
    @JoinColumn(name = "MaDichVu", nullable = false)
    private DichVu dichVu;

    @Builder.Default
    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong = 1;

    @Column(name = "NgaySuDung", nullable = false)
    private LocalDate ngaySuDung;
}