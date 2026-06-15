package com.subastas.controller;

import com.subastas.model.dto.request.AprobarUsuarioRequest;
import com.subastas.model.dto.request.ProponerCondicionesRequest;
import com.subastas.model.dto.request.RechazarConsignacionRequest;
import com.subastas.model.dto.response.ConsignacionResponse;
import com.subastas.model.dto.response.UsuarioResponse;
import com.subastas.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de administración: aprobación/rechazo de usuarios pendientes
 * y revisión de consignaciones. Todo bajo /api/v1/admin, protegido con
 * hasRole("ADMIN") vía SecurityConfig.
 */
@Validated
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/usuarios/pendientes")
    public ResponseEntity<List<UsuarioResponse>> listarUsuariosPendientes() {
        return ResponseEntity.ok(adminService.listarUsuariosPendientes());
    }

    @PostMapping("/usuarios/{id}/aprobar")
    public ResponseEntity<UsuarioResponse> aprobarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody AprobarUsuarioRequest request) {
        return ResponseEntity.ok(adminService.aprobarUsuario(id, request));
    }

    @PostMapping("/usuarios/{id}/rechazar")
    public ResponseEntity<UsuarioResponse> rechazarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rechazarUsuario(id));
    }

    @GetMapping("/consignaciones/pendientes")
    public ResponseEntity<List<ConsignacionResponse>> listarConsignacionesPendientes() {
        return ResponseEntity.ok(adminService.listarConsignacionesPendientes());
    }

    @PostMapping("/consignaciones/{id}/proponer")
    public ResponseEntity<ConsignacionResponse> proponerCondiciones(
            @PathVariable Long id,
            @Valid @RequestBody ProponerCondicionesRequest request) {
        return ResponseEntity.ok(adminService.proponerCondiciones(id, request));
    }

    @PostMapping("/consignaciones/{id}/rechazar")
    public ResponseEntity<ConsignacionResponse> rechazarConsignacion(
            @PathVariable Long id,
            @Valid @RequestBody RechazarConsignacionRequest request) {
        return ResponseEntity.ok(adminService.rechazarConsignacion(id, request));
    }
}
