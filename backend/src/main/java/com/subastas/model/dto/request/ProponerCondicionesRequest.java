package com.subastas.model.dto.request;

import com.subastas.model.enums.Categoria;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProponerCondicionesRequest {

    @NotNull(message = "El valor base es obligatorio")
    @DecimalMin(value = "0.01", message = "El valor base debe ser positivo")
    private BigDecimal valorBase;

    @NotNull(message = "Las comisiones son obligatorias")
    @DecimalMin(value = "0.00", message = "Las comisiones no pueden ser negativas")
    private BigDecimal comisiones;

    @NotNull(message = "La fecha de subasta es obligatoria")
    private LocalDateTime fechaSubasta;

    @NotNull(message = "La categoría es obligatoria")
    private Categoria categoria;
}
