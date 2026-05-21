package com.subastas.controller;

import com.subastas.model.dto.request.LoginRequest;
import com.subastas.model.dto.request.RegistroPaso1Request;
import com.subastas.model.dto.request.RegistroPaso2Request;
import com.subastas.model.dto.response.LoginResponse;
import com.subastas.model.dto.response.RegistroResponse;
import com.subastas.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/registro/paso1", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RegistroResponse> registroPaso1(
            @Valid @ModelAttribute RegistroPaso1Request request,
            @RequestPart(value = "foto_dni_frente", required = false) MultipartFile fotoDniFrente,
            @RequestPart(value = "foto_dni_dorso", required = false) MultipartFile fotoDniDorso) {

        RegistroResponse response = authService.registroPaso1(request, fotoDniFrente, fotoDniDorso);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/registro/paso2")
    public ResponseEntity<RegistroResponse> registroPaso2(@Valid @RequestBody RegistroPaso2Request request) {
        return ResponseEntity.ok(authService.registroPaso2(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // Con JWT stateless, el logout es responsabilidad del cliente (eliminar el token)
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada exitosamente"));
    }
}
