# Diagnóstico del Sistema de Subastas

> Fecha: 2026-05-27  
> Alcance: backend Spring Boot — revisión contra context.md

---

## Estado general

El sistema cubre la mayoría de los flujos pedidos por la consigna: registro en 2 pasos, conexión a subasta con validación de categoría y medio de pago, pujas concurrentes con lock, cierre automático con creación de Compra, chat post-subasta, consignaciones, incumplimientos con multa, y derivación a justicia.

Hay **3 bugs de lógica** que permiten operaciones que la consigna prohíbe, **3 funcionalidades faltantes** respecto a requisitos explícitos, y **5 mejoras menores** de calidad de código.

La arquitectura en capas es limpia, la seguridad JWT funciona, la concurrencia de pujas está bien resuelta, y hay 53 tests de integración pasando.

---

## Errores y bugs

### BUG-01 — Puja acepta ítems de otra subasta | CRÍTICO

- **Dónde:** `PujaService.java:96`, método `procesarPuja()`
- **Qué pasa:** `itemRepository.findByIdWithLock(request.getItemId())` busca el ítem por ID global sin verificar que pertenezca a la subasta recibida por parámetro. Un usuario conectado a la subasta 1 podría enviar el `itemId` de un ítem de la subasta 2 y la puja se registraría.
- **Por qué es problema:** Viola la integridad del dominio. Permite manipular ítems de subastas ajenas.
- **Cómo resolverlo:**
  ```java
  if (!item.getSubasta().getId().equals(subastaId)) {
      throw new BusinessException(ErrorCodes.RECURSO_NO_ENCONTRADO,
              "El ítem no pertenece a esta subasta", HttpStatus.BAD_REQUEST);
  }
  ```

---

### BUG-02 — Puja no valida que el ítem esté EN_SUBASTA | CRÍTICO

- **Dónde:** `PujaService.java:96`, método `procesarPuja()`
- **Qué pasa:** No hay check de `item.getEstado() == EstadoItem.EN_SUBASTA`. Se podría pujar sobre un ítem en estado DISPONIBLE o VENDIDO.
- **Por qué es problema:** Permite pujar por ítems que no están activos. En el DataLoader, el ítem P-002 está en DISPONIBLE — se podría pujar por él.
- **Cómo resolverlo:**
  ```java
  if (item.getEstado() != EstadoItem.EN_SUBASTA) {
      throw new BusinessException(ErrorCodes.ESTADO_INVALIDO,
              "El ítem no está en subasta activa", HttpStatus.BAD_REQUEST);
  }
  ```

---

### BUG-03 — Cierre sin puja no crea Compra para la empresa | CRÍTICO

- **Dónde:** `SubastaService.java:279-281`, método `cerrarSubasta()`
- **Qué pasa:** Cuando un ítem cierra sin pujas (`mejorPostor == null`), el código pone el ítem en `DISPONIBLE`. La consigna dice: *"Si nadie puja, la empresa compra el ítem al precio base"*.
- **Por qué es problema:** Contradice directamente una regla de negocio de la consigna. El ítem queda sin vender en vez de ser adquirido por la empresa.
- **Cómo resolverlo:** En el branch `else` (línea 279), marcar el ítem como `VENDIDO` y crear una Compra con `usuario = null` (o un usuario "empresa", lo que consideres que sea ideal y mas simple), `montoOfertado = precioBase`, `estadoPago = PAGADO`.

---

### BUG-04 — DataLoader no setea fechaFin en subastas | IMPORTANTE

- **Dónde:** `DataLoader.java:120-131` (subasta1) y `184-193` (subasta2)
- **Qué pasa:** Ninguna subasta tiene `fechaFin`. El scheduler busca subastas con `fechaFin <= now`. Sin fechaFin, las subastas ABIERTAS nunca se cierran automáticamente.
- **Por qué es problema:** Los datos de prueba no permiten testear el flujo de cierre automático.
- **Cómo resolverlo:** Agregar `.fechaFin(LocalDateTime.now().plusHours(2))` al builder de subasta1.

---

### BUG-05 — Posible multa duplicada por race condition | MENOR

- **Dónde:** `IncumplimientoService.java:44-74`, método `procesarComprasVencidas()`
- **Qué pasa:** Si se ejecuta dos veces rápido (antes del commit), ambas ejecuciones ven la compra como PENDIENTE y ambas generarían multa. En la práctica el scheduler tiene `fixedDelay = 5min` así que es poco probable, pero no hay protección explícita.
- **Cómo resolverlo:** Verificar que la compra no tenga ya una multa asociada antes de crear una nueva.

---

## Faltantes respecto a la consigna

### FALTA-01 — Sin validación de monto acumulado de cheques certificados | CRÍTICO

- **Dónde:** `PujaService.java` (al pujar) y `SubastaService.java` (al conectar)
- **Qué dice la consigna:** *"Los cheques tienen un monto máximo; las compras del usuario no pueden superar ese monto acumulado."*
- **Qué pasa:** El campo `montoLimite` existe en `MedioPago.java` para `CHEQUE_CERTIFICADO`, pero nunca se valida. Un usuario con cheque de $100.000 podría ganar ítems por $500.000.
- **Cómo resolverlo:** Al pujar, si el medio de pago es `CHEQUE_CERTIFICADO`, sumar las compras PENDIENTES del usuario con ese medio de pago y verificar que `sumaCompromisos + montoPuja <= medioPago.getMontoLimite()`.

---

### FALTA-02 — Sin mensaje automático de chat al crear la Compra | IMPORTANTE

- **Dónde:** `SubastaService.java:244-256`, método `cerrarSubasta()`
- **Qué dice la consigna:** *"Al ganar un ítem, se abre automáticamente un chat entre el ganador y la empresa."*
- **Qué pasa:** La Compra se crea pero no se genera un mensaje inicial que informe al ganador del desglose, plazos, y opciones de entrega. El usuario tiene que descubrir el chat por su cuenta.
- **Cómo resolverlo:** Después de `compraRepository.save(compra)`, crear un `MensajeChat` con `remitente = EMPRESA` y contenido dinámico con los valores reales de la compra. En ese punto `SubastaService` ya tiene todo disponible: `item.descripcion`, `montoOfertado`, `comisiones`, `costoEnvio`, `total`. Solo requiere inyectar `MensajeChatRepository` en `SubastaService` y hacer el save. Estructura del mensaje:
  ```
  ¡Felicitaciones {Usuario}! Ganaste el ítem "{item.descripcion}" en la subasta.

  Resumen de tu compra:
    • Monto ofertado:  ${montoOfertado}
    • Comisiones:      ${comisiones}
    • Costo de envío:  ${costoEnvio}
    • Total a pagar:   ${total}

  Tenés 72 horas para completar el pago.

  Por este chat podés coordinar:
    • Modalidad de entrega: envío a domicilio (incluido) o retiro personal
    • Ampliación de la cobertura del seguro del bien
  ```

---

### FALTA-03 — Sin revisión automática de consignaciones | IMPORTANTE

- **Dónde:** `ConsignacionService.java` — `crear()` guarda en `PENDIENTE_REVISION` y no hace nada más
- **Qué dice la consigna:** *"La empresa acepta o rechaza la consignación, propone valor base y comisiones."*
- **Qué pasa:** El enum `EstadoConsignacion` tiene los estados correctos (`PENDIENTE_REVISION` → `ACEPTADA` o `RECHAZADA`), pero no hay lógica para hacer esa transición. Los datos de prueba ponen consignaciones directamente en `ACEPTADA` para bypassear esto.
- **Decisión:** Implementar igual que el mock de verificación de identidad — un `MockRevisionConsignacionService` con `@Async` que espera 3 segundos y pasa la consignación a `ACEPTADA` con `valorBase = precioSugerido` (o 1000 por defecto) y `comisiones = valorBase × 0.10`. Se llama desde `crear()` tras el save. No requiere endpoint adicional ni rol ADMIN.
- **Cómo resolverlo:**
  1. Crear `MockRevisionConsignacionService` con `@Async` + `Thread.sleep(3000)` + transición de estado
  2. Inyectarlo en `ConsignacionService` y llamarlo al final de `crear()`
  3. Actualizar el DataLoader para que las consignaciones de prueba arranquen en `PENDIENTE_REVISION` (el mock las pasará a `ACEPTADA` solas)

---

## Over-engineering

No se detectaron casos de over-engineering. Las simplificaciones documentadas en `SIMPLIFICACIONES.md` fueron bien aplicadas: se eliminaron 10 archivos, 2 dependencias, y 6 endpoints que no respondían a la consigna. La arquitectura restante es proporcional al alcance del TP.

---

## Mejoras simples

### MEJORA-01 — IOException envuelta en RuntimeException genérica | MENOR

- **Dónde:** `ConsignacionService.java:104`
- **Qué pasa:** `throw new RuntimeException("Error al guardar foto...")` pierde el tipo de error y no usa el sistema de `BusinessException` del proyecto.
- **Cómo resolverlo:** Cambiar a `throw new BusinessException("ERROR_INTERNO", "Error al guardar foto de consignación", HttpStatus.INTERNAL_SERVER_ERROR)`.

---

### MEJORA-02 — N+1 en listado de subastas por countBySubasta | MENOR

- **Dónde:** `SubastaService.java:325`, método `mapToResponse()`
- **Qué pasa:** Por cada subasta del listado se ejecuta un `SELECT COUNT(*)` para obtener `totalItems`. Con 10 subastas serían 10 queries extra.
- **Cómo resolverlo:** Para un TP con 2-3 subastas no es grave, pero se podría resolver con un fetch join o projection en la query.

---

### MEJORA-03 — Métodos read-only sin @Transactional(readOnly = true) | MENOR

- **Dónde:** `SubastaService.listar()`, `.obtener()`, `.obtenerEstadoPuja()`, `.obtenerCatalogo()`, `CompraService.obtenerCompra()`
- **Qué pasa:** Métodos que solo leen datos no marcan `readOnly = true`. Hibernate podría hacer dirty-checking innecesario.
- **Cómo resolverlo:** Agregar `@Transactional(readOnly = true)`.

---

### MEJORA-04 — Ítem P-002 en DISPONIBLE dentro de subasta ABIERTA | MENOR

- **Dónde:** `DataLoader.java:169-181`
- **Qué pasa:** El ítem P-002 está en la subasta ABIERTA pero en estado `DISPONIBLE`. Genera un escenario inconsistente.
- **Cómo resolverlo:** Cambiar a `EstadoItem.EN_SUBASTA`.

---

### MEJORA-05 — AuthService.guardarArchivoDni permite null silencioso | MENOR

- **Dónde:** `AuthService.java:143`
- **Qué pasa:** Si `archivo == null || archivo.isEmpty()` retorna `null`. El usuario queda sin foto de DNI y el registro sigue. La consigna dice que las fotos de DNI son parte del paso 1.
- **Cómo resolverlo:** Lanzar `BusinessException` en vez de retornar null si las fotos son obligatorias.

---

## Inconsistencias

### INCON-01 — ESTADO_INVALIDO reutilizado para 5+ errores distintos | MENOR

- **Dónde:** `ErrorCodes.ESTADO_INVALIDO` usado en:
  - `SubastaService.conectar():123` — moneda no coincide
  - `ChatService.confirmarEntrega():74` — entrega ya confirmada
  - `ChatService.confirmarEntrega():82` — dirección faltante
  - `ConsignacionService.crear():69` — tipo de archivo inválido
  - `ConsignacionService.crear():73` — tamaño de foto excedido
  - `ConsignacionService.obtenerConsignacionParaDecision():154` — estado incorrecto
- **Por qué es problema:** El frontend no puede distinguir estos errores programáticamente.
- **Cómo resolverlo:** Crear constantes específicas: `MONEDA_NO_COINCIDE`, `ARCHIVO_INVALIDO`, `ARCHIVO_MUY_GRANDE`, `ENTREGA_YA_CONFIRMADA`, `DIRECCION_REQUERIDA`.

---

## Lo que está bien

- **Concurrencia de pujas:** `ReentrantLock` por subasta + `PESSIMISTIC_WRITE` en el ítem. Patrón sólido.
- **Registro en 2 pasos:** Flujo completo con token, validación de unicidad, y mock de verificación externa con delay de 3s. Correcto según consigna.
- **JWT y seguridad:** Filter chain, rutas públicas/privadas, manejo de usuario bloqueado. Sin vulnerabilidades evidentes.
- **WebSocket STOMP:** Broadcast de pujas, confirmación individual, cierre notificado. Implementación limpia.
- **Tests de integración:** 53 tests cubriendo auth, subastas, chat, consignaciones, incumplimientos, seguridad, y WebSocket.
- **Simplificaciones documentadas:** `SIMPLIFICACIONES.md` con 9 decisiones justificadas. Demuestra criterio.
- **Arquitectura en capas:** Controller → Service → Repository sin atajos. DTOs de response en los controllers, entidades solo en services.
- **Manejo de errores:** `GlobalExceptionHandler` consistente, `BusinessException` con códigos y HTTP status.
- **Chat post-subasta:** Flujo de entrega, toggle de seguro, mensaje automático al confirmar modalidad.
- **Scheduler de incumplimientos:** Detección de compras vencidas, multa del 10%, bloqueo de usuario. Flujo completo.
