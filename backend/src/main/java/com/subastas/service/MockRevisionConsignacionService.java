package com.subastas.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subastas.model.entity.Consignacion;
import com.subastas.model.entity.ImagenItem;
import com.subastas.model.entity.Item;
import com.subastas.model.entity.Rematador;
import com.subastas.model.entity.Subasta;
import com.subastas.model.entity.Usuario;
import com.subastas.model.enums.Categoria;
import com.subastas.model.enums.EstadoConsignacion;
import com.subastas.model.enums.EstadoItem;
import com.subastas.model.enums.Moneda;
import com.subastas.repository.ConsignacionRepository;
import com.subastas.repository.ItemRepository;
import com.subastas.repository.RematadorRepository;
import com.subastas.repository.SubastaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Simula la revisión de consignaciones por la empresa.
 * Se ejecuta de forma asíncrona con un delay de 3 segundos para imitar
 * el proceso de evaluación, igual que el mock de verificación de identidad.
 * Resultado siempre: ACEPTADA, con valorBase = precioSugerido (o 1000 por defecto)
 * y comisiones = valorBase × 10%.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MockRevisionConsignacionService {

    private static final BigDecimal COMISION_PORCENTAJE = new BigDecimal("0.10");
    private static final BigDecimal VALOR_BASE_DEFAULT  = new BigDecimal("1000.00");

    private final ConsignacionRepository consignacionRepository;
    private final ItemRepository itemRepository;
    private final SubastaRepository subastaRepository;
    private final RematadorRepository rematadorRepository;

    @Async
    public void revisarYAceptar(Long consignacionId) {
        try {
            log.debug("Iniciando revisión mock para consignación {}", consignacionId);
            Thread.sleep(3000);

            Consignacion consignacion = consignacionRepository.findById(consignacionId).orElse(null);
            if (consignacion == null) {
                log.warn("Consignación {} no encontrada tras revisión mock", consignacionId);
                return;
            }

            BigDecimal valorBase = consignacion.getPrecioSugerido() != null
                    ? consignacion.getPrecioSugerido()
                    : VALOR_BASE_DEFAULT;

            BigDecimal comisiones = valorBase.multiply(COMISION_PORCENTAJE)
                    .setScale(2, RoundingMode.HALF_UP);

            consignacion.setValorBase(valorBase);
            consignacion.setComisiones(comisiones);
            consignacion.setEstado(EstadoConsignacion.ACEPTADA);
            consignacionRepository.save(consignacion);

            log.debug("Revisión mock completada para consignación {}. Estado: ACEPTADA, valorBase: {}, comisiones: {}",
                    consignacionId, valorBase, comisiones);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Revisión mock interrumpida para consignación {}", consignacionId);
        } catch (Exception e) {
            log.error("Error en revisión mock de consignación {}: {}", consignacionId, e.getMessage());
        }
    }

    @Async
    @Transactional
    public void asignarSubasta(Long consignacionId) {
        try {
            Thread.sleep(3000);

            Consignacion consignacion = consignacionRepository.findById(consignacionId).orElse(null);
            if (consignacion == null) {
                log.warn("Consignación {} no encontrada al asignar subasta", consignacionId);
                return;
            }

            // Parsear datosAdicionales para extraer título y moneda
            String titulo = "Artículo en subasta";
            Moneda moneda = Moneda.ARS;
            if (consignacion.getDatosAdicionales() != null) {
                try {
                    Map<String, Object> datos = new ObjectMapper()
                            .readValue(consignacion.getDatosAdicionales(), new TypeReference<Map<String, Object>>() {});
                    if (datos.get("nombre") != null) titulo = datos.get("nombre").toString();
                    if (datos.get("moneda") != null) {
                        try { moneda = Moneda.valueOf(datos.get("moneda").toString()); }
                        catch (IllegalArgumentException ignored) {}
                    }
                } catch (Exception e) {
                    log.warn("No se pudo parsear datosAdicionales de consignación {}: {}", consignacionId, e.getMessage());
                }
            }

            // Mapear fotos de consignación → imágenes de ítem
            List<ImagenItem> imagenes = consignacion.getFotos().stream()
                    .map(f -> ImagenItem.builder()
                            .url(f.getUrl())
                            .orden(f.getOrden())
                            .descripcion("")
                            .build())
                    .collect(Collectors.toList());

            // Construir Item
            Usuario u = consignacion.getUsuario();
            Item item = Item.builder()
                    .descripcion(consignacion.getDescripcion())
                    .precioBase(consignacion.getValorBase())
                    .estado(EstadoItem.EN_SUBASTA)
                    .duenioActual(u.getNombre() + " " + u.getApellido())
                    .imagenes(imagenes)
                    .build();
            imagenes.forEach(img -> img.setItem(item));

            // Construir y guardar Subasta primero (el Item necesita su ID para la FK)
            Rematador rematador = rematadorRepository.findAll().stream().findFirst().orElse(null);
            Subasta subasta = Subasta.builder()
                    .titulo(titulo)
                    .descripcion(consignacion.getDescripcion())
                    .moneda(moneda)
                    .categoria(Categoria.COMUN)
                    .rematador(rematador)
                    .ubicacion("Depósito Central")
                    .fechaInicio(LocalDateTime.now().plusDays(3))
                    .fechaFin(LocalDateTime.now().plusDays(10))
                    .build();
            subasta = subastaRepository.save(subasta);

            // Vincular Item ↔ Subasta y persistir (cascade ALL guarda las imágenes)
            item.setSubasta(subasta);
            subasta.getItems().add(item);
            itemRepository.save(item);

            // Vincular consignación a la subasta creada
            consignacion.setSubastaAsignada(subasta);
            consignacionRepository.save(consignacion);

            log.debug("Subasta {} creada y asignada a consignación {}", subasta.getId(), consignacionId);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("asignarSubasta interrumpida para consignación {}", consignacionId);
        } catch (Exception e) {
            log.error("Error en asignarSubasta para consignación {}: {}", consignacionId, e.getMessage());
        }
    }
}
