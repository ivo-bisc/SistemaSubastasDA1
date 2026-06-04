package com.subastas.model.dto.response;

import com.subastas.model.enums.EstadoPuja;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MiPujaResponse {
    private Long pujaId;
    private String itemDescripcion;
    private BigDecimal monto;
    private EstadoPuja estado;
    private Long subastaId;
    private LocalDateTime timestamp;
}
