# Estado del TP — Evaluación para DA1
**Fecha:** 2026-06-06  
**Fuente:** AUDIT-V2.md, AUDIT-V3.md, AUDIT-GAPS.md, PLAN-INTEGRACION.md, context.md, endpoints.md, auditoria-backend.md, SIMPLIFICACIONES.md

---

## 1. Flujos completamente implementados end-to-end

Estos funcionan de punta a punta, backend y frontend conectados:

- **Login** — POST /auth/login → JWT → navegación a Home
- **Registro** — 2 pasos completos (con dev-bypass documentado para el token de email; funcional en la práctica)
- **Ver subastas** — HomeScreen → GET /subastas → lista real, filtrada por categoría del usuario
- **Ver detalle de subasta + catálogo** — LotDetailScreen → GET /subastas/{id} + GET /subastas/{id}/catalogo
- **Pujar en tiempo real** — AuctionDetailScreen → conectar, WebSocket STOMP, BID_UPDATED/CONFIRMED/REJECTED, bloqueo si ya sos el mejor postor, AUCTION_CLOSED, historial de pujas en vivo
- **Perfil de usuario** — GET /usuarios/perfil, status bloqueado detectado, edición de dirección
- **Medios de pago** — agregar (RegisterStep3 + AddCardScreen) y eliminar (PaymentMethodsScreen), todo conectado a la API real
- **Consignar un ítem** — UploadItemScreen → POST /consignaciones → aparece en MyAuctionsScreen
- **Ver mis consignaciones** — MyAuctionsScreen → GET /consignaciones con estados mapeados
- **Ver mis pujas** — MyBidsScreen → GET /usuarios/mis-pujas con estados ganada/perdida
- **Chat** — ChatListScreen (compras) → ChatDetailScreen (GET/POST mensajes) — ambos extremos conectados

---

## 2. Flujos parcialmente implementados (backend y frontend, pero con gaps)

- **Consignación post-aceptación** — el backend procesa automáticamente (mock 3s: PENDIENTE→ACEPTADA con valorBase y comisiones). `consignService.acceptConditions()` y `rejectConditions()` están implementados. Pero `MyAuctionsScreen` no tiene modal para mostrar las condiciones ni permite al usuario aceptar o rechazar. El flujo queda colgado después de la aceptación automática del mock.

- **Chat de entrega** — los mensajes van y vienen. Pero `PATCH /compras/{id}/entrega` (confirmar si el ganador quiere envío a domicilio o retiro personal) no tiene pantalla ni servicio conectado. El endpoint está definido en `endpoints.ts` como constante muerta.

- **Multas** — el backend las genera correctamente cuando corresponde (10% del valor ofertado). El perfil muestra `pendingFines` del response. Pero no hay pantalla para listar las multas ni para pagarlas. Un usuario con multa no puede pujar (el backend lo rechaza), pero la app no le explica por qué ni le da forma de resolverlo.

- **Fotos en consignación** — la UI de `UploadItemScreen` tiene selector de fotos. La consigna exige mínimo 6. El backend dice "fotos opcionales". Se puede enviar una consignación sin fotos y el backend la acepta. Eso no cumple la especificación.

---

## 3. Flujos no implementados o bloqueados

| Flujo | Backend | Frontend |
|---|---|---|
| Aceptar condiciones de consignación | ✅ existe | ❌ no hay pantalla |
| Rechazar condiciones de consignación | ✅ existe | ❌ no hay pantalla |
| Ver ubicación del bien consignado | ❌ eliminado (SIMPLIFICACIONES §6) | ❌ no hay pantalla |
| Ver póliza de seguro del bien | ❌ eliminado (SIMPLIFICACIONES §6) | ❌ no hay pantalla |
| Pagar multas | ✅ existe | ❌ no hay pantalla |
| Confirmar modalidad de entrega (chat) | ✅ existe | ❌ no hay pantalla |
| Métricas del usuario | ❌ eliminado (SIMPLIFICACIONES §6) | ❌ no hay pantalla |
| Historial de participaciones | ❌ eliminado (SIMPLIFICACIONES §6) | ❌ no hay pantalla |
| Historial de pujas de una subasta | ✅ existe | ❌ no hay pantalla |
| Detalle de ítem individual | ✅ existe | ❌ catalogService eliminado |
| Detalle de compra individual | ✅ existe | ❌ purchaseService eliminado |

---

## 4. Qué falta para "Aplicación completamente funcional según especificaciones"

### Crítico para el flujo de negocio

1. **Pantalla de condiciones de consignación** — el usuario sube un ítem, la empresa responde con valor base + comisiones, el usuario tiene que poder aceptar o rechazar. Sin esto el ciclo de consignación no cierra. Las pantallas no existen; el backend sí.

2. **Pantalla de multas** — la consigna dice explícitamente que el usuario ve sus multas y las paga. Sin esto, un usuario bloqueado por multa no tiene forma de salir de ese estado desde la app.

3. **Confirmar modalidad de entrega en chat** — el chat existe, pero la función principal del chat según la consigna (coordinar `ENVIO_DOMICILIO` vs `RETIRO_PERSONAL`) no tiene acción conectada.

### Definido en spec pero eliminado del backend

4. `GET /consignaciones/{id}/ubicacion` — la consigna dice "el usuario puede ver la ubicación del bien". Eliminado de backend y frontend.
5. `GET /consignaciones/{id}/poliza` — igual. Eliminado.
6. `GET /usuarios/metricas` — estadísticas del usuario. En `endpoints.md`. Eliminado.
7. `GET /usuarios/participaciones` — historial de subastas. En `endpoints.md`. Eliminado.

### Deuda técnica visible

8. ~~**Paso 8 pendiente**~~ — ✅ Resuelto: `DB_PASSWORD` y `JWT_SECRET` sin defaults en `application.properties`; `application-local.properties` en `.gitignore`.

---

## 5. Qué encontraría un corrector al probar la app

### Lo encuentra seguro

- **Consignación sin cerrar** — sube un ítem, ve que aparece en MyAuctions como "aceptada", intenta aceptar las condiciones y no hay ningún botón ni pantalla. Es el flujo de negocio central del módulo de consignación.
- **No puede pagar multas** — si se genera una multa, la app no la muestra ni deja pagarla. El usuario queda bloqueado para pujar sin explicación útil.
- **Chat sin entrega** — si gana un ítem y va al chat, puede escribir mensajes pero no puede confirmar cómo quiere recibirlo.

### Lo puede encontrar si mira el código

- `EMAIL_VERIFY_BYPASS = 'dev-bypass'` en `RegisterStep2Screen` — documentado, pero visible.

### Lo encuentra si prueba casos límite

- Consignación sin fotos — el formulario no exige mínimo 6 aunque la especificación lo pide.
- Historial de participaciones y métricas — no hay pantalla en ningún lado.

### El happy path funciona

El recorrido básico (registrarse → ver subastas → pujar → chatear) funciona sin problemas. Los problemas aparecen en cuanto se intenta ir más allá: cerrar el ciclo de consignación, manejar una multa, o ver estadísticas.
