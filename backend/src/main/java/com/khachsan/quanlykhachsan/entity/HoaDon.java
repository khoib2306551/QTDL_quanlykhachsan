package com.khachsan.quanlykhachsan.entity;


import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "HoaDon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDon {

    @Id
    @Column(name = "MaHoaDon", length = 10, nullable = false)
    private String maHoaDon;

    @ManyToOne
    @JoinColumn(name = "MaSDDV") // Nullable theo đúng schema SQL
    private SuDungDichVu suDungDichVu;

    @Column(name = "NgayLapHoaDon", nullable = false)
    private LocalDate ngayLapHoaDon;

    @Builder.Default
    @Column(name = "TongTien", precision = 15, scale = 2, nullable = false)
    private BigDecimal tongTien = BigDecimal.ZERO;
}