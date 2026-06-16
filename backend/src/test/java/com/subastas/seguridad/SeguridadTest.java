package com.subastas.seguridad;

import com.subastas.BaseIntegrationTest;
import com.subastas.model.entity.Usuario;
import com.subastas.model.enums.EstadoUsuario;
import com.subastas.repository.UsuarioRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifica que los endpoints protegidos rechazan requests sin JWT
 * y que los endpoints públicos funcionan sin autenticación.
 * Spring Security 6 devuelve 403 por defecto cuando no hay AuthenticationEntryPoint configurado.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SeguridadTest extends BaseIntegrationTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ---- Endpoints protegidos sin JWT → 403 ----

    @Test
    @Order(1)
    void subastas_sin_jwt_es_rechazado() {
        ResponseEntity<Map<String, Object>> res = getNoAuth("/api/v1/subastas", MAP_TYPE);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(2)
    void perfil_sin_jwt_es_rechazado() {
        ResponseEntity<Map<String, Object>> res = getNoAuth("/api/v1/usuarios/perfil", MAP_TYPE);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(3)
    void medios_pago_sin_jwt_es_rechazado() {
        ResponseEntity<Map<String, Object>> res = getNoAuth("/api/v1/usuarios/medios-pago", MAP_TYPE);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(4)
    void multas_sin_jwt_es_rechazado() {
        ResponseEntity<Map<String, Object>> res = getNoAuth("/api/v1/usuarios/multas", MAP_TYPE);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(5)
    void consignaciones_sin_jwt_es_rechazado() {
        ResponseEntity<Map<String, Object>> res = getNoAuth("/api/v1/consignaciones", MAP_TYPE);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(6)
    void conectar_subasta_sin_jwt_es_rechazado() {
        ResponseEntity<Map<String, Object>> res = postNoAuth(
                "/api/v1/subastas/1/conectar", Map.of("medioPagoId", 1), MAP_TYPE);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(7)
    void pujar_sin_jwt_es_rechazado() {
        ResponseEntity<Map<String, Object>> res = postNoAuth(
                "/api/v1/subastas/1/pujas",
                Map.of("itemId", 1, "monto", 55000, "medioPagoId", 1), MAP_TYPE);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    // ---- Endpoints públicos sin JWT → 200 ----

    @Test
    @Order(8)
    void catalogo_sin_jwt_devuelve_200() {
        ResponseEntity<Object[]> res = rest.getForEntity("/api/v1/subastas/1/catalogo", Object[].class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @Order(9)
    void item_detalle_sin_jwt_es_rechazado() {
        ResponseEntity<Map<String, Object>> res = getNoAuth("/api/v1/items/1", MAP_TYPE);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(10)
    void imagenes_item_sin_jwt_es_rechazado() {
        ResponseEntity<Object[]> res = rest.getForEntity("/api/v1/items/1/imagenes", Object[].class);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    // ---- JWT inválido → rechazado ----

    @Test
    @Order(11)
    void jwt_invalido_es_rechazado() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth("token.invalido.falso");

        ResponseEntity<Map<String, Object>> res = rest.exchange("/api/v1/usuarios/perfil",
                HttpMethod.GET, new HttpEntity<>(headers), MAP_TYPE);

        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    // ---- Acceso a recurso de otro usuario ----

    @Test
    @Order(12)
    void usuario_no_puede_ver_compra_ajena() {
        String jwtMaria = loginAndGetToken("maria@test.com", "password123");

        ResponseEntity<Map<String, Object>> res = getWithAuth("/api/v1/usuarios/compras/1", jwtMaria, MAP_TYPE);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ---- UserStatusFilter: usuario PENDIENTE_VERIFICACION ----

    @Test
    @Order(13)
    void usuario_pendiente_bloqueado_en_endpoints_protegidos() {
        // Login mientras juan está APROBADO → JWT válido
        String jwt = loginAndGetToken("juan@test.com", "password123");

        Usuario juan = usuarioRepository.findByEmail("juan@test.com").orElseThrow();
        EstadoUsuario estadoOriginal = juan.getEstado();
        juan.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION);
        usuarioRepository.save(juan);

        try {
            // UserStatusFilter verifica el estado en DB, no en el JWT → 403
            ResponseEntity<Map<String, Object>> res = getWithAuth("/api/v1/subastas", jwt, MAP_TYPE);
            assertThat(res.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        } finally {
            juan.setEstado(estadoOriginal);
            usuarioRepository.save(juan);
        }
    }

    @Test
    @Order(14)
    void usuario_pendiente_puede_acceder_su_perfil() {
        // GET /usuarios/perfil está en la lista blanca de UserStatusFilter
        String jwt = loginAndGetToken("juan@test.com", "password123");

        Usuario juan = usuarioRepository.findByEmail("juan@test.com").orElseThrow();
        EstadoUsuario estadoOriginal = juan.getEstado();
        juan.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION);
        usuarioRepository.save(juan);

        try {
            ResponseEntity<Map<String, Object>> res = getWithAuth("/api/v1/usuarios/perfil", jwt, MAP_TYPE);
            assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        } finally {
            juan.setEstado(estadoOriginal);
            usuarioRepository.save(juan);
        }
    }

    @Test
    @Order(15)
    void postor_no_puede_acceder_endpoints_admin() {
        String jwtJuan = loginAndGetToken("juan@test.com", "password123");

        ResponseEntity<Map<String, Object>> res = getWithAuth(
                "/api/v1/admin/usuarios/pendientes", jwtJuan, MAP_TYPE);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
