# Estado del TP — Evaluación para DA1
**Fecha:** 2026-06-06 (actualizado 2026-06-07 tras completar TAREA 2, 3, 6 y 7 de PLAN-ENTREGA-FINAL.md; actualizado 2026-06-10 tras fixes de QA adicionales; actualizado 2026-06-11 tras completar TAREA 4 — ver §0)  
**Fuente:** AUDIT-V2.md, AUDIT-V3.md, AUDIT-GAPS.md, PLAN-INTEGRACION.md, context.md, endpoints.md, auditoria-backend.md, SIMPLIFICACIONES.md, PLAN-ENTREGA-FINAL.md

---

## 0. Actualizaciones recientes

### 2026-06-11 — TAREA 4 completada (confirmación de modalidad de entrega en chat)

- **TAREA 4 completada:** `ChatDetailScreen` permite confirmar `modalidadEntrega` (`ENVIO_DOMICILIO` / `RETIRO_PERSONAL`) vía `PATCH /compras/{id}/entrega`. Si la compra no tiene modalidad confirmada, se muestra una card fija arriba de los mensajes con dos botones; al elegir uno se llama `chatService.confirmDelivery()` y la card se reemplaza por un chip informativo ("Entrega: ..."). Si ya estaba confirmada, se muestra directamente el chip.
- **Fix de QA:** se agregó `notify()` a `utils/confirm.ts` (no existía como helper centralizado, solo duplicado localmente en `FinesScreen.tsx`) para mostrar errores sin usar `Alert.alert` (no-op en web).
- **Cleanup:** se eliminó el fallback muerto `route.params?.conversationId` en `ChatDetailScreen` — `ChatDetail` nunca recibió ese param (solo `purchaseId`).
- Probado end-to-end con `juan@test.com`: compraId=1 ("Mercado de Abasto", `modalidadEntrega=null`) muestra la card de selección; compraId=2 ("Escritorio inglés...", `modalidadEntrega=ENVIO_DOMICILIO`) muestra el chip directo.

Detalle completo en TAREA 4 de `PLAN-ENTREGA-FINAL.md`.

### 2026-06-10 — TAREA 9 completada y fixes de QA adicionales

- **TAREA 9 completada — el ciclo de consignación cierra end-to-end:** al aceptar las condiciones de una consignación, un mock asíncrono (`MockRevisionConsignacionService.asignarSubasta`, delay 3s) crea la `Subasta`/`Item` correspondiente y los vincula vía `subastaAsignada`. `MyAuctionsScreen` navega con el `subastaId` correcto y `HomeScreen` recarga al volver a foco para mostrar la subasta recién creada.
- **Bug crítico de arranque resuelto:** con una base de datos vacía, la app no arrancaba (`ConstraintViolationException` por un `Rematador` duplicado, debido a un conflicto de orden entre `DataLoader` y `CatalogSeedService`). Habría sido el primer obstáculo para cualquier corrector que clonara el repo y levantara el proyecto desde cero. Corregido con `@Order(0)` en `DataLoader.java`.
- **Comisión de consignación corregida:** `UploadItemScreen` mostraba 8% cuando el backend calcula 10%.
- **Chat con datos reales:** el header de `ChatDetailScreen` ya no muestra "Marvin McKinney" / "Reloj vintage" hardcodeados — usa la descripción real del ítem (vía navegación desde `ChatListScreen`) y un fallback de vendedor.

Detalle completo en "Fixes adicionales encontrados en QA (2026-06-10)" en `PLAN-ENTREGA-FINAL.md`.

---

## 1. Flujos completamente implementados end-to-end

Estos funcionan de punta a punta, backend y frontend conectados:

- **Login** — POST /auth/login → JWT → navegación a Home
- **Registro** — 2 pasos completos (con dev-bypass documentado para el token de email; funcional en la práctica)
- **Ver subastas** — HomeScreen → GET /subastas → lista real, filtrada por categoría del usuario
- **Ver detalle de subasta + catálogo** — LotDetailScreen → GET /subastas/{id} + GET /subastas/{id}/catalogo
- **Pujar en tiempo real** — AuctionDetailScreen → conectar, WebSocket STOMP, BID_UPDATED/CONFIRMED/REJECTED, bloqueo si ya sos el mejor postor, AUCTION_CLOSED, historial de pujas (vivo + `GET /subastas/{id}/pujas` al montar, vía `BidHistoryRow`)
- **Error accionable por multa pendiente al pujar** — si el rechazo de la puja viene con `motivo: "MULTA_PENDIENTE"`, se muestra un modal explicando la causa con botón "Ver multas" que navega directo a la pantalla de multas
- **Perfil de usuario** — GET /usuarios/perfil, status bloqueado detectado, edición de dirección
- **Medios de pago** — agregar (RegisterStep3 + AddCardScreen) y eliminar (PaymentMethodsScreen), todo conectado a la API real
- **Consignar un ítem** — UploadItemScreen → POST /consignaciones → aparece en MyAuctionsScreen
- **Ver mis consignaciones** — MyAuctionsScreen → GET /consignaciones con estados mapeados
- **Aceptar/rechazar condiciones de consignación → publicación del lote** — MyAuctionsScreen abre un modal con valorBase/comisiones/fecha de subasta cuando el ítem queda `approved_pending_lot`; "Aceptar"/"Rechazar" llaman a `consignService.acceptConditions/rejectConditions`. Al aceptar, un mock asíncrono (`MockRevisionConsignacionService.asignarSubasta`, delay 3s — TAREA 9) crea la `Subasta`/`Item` y los vincula (`subastaAsignada`); `MyAuctionsScreen` navega con `subasta.subastaId` y `HomeScreen` recarga al volver a foco (`useFocusEffect`) para mostrar la subasta nueva
- **Ver mis pujas** — MyBidsScreen → GET /usuarios/mis-pujas con estados ganada/perdida
- **Multas: listar y pagar** — FinesScreen lista las multas (monto, motivo, estado, fecha límite) vía `GET /usuarios/multas`; el botón "Pagar" abre un selector de medio de pago y llama `POST /usuarios/multas/{id}/pagar`; accesible desde Perfil → "Multas pendientes"
- **Chat** — ChatListScreen (compras) → ChatDetailScreen (GET/POST mensajes) — ambos extremos conectados
- **Confirmar modalidad de entrega (chat)** — `ChatDetailScreen` muestra una card para elegir `ENVIO_DOMICILIO`/`RETIRO_PERSONAL` (vía `PATCH /compras/{id}/entrega`, `chatService.confirmDelivery()`) si la compra no la tiene confirmada, o un chip informativo si ya está definida

---

## 2. Flujos parcialmente implementados (backend y frontend, pero con gaps)

- **Fotos en consignación** — la UI de `UploadItemScreen` tiene selector de fotos. La consigna exige mínimo 6. El backend dice "fotos opcionales". Se puede enviar una consignación sin fotos y el backend la acepta. Eso no cumple la especificación.

---

## 3. Flujos no implementados o bloqueados

| Flujo | Backend | Frontend |
|---|---|---|
| Aceptar condiciones de consignación | ✅ existe | ✅ existe (modal en MyAuctionsScreen) — end-to-end con TAREA 9 (mock asíncrono asigna `subastaAsignada` a los 3s) |
| Rechazar condiciones de consignación | ✅ existe | ✅ existe (mismo modal, con confirmación) |
| Ver ubicación del bien consignado | ❌ eliminado (SIMPLIFICACIONES §6) | ❌ no hay pantalla |
| Ver póliza de seguro del bien | ❌ eliminado (SIMPLIFICACIONES §6) | ❌ no hay pantalla |
| Pagar multas | ✅ existe | ✅ existe (FinesScreen, probado end-to-end) |
| Confirmar modalidad de entrega (chat) | ✅ existe | ✅ existe (card de selección + chip en `ChatDetailScreen`) |
| Métricas del usuario | ❌ eliminado (SIMPLIFICACIONES §6) | ❌ no hay pantalla |
| Historial de participaciones | ❌ eliminado (SIMPLIFICACIONES §6) | ❌ no hay pantalla |
| Historial de pujas de una subasta | ✅ existe | ✅ existe (`BidHistoryRow` en AuctionDetailScreen) |
| Detalle de ítem individual | ✅ existe | ❌ catalogService eliminado |
| Detalle de compra individual | ✅ existe | ❌ purchaseService eliminado |

---

## 4. Qué falta para "Aplicación completamente funcional según especificaciones"

### Crítico para el flujo de negocio

1. ~~**Pantalla de condiciones de consignación**~~ — ✅ Resuelto: modal en `MyAuctionsScreen` para aceptar/rechazar (ver §1) + **TAREA 9** resuelta en backend — al aceptar, `asignarSubasta()` crea la `Subasta`/`Item` y asigna `subastaAsignada` (mock asíncrono, 3s), por lo que `subastaId` deja de ser `null` y el ítem aceptado se puede abrir como lote publicado. El ciclo de consignación cierra end-to-end.

2. ~~**Pantalla de multas**~~ — ✅ Resuelto: `FinesScreen` lista las multas y permite pagarlas con un medio de pago existente; accesible desde Perfil. Probado end-to-end con un usuario de prueba (`carlos@test.com`).

3. ~~**Confirmar modalidad de entrega en chat**~~ — ✅ Resuelto: `ChatDetailScreen` muestra una card para elegir `ENVIO_DOMICILIO`/`RETIRO_PERSONAL` (o un chip si ya está confirmada), conectada a `PATCH /compras/{id}/entrega` vía `chatService.confirmDelivery()`. (TAREA 4 completada.)

### Definido en spec pero eliminado del backend

4. `GET /consignaciones/{id}/ubicacion` — la consigna dice "el usuario puede ver la ubicación del bien". Eliminado de backend y frontend.
5. `GET /consignaciones/{id}/poliza` — igual. Eliminado.
6. `GET /usuarios/metricas` — estadísticas del usuario. En `endpoints.md`. Eliminado.
7. `GET /usuarios/participaciones` — historial de subastas. En `endpoints.md`. Eliminado.

### Deuda técnica visible

8. ~~**Paso 8 pendiente**~~ — ✅ Resuelto: `DB_PASSWORD` y `JWT_SECRET` sin defaults en `application.properties`; `application-local.properties` en `.gitignore`.

---

## 5. Qué encontraría un corrector al probar la app

### Lo puede encontrar si mira el código

- `EMAIL_VERIFY_BYPASS = 'dev-bypass'` en `RegisterStep2Screen` — documentado, pero visible.

### Lo encuentra si prueba casos límite

- Consignación sin fotos — el formulario no exige mínimo 6 aunque la especificación lo pide.
- Historial de participaciones y métricas — no hay pantalla en ningún lado.

### El happy path funciona

El recorrido básico (registrarse → ver subastas → pujar → chatear y confirmar la modalidad de entrega, ver y pagar una multa, y consignar un ítem hasta verlo publicado como subasta) funciona sin problemas. Los problemas aparecen en cuanto se intenta ir más allá: ver estadísticas/historial de participaciones.
