# Plan: 8 Tareas antes de la entrega — DA1

## Contexto
Evaluación del ESTADO-TP.md determinó que el happy path funciona, pero hay flujos del TP incompletos que un corrector encontraría fácilmente. Este plan cubre las 8 tareas identificadas, en orden de menor a mayor impacto en archivos existentes.

---

## TAREA 1 — Credenciales en application.properties
**Estado: ✅ COMPLETADA**

`application.properties` usa `${DB_PASSWORD}` y `${JWT_SECRET}` sin defaults. `application-local.properties` existe y está en `.gitignore` del backend.

---

## TAREA 2 — Pantalla de multas
**Estado: ✅ COMPLETADA**

Implementado tal como lo definía el plan, con un ajuste y un fix adicional encontrado durante la verificación:

- `metricsService.ts`: `getFines()` → `GET /usuarios/multas` y `payFine(id, medioPagoId)` → `POST /usuarios/multas/{id}/pagar`
- `FinesScreen.tsx` (nueva): lista multas (monto, motivo, fecha límite, estado con badge), loading/error states, botón "Pagar" por multa `PENDIENTE`
- `ProfileScreen.tsx`: fila `ProfileMenuRow` "Multas pendientes" → navega a `'Fines'`. **Ajuste:** se muestra siempre (no condicionada a `pendingFines > 0`, porque ese campo no existe en `profileStore` — el backend expone `multasPendientes` pero el store no lo mapea; se decidió no tocar el store para esto)
- `ProfileStack.tsx` + `types/index.ts` + `screens/profile/index.ts`: ruta `Fines` registrada

**Fix encontrado en QA:** el plan proponía resolver el selector de medio de pago con `Alert.alert`, pero **`Alert.alert` no funciona en web** (no-op silencioso — la app corre con soporte web vía `app.json`, y el código ya tenía el workaround `utils/confirm.ts` con `window.confirm` para este mismo problema en otro lado). Se reemplazó por un `Modal` propio con lista de tarjetas seleccionables (mismo patrón que el modal de logout en `ProfileScreen`), funcional en mobile y web. También se agregó un helper `notify()` (equivalente a `confirmAction` pero para alertas informativas) para los mensajes "Sin medio de pago" / "No se pudo procesar el pago".

**Datos de prueba creados:** usuario `carlos@test.com` / `password123` con una multa `PENDIENTE` de $20.000 y dos tarjetas verificadas, para poder probar el flujo de pago end-to-end.

---

## TAREA 3 — Aceptar/rechazar condiciones de consignación
**Estado: ✅ YA IMPLEMENTADA — verificado en código, no hacer nada**

Al revisar el código (no solo lo que decía el plan original) se encontró que todo el "Qué hacer" ya está hecho en `MyAuctionsScreen.tsx`:
- `handleItemPress` (línea 160-163) abre el modal cuando `moderationStatus === 'approved_pending_lot'`
- El mapping (líneas 117-120) ya incluye `valorBase`, `comisiones`, `subastaId`, `fechaSubasta`
- `handleAcceptConditions`/`handleRejectConditions` (líneas 178-216) llaman a `consignService.acceptConditions`/`rejectConditions`, con `Alert` de confirmación al rechazar, `actionLoading` para el estado de carga, recarga de lista y cierre de modal
- El modal (líneas 286-322) muestra título, valorBase, comisiones, fecha de subasta y los botones "Aceptar"/"Rechazar"

Lo único que falta para que esto funcione end-to-end es **TAREA 9**: hasta que el backend arme el lote y vincule `subastaAsignada`, `subastaId` llega `null` y el flujo de "ítem publicado" no se puede abrir — pero el modal de condiciones en sí (que es lo que pedía esta tarea) ya está completo.

---

## TAREA 4 — Confirmar modalidad de entrega en chat
**Complejidad: Media | UI nueva dentro de ChatDetailScreen**

**Estado actual:**
- Backend: `PATCH /compras/{id}/entrega` espera `{ modalidadEntrega: 'ENVIO_DOMICILIO' | 'RETIRO_PERSONAL', direccionEnvio?: string }` ✅
- `PURCHASES.DELIVERY(id)` está en `endpoints.ts` ✅
- `CompraResponse` incluye `modalidadEntrega` (null si no se confirmó aún) ✅
- `chatService` no tiene `confirmDelivery()`
- `ChatDetailScreen` no tiene UI ni estado para entrega

**Qué hacer:**
1. `chatService.ts`: agregar `confirmDelivery(purchaseId, modalidadEntrega)` → `apiClient.patch(Endpoints.PURCHASES.DELIVERY(purchaseId), { modalidadEntrega })`
2. `ChatListScreen.tsx`: al navegar a `ChatDetail`, pasar `modalidadEntrega` de la compra como param adicional
3. `ChatDetailScreen.tsx`:
   - Leer `modalidadEntrega` de `route.params`
   - Estado local `deliveryMode` inicializado desde el param
   - Si `deliveryMode === null`: mostrar card fija arriba del chat con "Confirmá cómo querés recibir tu compra" + dos botones: "Envío a domicilio" / "Retiro personal"
   - Al seleccionar: llamar `chatService.confirmDelivery()`, actualizar `deliveryMode` local, ocultar card
   - Si `deliveryMode !== null`: mostrar chip informativo ("Entrega: Envío a domicilio") sin botones

**Archivos:**
- `front-end/src/services/chatService.ts`
- `front-end/src/screens/chat/ChatListScreen.tsx`
- `front-end/src/screens/chat/ChatDetailScreen.tsx`
- `front-end/src/types/index.ts` (agregar `modalidadEntrega` a params de ChatDetail si no está)

---

## TAREA 5 — Fotos mínimo 6 en consignación
**Estado: YA IMPLEMENTADO — no hacer nada**

`MIN_CONSIGNMENT_PHOTOS = 6` definida en `PhotoUploadGrid.tsx` línea 13. `UploadItemScreen` valida `photoCount >= MIN_CONSIGNMENT_PHOTOS` en `handleConfirm` y en la condición del botón. El botón está deshabilitado hasta tener 6 fotos.

---

## TAREA 6 — Historial de pujas en AuctionDetailScreen
**Estado: ✅ COMPLETADA**

`BID_HISTORY` en `endpoints.ts:29`, `getBidHistory()` en `auctionService.ts:102`, estado `bidHistory` en `AuctionDetailScreen` con carga al montar y actualización en cada `liveBid`. Las filas se renderizan via `BidHistoryRow`.

---

## TAREA 7 — Error accionable cuando hay multa pendiente
**Estado: ✅ COMPLETADA**

En `AuctionDetailScreen.tsx`, el `useEffect` que maneja `rejection` ahora distingue por `motivo`: si es `MULTA_PENDIENTE` abre un modal informativo ("Multa pendiente" / "Tenés multas pendientes. Debés pagarlas antes de pujar.") con botones "Cerrar" y "Ver multas" (este último navega a `Profile → Fines`, la ruta agregada en TAREA 2); para el resto de los motivos se mantiene el banner inline (`setBidError`) sin cambios.

**Ajuste sobre el plan:** la especificación original usaba `Alert.alert` para este caso, pero por el mismo problema detectado en TAREA 2 (`Alert.alert` es un no-op silencioso en web), se implementó como un `Modal` propio (mismo patrón que `ConfirmBidModal`), con estado `fineModalVisible` y estilos `fineModalStyles`. Así el flujo funciona igual en mobile y en web.

**Archivos:**
- `front-end/src/screens/auction/AuctionDetailScreen.tsx`

---

## TAREA 8 — Fotos de DNI en registro paso 1
**Estado: NO REQUIERE ACCIÓN**

El backend define `foto_dni_frente` y `foto_dni_dorso` como `required = false` en el controller (`@RequestPart(required = false)`). El registro funciona sin ellas. La spec simula verificación externa de todas formas.

---

## TAREA 9 — Asignación de lote/subasta a consignaciones aceptadas (backend)
**Complejidad: Media-Alta | Gap de backend descubierto al hacer TAREA 3**
**Estado: ❌ NO IMPLEMENTADO — bloquea que un ítem consignado llegue a estar realmente "publicado"**

**Hallazgo:**
Al probar la navegación desde `MyAuctionsScreen` a un ítem "publicado", se abría una subasta distinta a la esperada. La causa raíz: `MyAuctionsScreen` navegaba usando `consignacionId` en lugar de `subastaId` (esto ya se corrigió en el front, ver abajo). Pero al investigar de fondo, **`subastaId` siempre llega `null`** porque:

- `Consignacion.subastaAsignada` existe como campo, pero `setSubastaAsignada(...)` **nunca se invoca en ningún lugar del código** (ni en `ConsignacionService`, ni en `MockRevisionConsignacionService`, ni en `DataLoader`).
- `aceptarCondiciones()` solo cambia el estado a `EN_SUBASTA`, sin crear ni vincular ninguna `Subasta`/`Item`:
  ```java
  consignacion.setEstado(EstadoConsignacion.EN_SUBASTA);
  consignacion = consignacionRepository.save(consignacion);
  // subastaAsignada queda null para siempre
  ```

Es decir: **falta todo el proceso de "armar el lote"** — crear la `Subasta`/`Item` a partir de la consignación aceptada, asignarle categoría, y vincularla.

**Fix de front ya aplicado** (mientras se decide si se implementa esto):
- `MyAuctionsScreen.handleItemPress` ahora navega con `auction.subastaId` (no `consignacionId`) y solo navega si `subastaId` existe — así no abre una subasta equivocada. Pero hasta no resolver esta tarea, **ningún ítem consignado podrá abrirse como "publicado"** porque `subastaId` nunca se completa.

**Plan propuesto (a confirmar antes de implementar):**

1. **¿Cuándo se arma el lote?**
   - A) Inmediato dentro de `aceptarCondiciones()` (síncrono, más simple)
   - B) Mock asíncrono con delay (mismo patrón que `MockRevisionConsignacionService`, 3 seg) — más coherente con el mensaje actual *"El bien será incluido en la subasta"* y con el estilo mock ya usado en el proyecto — **recomendado**

2. **¿Cómo se asigna la categoría de la subasta/lote?**
   - Por rangos de `valorBase` (ej. `<10k → COMUN`, `<50k → ESPECIAL`, `<150k → PLATA`, `<500k → ORO`, `>=500k → PLATINO`) — umbrales arbitrarios a ajustar
   - O fija en `COMUN`, igual que se hace con usuarios nuevos (más simple)

3. **¿Subasta nueva por cada ítem, o agrupar?**
   - Crear una `Subasta` nueva por cada consignación aceptada (recomendado — simple, evita lógica de "buscar subasta compatible")
   - Alternativa (mencionada en `context.md` pero más compleja): agrupar varios ítems del mismo dueño en una subasta "colección"

4. **Datos a completar — varios YA están disponibles y no son mock puro (revisar antes de inventar valores):**
   - `Subasta.titulo`: el front manda `nombre` (nombre del artículo) dentro de `datos_adicionales` JSON — usable directo como título, no hace falta inventarlo
   - `Subasta.moneda`: el front SÍ pide moneda en `UploadItemScreen` y la manda dentro del JSON `datos_adicionales` como `{ moneda: ... }`, pero `Consignacion` solo guarda ese JSON crudo en `datosAdicionales` sin parsear — hay que parsear el JSON para extraer `moneda`, con `ARS` como fallback si falta o el parseo falla
   - `Subasta.rematador`: sí hace falta elegir uno existente — usar el mismo patrón que `CatalogSeedService` (`rematadorRepository.findAll().stream().findFirst()...`)
   - `Subasta.ubicacion`: no hay un campo de ubicación directo en `Consignacion`/`Usuario`/`datosAdicionales`; se podría tomar `consignacion.getDeposito().getDireccion()` si ya existe depósito asignado (ver bloqueador abajo), si no, valor por defecto
   - `Subasta.fechaInicio`/`fechaFin`: no hay dato real — se generan por math de fechas (ej. `now()` + N días), igual que en `CatalogSeedService`, no son "mock a inventar" sino defaults razonables
   - `Item.descripcion`: **YA EXISTE** — `Consignacion.descripcion` es el campo de descripción que cargó el usuario (el form tiene "Nombre del artículo" y "Descripción" como campos separados); no hace falta mock
   - `Item.precioBase = valorBase`: directo desde `Consignacion.valorBase`, sin mock
   - `Item.estado = EN_SUBASTA`: enum fijo, sin mock
   - `Item.duenioActual`: **YA EXISTE** — se puede armar desde `consignacion.getUsuario().getNombre()` + `getApellido()`; no hace falta mock genérico
   - `Item.fotos`: migrar `FotoConsignacion` (`url`, `orden`) → `ImagenItem` (`url`, `orden`, `descripcion`) — mapeo directo
   - `Item.poliza`/`ubicacionFisica`: el patrón correcto es `consignacion.getPoliza()`/`getDeposito()` (ya usado en `ConsignacionService` para `UbicacionResponse`), **pero ojo**: `Poliza`/`Deposito` nunca se asignan a la `Consignacion` en `crear()` ni en `MockRevisionConsignacionService` — están siempre `null`. Esto es un bloqueador adicional: hay que poblarlos antes (o crear defaults) para que esta parte funcione

5. **Vincular:** `consignacion.setSubastaAsignada(subasta)` y guardar — recién ahí `ConsignacionResponse.subastaId`/`fechaSubasta` llegan con datos reales.

**Archivos:**
- `backend/src/main/java/com/subastas/service/ConsignacionService.java` (o nuevo servicio espejo de `MockRevisionConsignacionService`)
- `backend/src/main/java/com/subastas/service/MockRevisionConsignacionService.java` (si se opta por B)

**Decisión pendiente:** confirmar las 4 preguntas de arriba antes de tocar código backend.

---

## Orden de ejecución

```
✅ TAREA 1  — Credenciales (completada)
✅ TAREA 3  — Condiciones consignación (ya implementada, verificado en código)
✅ TAREA 6  — Historial de pujas (completada)
✅ TAREA 2  — Multas (completada, habilitó TAREA 7)
✅ TAREA 7  — Error multa (completada)
   TAREA 9  — Asignación de lote/subasta (backend) — gap descubierto al verificar TAREA 3, decisión pendiente
   TAREA 4  — Entrega en chat
```

TAREA 3, 5 y 8: no hay nada que hacer.

---

## Verificación por tarea

| Tarea | Cómo verificar |
|---|---|
| 1 ✅ | Levantar backend sin env vars → falla al arrancar ✅ |
| 2 ✅ | Perfil → fila "Multas pendientes" → pantalla lista multas → botón Pagar abre modal de tarjetas → pago se procesa y la multa pasa a PAGADA ✅ (probado con `carlos@test.com`) |
| 3 ✅ | Consignar ítem → esperar mock 3s → MyAuctions muestra ACEPTADA → tap abre modal con valorBase/comisiones → Aceptar actualiza estado ✅ |
| 4 | Ganar un ítem → ir a chat → card de entrega visible → seleccionar opción → card desaparece, queda chip informativo |
| 6 ✅ | Abrir subasta activa → historial de pujas visible → pujar → nueva puja aparece al tope ✅ |
| 7 ✅ | Tener multa pendiente → intentar pujar → modal "Multa pendiente" con botón "Ver multas" → navega a FinesScreen ✅ |
| 9 | Aceptar condiciones de una consignación → `subastaId` deja de ser `null` → MyAuctions navega a la subasta correcta (no a una al azar) |
