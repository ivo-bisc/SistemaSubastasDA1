package com.subastas.admin;

import com.subastas.BaseIntegrationTest;
import com.subastas.model.dto.response.ConsignacionResponse;
import com.subastas.model.dto.response.UsuarioResponse;
import com.subastas.model.entity.Usuario;
import com.subastas.model.enums.EstadoUsuario;
import com.subastas.repository.UsuarioRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class AdminControllerTest extends BaseIntegrationTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private String jwtAdmin;
    private String jwtJuan;

    @BeforeEach
    void setUp() {
        jwtAdmin = loginAndGetToken("admin@subastas.com", "admin123");
        jwtJuan  = loginAndGetToken("juan@test.com", "password123");
        // Garantizar que pendiente@test.com esté en PENDIENTE_VERIFICACION antes de cada test
        usuarioRepository.findByEmail("pendiente@test.com").ifPresent(u -> {
            u.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION);
            u.setCategoria(null);
            usuarioRepository.save(u);
        });
    }

    // ---- Listado de pendientes ----

    @Test
    void listar_usuarios_pendientes_como_admin_devuelve_200() {
        ResponseEntity<UsuarioResponse[]> res = getWithAuth(
                "/api/v1/admin/usuarios/pendientes", jwtAdmin, UsuarioResponse[].class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    @Test
    void listar_consignaciones_pendientes_como_admin_devuelve_200() {
        ResponseEntity<ConsignacionResponse[]> res = getWithAuth(
                "/api/v1/admin/consignaciones/pendientes", jwtAdmin, ConsignacionResponse[].class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ---- Acceso denegado ----

    @Test
    void postor_no_puede_acceder_endpoints_admin() {
        ResponseEntity<Map<String, Object>> res = getWithAuth(
                "/api/v1/admin/usuarios/pendientes", jwtJuan, MAP_TYPE);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void sin_jwt_no_puede_acceder_endpoints_admin() {
        ResponseEntity<Map<String, Object>> res = getNoAuth(
                "/api/v1/admin/usuarios/pendientes", MAP_TYPE);

        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    // ---- Aprobar usuario ----

    @Test
    void aprobar_usuario_pendiente_cambia_estado_a_aprobado() {
        Usuario pendiente = usuarioRepository.findByEmail("pendiente@test.com").orElseThrow();

        try {
            ResponseEntity<UsuarioResponse> res = postWithAuth(
                    "/api/v1/admin/usuarios/" + pendiente.getId() + "/aprobar",
                    jwtAdmin,
                    Map.of("categoria", "COMUN"),
                    UsuarioResponse.class);

            assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(res.getBody().getEstado()).isEqualTo(EstadoUsuario.APROBADO);
        } finally {
            usuarioRepository.findByEmail("pendiente@test.com").ifPresent(u -> {
                u.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION);
                u.setCategoria(null);
                usuarioRepository.save(u);
            });
        }
    }

    // ---- Rechazar usuario ----

    @Test
    void rechazar_usuario_pendiente_cambia_estado_a_bloqueado() {
        Usuario pendiente = usuarioRepository.findByEmail("pendiente@test.com").orElseThrow();

        try {
            ResponseEntity<UsuarioResponse> res = postWithAuth(
                    "/api/v1/admin/usuarios/" + pendiente.getId() + "/rechazar",
                    jwtAdmin,
                    null,
                    UsuarioResponse.class);

            assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(res.getBody().getEstado()).isEqualTo(EstadoUsuario.BLOQUEADO);
        } finally {
            usuarioRepository.findByEmail("pendiente@test.com").ifPresent(u -> {
                u.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION);
                usuarioRepository.save(u);
            });
        }
    }
}
