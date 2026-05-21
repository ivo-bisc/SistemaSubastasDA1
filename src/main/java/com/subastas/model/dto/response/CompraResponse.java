package com.subastas.model.dto.response;

import com.subastas.model.enums.EstadoPago;
import com.subastas.model.enums.Moneda;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CompraResponse {
    private Long compraId;
    private ItemInfo item;
    private BigDecimal montoOfertado;
    private BigDecimal comisiones;
    private BigDecimal costoEnvio;
    private BigDecimal total;
    private Moneda moneda;
    private MedioPagoInfo medioPago;
    private EstadoPago estadoPago;
    private String direccionEnvio;

    @Data
    @Builder
    public static class ItemInfo {
        private Long id;
        private String descripcion;
        private String numeroPieza;
    }

    @Data
    @Builder
    public static class MedioPagoInfo {
        private Long id;
        private String alias;
        private String tipo;
    }
}
