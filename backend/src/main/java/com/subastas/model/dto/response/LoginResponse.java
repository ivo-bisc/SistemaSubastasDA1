package com.subastas.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.subastas.model.enums.Categoria;
import com.subastas.model.enums.EstadoUsuario;
import com.subastas.model.enums.RolUsuario;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    @JsonProperty("token")
    private String tokenAcceso;
    @JsonProperty("user")
    private UsuarioInfo usuario;

    @Data
    @Builder
    public static class UsuarioInfo {
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
    }
}
