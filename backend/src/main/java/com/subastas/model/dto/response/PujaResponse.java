package com.subastas.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.subastas.model.enums.EstadoPuja;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PujaResponse {
    @JsonProperty("id")
    private Long pujaId;
    @JsonProperty("amount")
    private BigDecimal monto;
    @JsonProperty("status")
    private EstadoPuja estado;
    @JsonProperty("createdAt")
    private LocalDateTime timestamp;
    @JsonProperty("newBestOffer")
    private BigDecimal nuevaMejorOferta;
    @JsonProperty("bidderAlias")
    private String postorAlias;
}
