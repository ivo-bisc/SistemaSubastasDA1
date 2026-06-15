package com.subastas.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.subastas.model.enums.Categoria;
import com.subastas.model.enums.EstadoUsuario;
import com.subastas.model.enums.RolUsuario;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UsuarioResponse {
    private Long id;
    @JsonProperty("firstName")
    private String nombre;
    @JsonProperty("lastName")
    private String apellido;
    private String email;
    @JsonProperty("category")
    private Categoria categoria;
    @JsonProperty("status")
    private EstadoUsuario estado;
    @JsonProperty("role")
    private RolUsuario rol;
    @JsonProperty("address")
    private String domicilioLegal;
    @JsonProperty("country")
    private String paisOrigen;
    @JsonProperty("registeredAt")
    private LocalDateTime fechaRegistro;
    @JsonProperty("pendingFines")
    private int multasPendientes;
    @JsonProperty("dni")
    private String numeroDni;
    @JsonProperty("phone")
    private String telefono;
    private String avatarUrl;
}
