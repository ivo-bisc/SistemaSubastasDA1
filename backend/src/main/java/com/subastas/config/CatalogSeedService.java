package com.subastas.config;

import com.subastas.model.entity.ImagenItem;
import com.subastas.model.entity.Item;
import com.subastas.model.entity.Rematador;
import com.subastas.model.entity.Subasta;
import com.subastas.model.enums.Categoria;
import com.subastas.model.enums.EstadoItem;
import com.subastas.model.enums.EstadoSubasta;
import com.subastas.model.enums.Moneda;
import com.subastas.repository.ItemRepository;
import com.subastas.repository.RematadorRepository;
import com.subastas.repository.SubastaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Seeder idempotente: copia imágenes de seed al disco, agrega ImagenItem a ítems
 * existentes sin fotos y crea subastas extra si aún no existen.
 * Corre en cada arranque (perfil !prod) sin borrar usuarios ni consignaciones.
 */
@Slf4j
@Component
@Profile("!prod")
@Order(100)
@RequiredArgsConstructor
public class CatalogSeedService implements CommandLineRunner {

    private static final String SEED_IMAGE_URL_PREFIX = "/uploads/seed/items/";

    private static final Map<String, String> ITEM_IMAGES = new LinkedHashMap<>();

    static {
        ITEM_IMAGES.put("P-001", "p-001.jpg");
        ITEM_IMAGES.put("P-002", "p-002.jpg");
        ITEM_IMAGES.put("P-003", "p-003.jpg");
        ITEM_IMAGES.put("P-004", "p-004.jpg");
        ITEM_IMAGES.put("P-005", "p-005.jpg");
        ITEM_IMAGES.put("P-006", "p-006.jpg");
        ITEM_IMAGES.put("P-007", "p-007.jpg");
        ITEM_IMAGES.put("P-008", "p-008.jpg");
    }

    private static final String TITULO_RELOJES = "Subasta de Relojes y Joyas - Premium";
    private static final String TITULO_DEPORTIVOS = "Subasta Coleccionables Deportivos";
    private static final String TITULO_ORO = "Subasta Exclusiva ORO - Arte Internacional";

    private final ItemRepository itemRepository;
    private final SubastaRepository subastaRepository;
    private final RematadorRepository rematadorRepository;

    @Value("${app.uploads.base-path:uploads}")
    private String uploadsBasePath;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        copySeedImagesToDisk();
        seedItemImages();
        seedExtraSubastas();
    }

    private void copySeedImagesToDisk() throws IOException {
        Path targetDir = Paths.get(uploadsBasePath, "seed", "items");
        Files.createDirectories(targetDir);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:seed-images/*.jpg");

        for (Resource resource : resources) {
            if (!resource.isReadable()) continue;
            String filename = resource.getFilename();
            if (filename == null) continue;
            Path target = targetDir.resolve(filename);
            if (Files.exists(target) && Files.size(target) > 0) continue;
            try (InputStream in = resource.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            log.debug("Imagen seed copiada: {}", target);
        }
    }

    private void seedItemImages() {
        for (Map.Entry<String, String> entry : ITEM_IMAGES.entrySet()) {
            ensureItemImage(entry.getKey(), entry.getValue());
        }
    }

    private void ensureItemImage(String numeroPieza, String filename) {
        Optional<Item> optional = itemRepository.findByNumeroPiezaWithImagenes(numeroPieza);
        if (optional.isEmpty()) return;

        Item item = optional.get();
        if (item.getImagenes() != null && !item.getImagenes().isEmpty()) return;

        String url = SEED_IMAGE_URL_PREFIX + filename;
        ImagenItem imagen = ImagenItem.builder()
                .url(url)
                .orden(1)
                .descripcion("Imagen principal")
                .item(item)
                .build();
        item.getImagenes().add(imagen);
        itemRepository.save(item);
        log.info("Imagen agregada al ítem {} → {}", numeroPieza, url);
    }

    private void seedExtraSubastas() {
        Rematador rematador = rematadorRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> rematadorRepository.save(Rematador.builder()
                        .nombre("Carlos")
                        .apellido("Martini")
                        .email("rematador@subastas.com")
                        .matricula("MAT-001")
                        .build()));

        if (subastaRepository.findByTitulo(TITULO_RELOJES).isEmpty()) {
            Subasta subasta = subastaRepository.save(Subasta.builder()
                    .titulo(TITULO_RELOJES)
                    .descripcion("Relojes suizos, joyas vintage y piezas de alta gama")
                    .fechaInicio(LocalDateTime.now().minusHours(2))
                    .fechaFin(LocalDateTime.now().plusDays(5))
                    .categoria(Categoria.COMUN)
                    .moneda(Moneda.ARS)
                    .estado(EstadoSubasta.ABIERTA)
                    .ubicacion("Salón Libertador, Recoleta, CABA")
                    .rematador(rematador)
                    .build());

            createItem("P-004", "Reloj automático Omega Seamaster - caja acero", new BigDecimal("950000.00"),
                    subasta, true, "Omega");
            createItem("P-005", "Collar de perlas naturales - broche oro 18k", new BigDecimal("320000.00"),
                    subasta, false, null);
            createItem("P-006", "Anillo de esmeralda colombiana - 2.5 quilates", new BigDecimal("780000.00"),
                    subasta, false, null);
            log.info("Subasta seed creada: {}", TITULO_RELOJES);
        }

        if (subastaRepository.findByTitulo(TITULO_DEPORTIVOS).isEmpty()) {
            Subasta subasta = subastaRepository.save(Subasta.builder()
                    .titulo(TITULO_DEPORTIVOS)
                    .descripcion("Camisetas firmadas, zapatillas limited edition y memorabilia")
                    .fechaInicio(LocalDateTime.now().plusDays(3))
                    .fechaFin(LocalDateTime.now().plusDays(10))
                    .categoria(Categoria.ESPECIAL)
                    .moneda(Moneda.USD)
                    .estado(EstadoSubasta.PROXIMA)
                    .ubicacion("Estadio Monumental, Buenos Aires")
                    .rematador(rematador)
                    .build());

            createItem("P-007", "Zapatillas Nike Air Jordan 1 Retro - edición limitada", new BigDecimal("2500.00"),
                    subasta, false, null);
            createItem("P-008", "Pelota firmada Copa América 2024 - con certificado", new BigDecimal("1800.00"),
                    subasta, false, null);
            log.info("Subasta seed creada: {}", TITULO_DEPORTIVOS);
        }

        if (subastaRepository.findByTitulo(TITULO_ORO).isEmpty()) {
            Subasta subasta = subastaRepository.save(Subasta.builder()
                    .titulo(TITULO_ORO)
                    .descripcion("Obras maestras de colecciones privadas, acceso restringido a categoría ORO")
                    .fechaInicio(LocalDateTime.now().minusHours(1))
                    .fechaFin(LocalDateTime.now().plusDays(5))
                    .categoria(Categoria.ORO)
                    .moneda(Moneda.USD)
                    .estado(EstadoSubasta.ABIERTA)
                    .ubicacion("Galería Internacional, Puerto Madero, CABA")
                    .rematador(rematador)
                    .build());

            createItem("P-009", "Óleo sobre tela - Retrato cubista atribuido a taller europeo", new BigDecimal("15000.00"),
                    subasta, true, "Anónimo (escuela europea)");
            log.info("Subasta seed creada: {}", TITULO_ORO);
        }
    }

    private void createItem(String numeroPieza, String descripcion, BigDecimal precioBase,
                            Subasta subasta, boolean esObraArte, String artista) {
        if (itemRepository.findByNumeroPiezaWithImagenes(numeroPieza).isPresent()) return;

        String filename = ITEM_IMAGES.get(numeroPieza);
        Item item = Item.builder()
                .numeroPieza(numeroPieza)
                .descripcion(descripcion)
                .precioBase(precioBase)
                .estado(EstadoItem.EN_SUBASTA)
                .duenioActual("Consignante verificado")
                .esObraArte(esObraArte)
                .artista(artista)
                .ubicacionFisica("Depósito Central - Av. Industria 4500, Dock Sud")
                .subasta(subasta)
                .build();

        if (filename != null) {
            item.getImagenes().add(ImagenItem.builder()
                    .url(SEED_IMAGE_URL_PREFIX + filename)
                    .orden(1)
                    .descripcion("Imagen principal")
                    .item(item)
                    .build());
        }

        itemRepository.save(item);
    }
}
