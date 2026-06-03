package com.subastas.model.dto.request;

import lombok.Data;

@Data
public class ActualizarPerfilRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String domicilioLegal;
}
