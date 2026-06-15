package com.subastas.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RechazarConsignacionRequest {

    @NotBlank(message = "El motivo de rechazo es obligatorio")
    private String motivoRechazo;
}
