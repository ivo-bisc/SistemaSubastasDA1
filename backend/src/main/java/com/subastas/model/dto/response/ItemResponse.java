package com.subastas.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.subastas.model.enums.EstadoItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ItemResponse {
    @JsonProperty("id")
    private Long itemId;
    @JsonProperty("pieceNumber")
    private String numeroPieza;
    @JsonProperty("description")
    private String descripcion;
    @JsonProperty("startingPrice")
    private BigDecimal precioBase;
    @JsonProperty("status")
    private EstadoItem estado;
    @JsonProperty("currentOwner")
    private String duenioActual;
    @JsonProperty("images")
    private List<ImagenInfo> imagenes;
    @JsonProperty("components")
    private List<String> componentes;
    @JsonProperty("isArtwork")
    private boolean esObraArte;
    @JsonProperty("artist")
    private String artista;
    @JsonProperty("creationDate")
    private LocalDate fechaCreacion;
    @JsonProperty("history")
    private String historia;
    @JsonProperty("physicalLocation")
    private String ubicacionFisica;
    @JsonProperty("currentPrice")
    private BigDecimal mejorOferta;
    @JsonProperty("minimumBid")
    private BigDecimal pujaMinima;
    @JsonProperty("maximumBid")
    private BigDecimal pujaMaxima;
    private SubastaInfo subasta;
    private PolizaInfo poliza;

    @Data
    @Builder
    public static class ImagenInfo {
        @JsonProperty("id")
        private Long imagenId;
        private String url;
        @JsonProperty("order")
        private int orden;
        @JsonProperty("description")
        private String descripcion;
    }

    @Data
    @Builder
    public static class SubastaInfo {
        private Long id;
        @JsonProperty("title")
        private String titulo;
        @JsonProperty("location")
        private String ubicacion;
    }

    @Data
    @Builder
    public static class PolizaInfo {
        @JsonProperty("id")
        private Long polizaId;
        @JsonProperty("insurerName")
        private String aseguradoraNombre;
        @JsonProperty("insurerContact")
        private String aseguradoraContacto;
        @JsonProperty("insuredValue")
        private BigDecimal valorAsegurado;
        @JsonProperty("validFrom")
        private LocalDate vigenciaDesde;
        @JsonProperty("validUntil")
        private LocalDate vigenciaHasta;
    }
}
