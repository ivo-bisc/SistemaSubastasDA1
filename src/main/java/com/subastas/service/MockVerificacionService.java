package com.subastas.service;

import com.subastas.model.entity.Usuario;
import com.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockVerificacionService {

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    // Simula la verificación externa: delay de 3 segundos, siempre exitoso
    @Async
    @Transactional
    public void verificarYEnviarEmail(Long usuarioId, String token) {
        try {
            log.debug("Iniciando verificación mock para usuario {}", usuarioId);
            Thread.sleep(3000);

            // La verificación siempre es exitosa en el mock
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            if (usuario == null) {
                log.warn("Usuario {} no encontrado tras verificación mock", usuarioId);
                return;
            }

            // Categoría asignada automáticamente: COMUN por defecto
            log.debug("Verificación mock completada para {}. Enviando email.", usuario.getEmail());
            emailService.enviarTokenRegistro(usuario.getEmail(), usuario.getNombre(), token);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Verificación mock interrumpida para usuario {}", usuarioId);
        }
    }
}
