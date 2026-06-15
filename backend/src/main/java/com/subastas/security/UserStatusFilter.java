package com.subastas.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subastas.exception.ErrorCodes;
import com.subastas.model.dto.response.ErrorResponse;
import com.subastas.model.entity.Usuario;
import com.subastas.model.enums.EstadoUsuario;
import com.subastas.model.enums.RolUsuario;
import com.subastas.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Bloquea con 403 a usuarios cuyo estado todavía no es APROBADO, salvo
 * GET/PUT /api/v1/usuarios/perfil (para que la pantalla de espera pueda
 * hacer polling) y POST /api/v1/auth/logout. Los ADMIN nunca son bloqueados.
 */
@Component
@RequiredArgsConstructor
public class UserStatusFilter extends OncePerRequestFilter {

    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Usuario usuario = usuarioRepository.findByEmail(auth.getName()).orElse(null);

        if (usuario == null || usuario.getRol() == RolUsuario.ADMIN
                || usuario.getEstado() == EstadoUsuario.APROBADO
                || esRutaPermitida(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), new ErrorResponse(
                ErrorCodes.USUARIO_PENDIENTE_APROBACION, "Tu cuenta está pendiente de aprobación"));
    }

    private boolean esRutaPermitida(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        boolean perfil = path.equals("/api/v1/usuarios/perfil")
                && ("GET".equals(method) || "PUT".equals(method));
        boolean logout = path.equals("/api/v1/auth/logout") && "POST".equals(method);
        return perfil || logout;
    }
}
