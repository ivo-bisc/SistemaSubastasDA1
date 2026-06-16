package com.subastas.config;

import com.subastas.model.entity.*;
import com.subastas.model.enums.*;
import com.subastas.repository.*;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Carga datos de prueba al inicio de la aplicación en todos los perfiles excepto prod.
 * Popula dos usuarios (PLATA y ORO), sus medios de pago, un rematador,
 * una subasta ABIERTA con dos ítems y una subasta PROXIMA en USD.
 */
@Slf4j
@Component
@Profile("!prod")
@Order(0)
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final SubastaRepository subastaRepository;
    private final ItemRepository itemRepository;
    private final RematadorRepository rematadorRepository;
    private final PolizaRepository polizaRepository;
    private final ConsignacionRepository consignacionRepository;
    private final CompraRepository compraRepository;
    private final MensajeChatRepository mensajeChatRepository;
    private final PujaRepository pujaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) return;

        log.info("Cargando datos de prueba...");

        // Usuario administrador
        Usuario admin = Usuario.builder()
                .nombre("Admin")
                .apellido("Sistema")
                .email("admin@subastas.com")
                .password(passwordEncoder.encode("admin123"))
                .numeroDni("00000001")
                .domicilioLegal("Sede Central, CABA")
                .paisOrigen("Argentina")
                .categoria(Categoria.PLATINO)
                .estado(EstadoUsuario.APROBADO)
                .rol(RolUsuario.ADMIN)
                .telefono("+54 11 0000-0001")
                .build();
        usuarioRepository.save(admin);

        // Usuarios de prueba
        Usuario postor1 = Usuario.builder()
                .nombre("Juan")
                .apellido("Pérez")
                .email("juan@test.com")
                .password(passwordEncoder.encode("password123"))
                .numeroDni("12345678")
                .domicilioLegal("Av. Corrientes 1234, CABA")
                .paisOrigen("Argentina")
                .categoria(Categoria.PLATA)
                .estado(EstadoUsuario.APROBADO)
                .telefono("+54 11 1234-5678")
                .build();
        postor1 = usuarioRepository.save(postor1);

        Usuario postor2 = Usuario.builder()
                .nombre("María")
                .apellido("García")
                .email("maria@test.com")
                .password(passwordEncoder.encode("password123"))
                .numeroDni("87654321")
                .domicilioLegal("Palermo 567, CABA")
                .paisOrigen("Argentina")
                .categoria(Categoria.ORO)
                .estado(EstadoUsuario.APROBADO)
                .telefono("+54 11 8765-4321")
                .build();
        postor2 = usuarioRepository.save(postor2);

        // Usuario pendiente de aprobación (paso 2 completado, tokenEmail ya consumido)
        Usuario pendiente = Usuario.builder()
                .nombre("Carlos")
                .apellido("López")
                .email("pendiente@test.com")
                .password(passwordEncoder.encode("password123"))
                .numeroDni("11111111")
                .domicilioLegal("Mendoza 890, Rosario")
                .paisOrigen("Argentina")
                .categoria(null)
                .estado(EstadoUsuario.PENDIENTE_VERIFICACION)
                .rol(RolUsuario.POSTOR)
                .tokenEmail(null)
                .telefono("+54 341 111-2222")
                .build();
        usuarioRepository.save(pendiente);

        // Medios de pago
        MedioPago mp1 = MedioPago.builder()
                .tipo(TipoMedioPago.CUENTA_BANCARIA)
                .alias("Cuenta Principal")
                .moneda(Moneda.ARS)
                .verificado(true)
                .banco("Banco Nación")
                .numeroCuenta("001234567890")
                .tipoCuenta("nacional")
                .cbu("0110001000012345678902")
                .usuario(postor1)
                .build();
        mp1 = medioPagoRepository.save(mp1);

        MedioPago mp2 = MedioPago.builder()
                .tipo(TipoMedioPago.CUENTA_BANCARIA)
                .alias("Cuenta Corriente ARS")
                .moneda(Moneda.ARS)
                .verificado(true)
                .banco("Banco Galicia")
                .numeroCuenta("009876543210")
                .tipoCuenta("nacional")
                .cbu("0070009800098765432101")
                .usuario(postor2)
                .build();
        mp2 = medioPagoRepository.save(mp2);

        MedioPago mp3 = MedioPago.builder()
                .tipo(TipoMedioPago.TARJETA_CREDITO)
                .alias("Visa Internacional")
                .moneda(Moneda.USD)
                .verificado(true)
                .numeroTarjeta("4111111111111111")
                .titular("MARIA GARCIA")
                .vencimiento("12/27")
                .tipoTarjeta("internacional")
                .usuario(postor2)
                .build();
        medioPagoRepository.save(mp3);

        // Subasta de prueba - ABIERTA
        Rematador rematador = Rematador.builder()
                .nombre("Carlos")
                .apellido("Martini")
                .email("rematador@subastas.com")
                .matricula("MAT-001")
                .build();
        rematador = rematadorRepository.save(rematador);

        Subasta subasta1 = Subasta.builder()
                .titulo("Subasta de Arte Argentino - Lote 01")
                .descripcion("Colección de obras de artistas contemporáneos argentinos")
                .fechaInicio(LocalDateTime.now().minusHours(1))
                .fechaFin(LocalDateTime.now().plusDays(7))
                .categoria(Categoria.COMUN)
                .moneda(Moneda.ARS)
                .estado(EstadoSubasta.ABIERTA)
                .ubicacion("Centro Cultural Borges, CABA")
                .rematador(rematador)
                .build();
        subasta1 = subastaRepository.save(subasta1);

        // Pólizas de seguro
        Poliza poliza1 = Poliza.builder()
                .aseguradoraNombre("Seguros del Sur S.A.")
                .aseguradoraContacto("0800-555-0001")
                .valorAsegurado(new BigDecimal("75000.00"))
                .prima(new BigDecimal("1500.00"))
                .vigenciaDesde(LocalDate.now().minusMonths(1))
                .vigenciaHasta(LocalDate.now().plusMonths(11))
                .build();
        poliza1 = polizaRepository.save(poliza1);

        Poliza poliza2 = Poliza.builder()
                .aseguradoraNombre("Allianz Argentina")
                .aseguradoraContacto("0800-555-0002")
                .valorAsegurado(new BigDecimal("120000.00"))
                .prima(new BigDecimal("2400.00"))
                .vigenciaDesde(LocalDate.now().minusMonths(2))
                .vigenciaHasta(LocalDate.now().plusMonths(10))
                .build();
        poliza2 = polizaRepository.save(poliza2);

        // Ítems
        Item item1 = Item.builder()
                .numeroPieza("P-001")
                .descripcion("Óleo sobre tela - Paisaje pampeano - 80x60cm")
                .precioBase(new BigDecimal("50000.00"))
                .estado(EstadoItem.EN_SUBASTA)
                .duenioActual("Colección Privada")
                .esObraArte(true)
                .artista("Luis Fontana")
                .historia("Obra del período 1990-2000, técnica mixta")
                .ubicacionFisica("Depósito Central - Av. Industria 4500, Dock Sud")
                .poliza(poliza1)
                .subasta(subasta1)
                .build();
        itemRepository.save(item1);

        Item item2 = Item.builder()
                .numeroPieza("P-002")
                .descripcion("Escultura de bronce - Figura abstracta - 30cm")
                .precioBase(new BigDecimal("80000.00"))
                .estado(EstadoItem.EN_SUBASTA)
                .duenioActual("Galería Norte")
                .esObraArte(true)
                .artista("Ana Berlotti")
                .ubicacionFisica("Depósito Norte - Panamericana km 35, Pilar")
                .poliza(poliza2)
                .subasta(subasta1)
                .build();
        itemRepository.save(item2);

        // Pujas históricas en subasta1 / item1 — estado inicial para probar WebSocket
        // precioBase = 50.000 → min/max por puja: +500 / +10.000 sobre la mejor oferta anterior
        Puja puja1 = Puja.builder()
                .monto(new BigDecimal("51000.00"))
                .timestamp(LocalDateTime.now().minusMinutes(30))
                .usuario(postor1)
                .item(item1)
                .subasta(subasta1)
                .medioPago(mp1)
                .build();
        pujaRepository.save(puja1);

        Puja puja2 = Puja.builder()
                .monto(new BigDecimal("55000.00"))
                .timestamp(LocalDateTime.now().minusMinutes(20))
                .usuario(postor2)
                .item(item1)
                .subasta(subasta1)
                .medioPago(mp2)
                .build();
        pujaRepository.save(puja2);

        Puja puja3 = Puja.builder()
                .monto(new BigDecimal("58000.00"))
                .timestamp(LocalDateTime.now().minusMinutes(10))
                .usuario(postor1)
                .item(item1)
                .subasta(subasta1)
                .medioPago(mp1)
                .build();
        pujaRepository.save(puja3);

        // Subasta próxima
        Subasta subasta2 = Subasta.builder()
                .titulo("Subasta Especial USD - Colección Internacional")
                .descripcion("Obras y antigüedades de artistas internacionales")
                .fechaInicio(LocalDateTime.now().plusDays(7))
                .categoria(Categoria.ESPECIAL)
                .moneda(Moneda.USD)
                .estado(EstadoSubasta.PROXIMA)
                .ubicacion("Hotel Alvear, CABA")
                .build();
        subastaRepository.save(subasta2);

        // Consignación de Juan: empresa ya aceptó y propuso condiciones (estado PROPUESTA_ENVIADA)
        Consignacion consignacion1 = Consignacion.builder()
                .descripcion("Guitarra eléctrica Fender Stratocaster 1965 - estado original")
                .datosAdicionales("Incluye estuche original y certificado de autenticidad")
                .aceptaPertenencia(true)
                .estado(EstadoConsignacion.PROPUESTA_ENVIADA)
                .precioSugerido(new BigDecimal("450000.00"))
                .valorBase(new BigDecimal("420000.00"))
                .comisiones(new BigDecimal("21000.00"))
                .categoriaPropuesta(Categoria.ESPECIAL)
                .cuentaDestino(mp1)
                .subastaAsignada(subasta2)
                .usuario(postor1)
                .deposito(Deposito.builder()
                        .nombre("Depósito Central Subastas S.A.")
                        .direccion("Av. Industria 4500, Dock Sud, Avellaneda")
                        .latitud(-34.6692)
                        .longitud(-58.3494)
                        .fechaIngreso(LocalDateTime.now().minusDays(10))
                        .estadoFisico("Excelente — sin daños visibles, embalaje original")
                        .build())
                .poliza(Poliza.builder()
                        .aseguradoraNombre("La Caja Seguros S.A.")
                        .aseguradoraContacto("0800-999-2273")
                        .valorAsegurado(new BigDecimal("500000.00"))
                        .prima(new BigDecimal("8500.00"))
                        .vigenciaDesde(LocalDate.now().minusMonths(1))
                        .vigenciaHasta(LocalDate.now().plusMonths(11))
                        .build())
                .build();

        for (int i = 1; i <= 6; i++) {
            consignacion1.getFotos().add(FotoConsignacion.builder()
                    .url("uploads/consignaciones/fender-strat-foto-" + i + ".jpg")
                    .orden(i)
                    .consignacion(consignacion1)
                    .build());
        }
        consignacionRepository.save(consignacion1);

        // Consignación de María: pendiente de revisión por la empresa (sin depósito ni póliza aún)
        Consignacion consignacion2 = Consignacion.builder()
                .descripcion("Reloj de bolsillo Patek Philippe circa 1920 - oro 18k")
                .datosAdicionales("Funcionando correctamente, revisado por relojero certificado")
                .aceptaPertenencia(true)
                .estado(EstadoConsignacion.PENDIENTE_INSPECCION)
                .precioSugerido(new BigDecimal("1200000.00"))
                .cuentaDestino(mp3)
                .usuario(postor2)
                .build();

        for (int i = 1; i <= 8; i++) {
            consignacion2.getFotos().add(FotoConsignacion.builder()
                    .url("uploads/consignaciones/patek-foto-" + i + ".jpg")
                    .orden(i)
                    .consignacion(consignacion2)
                    .build());
        }
        consignacionRepository.save(consignacion2);

        // Consignación de Juan: rechazada por el admin
        Consignacion consignacion3 = Consignacion.builder()
                .descripcion("Bicicleta vintage Bianchi 1970 — cuadro restaurado")
                .aceptaPertenencia(true)
                .estado(EstadoConsignacion.RECHAZADO)
                .precioSugerido(new BigDecimal("85000.00"))
                .motivoRechazo("El bien no cumple con los requisitos mínimos de valor estimado para esta categoría de subasta.")
                .cuentaDestino(mp1)
                .usuario(postor1)
                .build();
        consignacionRepository.save(consignacion3);

        // Consignación de María: usuario aceptó la propuesta del admin
        Consignacion consignacion4 = Consignacion.builder()
                .descripcion("Piano Steinway & Sons — modelo B, circa 1945")
                .aceptaPertenencia(true)
                .estado(EstadoConsignacion.ACEPTADO_POR_USUARIO)
                .precioSugerido(new BigDecimal("3500000.00"))
                .valorBase(new BigDecimal("3200000.00"))
                .comisiones(new BigDecimal("320000.00"))
                .categoriaPropuesta(Categoria.ORO)
                .cuentaDestino(mp2)
                .usuario(postor2)
                .build();
        consignacionRepository.save(consignacion4);

        // Consignación de Juan: incluida en subasta (flujo completo aprobado)
        Consignacion consignacion5 = Consignacion.builder()
                .descripcion("Colección de 12 grabados originales — Xul Solar")
                .aceptaPertenencia(true)
                .estado(EstadoConsignacion.INCLUIDO_EN_SUBASTA)
                .precioSugerido(new BigDecimal("900000.00"))
                .valorBase(new BigDecimal("850000.00"))
                .comisiones(new BigDecimal("85000.00"))
                .categoriaPropuesta(Categoria.ESPECIAL)
                .subastaAsignada(subasta2)
                .cuentaDestino(mp1)
                .usuario(postor1)
                .build();
        consignacionRepository.save(consignacion5);

        // Subasta cerrada — para datos de compra y chat
        Subasta subasta3 = Subasta.builder()
                .titulo("Subasta Cerrada - Fotografía Latinoamericana")
                .descripcion("Obras de fotógrafos contemporáneos de América Latina")
                .fechaInicio(LocalDateTime.now().minusDays(14))
                .fechaFin(LocalDateTime.now().minusDays(7))
                .categoria(Categoria.COMUN)
                .moneda(Moneda.ARS)
                .estado(EstadoSubasta.CERRADA)
                .ubicacion("Galería Praxis, CABA")
                .rematador(rematador)
                .build();
        subasta3 = subastaRepository.save(subasta3);

        Item item3 = Item.builder()
                .numeroPieza("P-003")
                .descripcion("Fotografía en gelatina de plata - \"Mercado de Abasto\" - 40x50cm")
                .precioBase(new BigDecimal("30000.00"))
                .estado(EstadoItem.VENDIDO)
                .duenioActual("Colección Fernández")
                .esObraArte(true)
                .artista("Horacio Coppola")
                .historia("Copia vintage de 1936, tiraje limitado")
                .ubicacionFisica("Depósito Central - Av. Industria 4500, Dock Sud")
                .subasta(subasta3)
                .build();
        item3 = itemRepository.save(item3);

        // Juan ganó item3 — compra pendiente de pago
        BigDecimal montoOfertado = new BigDecimal("42000.00");
        BigDecimal comisiones    = new BigDecimal("4200.00");
        BigDecimal costoEnvio    = new BigDecimal("1500.00");
        Compra compra1 = Compra.builder()
                .item(item3)
                .usuario(postor1)
                .montoOfertado(montoOfertado)
                .comisiones(comisiones)
                .costoEnvio(costoEnvio)
                .total(montoOfertado.add(comisiones).add(costoEnvio))
                .moneda(Moneda.ARS)
                .medioPago(mp1)
                .estadoPago(EstadoPago.PENDIENTE)
                .fechaLimitePago(LocalDateTime.now().plusDays(3))
                .build();
        compra1 = compraRepository.save(compra1);

        // Conversación de coordinación de entrega
        mensajeChatRepository.save(MensajeChat.builder()
                .contenido("¡Felicitaciones! Ganaste \"Mercado de Abasto\" de Horacio Coppola por $42.000 ARS. " +
                           "El total a pagar es $47.700 (incluye comisión del 10% + envío). " +
                           "¿Preferís envío a domicilio o retiro personal en depósito?")
                .remitente(RemitenteMensaje.EMPRESA)
                .timestamp(LocalDateTime.now().minusDays(6))
                .compra(compra1)
                .usuario(postor1)
                .leido(true)
                .build());

        log.info("Datos de prueba cargados: 4 usuarios, 3 medios de pago, 3 subastas, 3 ítems, 3 pujas, 5 consignaciones, 1 compra, 1 mensaje de chat");
        log.debug("Login admin:     admin@subastas.com / admin123 (ADMIN, PLATINO)");
        log.debug("Login postor1:   juan@test.com / password123 (PLATA)");
        log.debug("Login postor2:   maria@test.com / password123 (ORO)");
        log.debug("Login pendiente: pendiente@test.com / password123 (PENDIENTE_VERIFICACION)");
        log.debug("Compra de prueba: juan@test.com ganó item3 (P-003) — compraId = 1");
    }
}
