package com.subastas.model.dto.response;

import com.subastas.model.enums.EstadoItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ItemResponse {
    private Long itemId;
    private String numeroPieza;
    private String descripcion;
    private BigDecimal precioBase;
    private EstadoItem estado;
    private String duenioActual;
    private List<ImagenInfo> imagenes;
    private List<String> componentes;
    private boolean esObraArte;
    private String artista;
    private LocalDate fechaCreacion;
    private String historia;

    @Data
    @Builder
    public static class ImagenInfo {
        private Long imagenId;
        private String url;
        private int orden;
        private String descripcion;
    }
}
