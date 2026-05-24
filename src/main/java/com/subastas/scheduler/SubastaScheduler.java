package com.subastas.scheduler;

import com.subastas.model.entity.Subasta;
import com.subastas.model.enums.EstadoSubasta;
import com.subastas.repository.SubastaRepository;
import com.subastas.service.SubastaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubastaScheduler {

    private final SubastaRepository subastaRepository;
    private final SubastaService subastaService;

    @Scheduled(fixedDelay = 60_000)
    public void cerrarSubastasVencidas() {
        List<Subasta> vencidas = subastaRepository
                .findByEstadoAndFechaFinLessThanEqual(EstadoSubasta.ABIERTA, LocalDateTime.now());

        if (vencidas.isEmpty()) return;

        log.info("Cerrando {} subasta(s) vencida(s)", vencidas.size());
        for (Subasta subasta : vencidas) {
            try {
                subastaService.cerrarSubasta(subasta);
            } catch (Exception e) {
                log.error("Error al cerrar subasta id={}: {}", subasta.getId(), e.getMessage(), e);
            }
        }
    }
}
