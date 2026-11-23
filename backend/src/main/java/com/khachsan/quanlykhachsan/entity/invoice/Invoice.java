package com.khachsan.quanlykhachsan.entity.invoice;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "HoaDon")
@Getter
@Setter
public class Invoice {
    @Id
    @Column(name = "MaHoaDon")
    private String maHoaDon;

    @Column(name = "MaSDDV")
    private String maSddv;

    @Column(name = "NgayLapHoaDon")
    private LocalDate ngayLapHoaDon;

    @Column(name = "TongTien")
    private BigDecimal tongTien;
}