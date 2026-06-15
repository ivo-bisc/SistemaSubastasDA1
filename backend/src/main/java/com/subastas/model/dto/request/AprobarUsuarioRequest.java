package com.subastas.model.dto.request;

import com.subastas.model.enums.Categoria;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AprobarUsuarioRequest {

    @NotNull(message = "La categoría es obligatoria")
    private Categoria categoria;
}
