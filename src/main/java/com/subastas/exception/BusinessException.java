package com.subastas.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

    private final String codigo;
    private final HttpStatus httpStatus;

    public BusinessException(String codigo, String mensaje) {
        super(mensaje);
        this.codigo = codigo;
        this.httpStatus = HttpStatus.BAD_REQUEST;
    }

    public BusinessException(String codigo, String mensaje, HttpStatus httpStatus) {
        super(mensaje);
        this.codigo = codigo;
        this.httpStatus = httpStatus;
    }
}
