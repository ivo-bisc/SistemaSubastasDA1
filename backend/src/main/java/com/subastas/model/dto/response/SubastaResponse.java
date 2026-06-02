package com.subastas.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.subastas.model.enums.Categoria;
import com.subastas.model.enums.EstadoSubasta;
import com.subastas.model.enums.Moneda;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubastaResponse {
    private Long id;
    @JsonProperty("title")
    private String titulo;
    @JsonProperty("description")
    private String descripcion;
    @JsonProperty("startDate")
    private LocalDateTime fechaInicio;
    @JsonProperty("category")
    private Categoria categoria;
    @JsonProperty("currency")
    private Moneda moneda;
    @JsonProperty("status")
    private EstadoSubasta estado;
    @JsonProperty("location")
    private String ubicacion;
    private RematadorInfo rematador;
    private int totalItems;

    @Data
    @Builder
    public static class RematadorInfo {
        private Long id;
        @JsonProperty("firstName")
        private String nombre;
        @JsonProperty("lastName")
        private String apellido;
        @JsonProperty("license")
        private String matricula;
    }
}
