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

El paso siguiente del ciclo (que el ítem aceptado se abra como lote "publicado") quedaba bloqueado porque el backend nunca armaba el lote ni vinculaba `subastaAsignada` — esto se resolvió en **TAREA 9** (ver más abajo), así que el flujo ahora cierra end-to-end.

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
**Estado: ✅ COMPLETADA**

**Hallazgo original:**
`Consignacion.subastaAsignada` existía como campo, pero `setSubastaAsignada(...)` nunca se invocaba: `aceptarCondiciones()` solo cambiaba el estado a `EN_SUBASTA` sin crear ni vincular ninguna `Subasta`/`Item`. Resultado: `subastaId` llegaba siempre `null` y un ítem consignado nunca podía abrirse como "publicado".

**Solución implementada:**
`aceptarCondiciones()` ahora dispara `MockRevisionConsignacionService.asignarSubasta(consignacionId)`:

- **Mock asíncrono** (`@Async @Transactional`, delay de 3 seg) — mismo patrón que el resto de los mocks del sistema, coherente con el mensaje *"El bien será incluido en la subasta"*.
- **Subasta nueva** (una por cada consignación aceptada, sin agrupar): `titulo`/`moneda` se parsean del JSON `datosAdicionales` (fallback `"Artículo en subasta"` / `Moneda.ARS` si falta o falla el parseo), `categoria = COMUN` (fija), `rematador` = primero existente (mismo patrón que `CatalogSeedService`), `ubicacion = "Depósito Central"`, `fechaInicio = +3 días`, `fechaFin = +10 días`, `estado = PROXIMA` (default).
- **Item nuevo**: `descripcion` y `precioBase` (= `valorBase`) desde la consignación, `estado = EN_SUBASTA`, `duenioActual` = nombre + apellido del usuario, `imagenes` mapeadas desde `FotoConsignacion` → `ImagenItem`. (`numeroPieza` queda `null` — campo nullable, sin impacto funcional.)
- **Vinculación**: se guarda la `Subasta`, se asocia el `Item` a esa subasta, y `consignacion.setSubastaAsignada(subasta)` — a partir de acá `ConsignacionResponse.subastaId`/`fechaSubasta` llegan con datos reales.

**Cambios de frontend relacionados:**
- `consignService.ts`: `moneda` se manda en mayúsculas (`params.currency?.toUpperCase()`) para matchear `Moneda.valueOf(...)`.
- `HomeScreen.tsx`: el listado de subastas se recarga con `useFocusEffect` (antes `useEffect`), para que la subasta creada por el mock (delay 3s) aparezca al volver a Home.
- `MyAuctionsScreen.handleItemPress`: ya navegaba con `subastaId` (no `consignacionId`) desde el fix previo de TAREA 3 — ahora ese `subastaId` llega poblado.

**Archivos:**
- `backend/src/main/java/com/subastas/service/ConsignacionService.java`
- `backend/src/main/java/com/subastas/service/MockRevisionConsignacionService.java`
- `front-end/src/services/consignService.ts`
- `front-end/src/screens/home/HomeScreen.tsx`

---

## Orden de ejecución

```
✅ TAREA 1  — Credenciales (completada)
✅ TAREA 3  — Condiciones consignación (ya implementada, verificado en código)
✅ TAREA 6  — Historial de pujas (completada)
✅ TAREA 2  — Multas (completada, habilitó TAREA 7)
✅ TAREA 7  — Error multa (completada)
✅ TAREA 9  — Asignación de lote/subasta (backend) — completada (mock asíncrono, ver sección dedicada)
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
| 9 ✅ | Aceptar condiciones de una consignación → esperar mock 3s → `subastaId` deja de ser `null` → MyAuctions/Home navegan a la subasta correcta (creada con título/moneda desde `datosAdicionales`, categoría COMUN, ítem con descripción/precioBase/imágenes) ✅ |

---

## Fixes adicionales encontrados en QA (2026-06-10)

Durante una sesión de QA posterior se encontraron y corrigieron 3 problemas no cubiertos por las tareas anteriores:

1. **Comisión incorrecta en `UploadItemScreen`** — `COMMISSION_PERCENT` estaba en `8`, pero el backend calcula 10% (`comisiones = valorBase × 0.10`, ver `context.md`). Corregido a `10`.

2. **Datos hardcodeados en el header del chat** — `ChatDetailScreen` mostraba siempre "Marvin McKinney" / "Reloj vintage" como nombre de vendedor e ítem. Ahora `ChatListScreen` pasa `itemDescripcion` real (de `item.item.descripcion`) por navegación, y `ChatDetailScreen` lo usa con fallback `'Artículo'`. No existe campo "vendedor" en ningún DTO del backend, así que el nombre usa fallback fijo `'Carlos Martini'` (el rematador mock del sistema).

3. **Bug crítico de arranque con DB vacía** — `DataLoader` (sin `@Order`) corría *después* de `CatalogSeedService` (`@Order(100)`). En una base vacía, `CatalogSeedService.seedExtraSubastas()` creaba primero un `Rematador` con email `rematador@subastas.com`, y luego `DataLoader` intentaba crear el mismo rematador → `ConstraintViolationException` (email único duplicado) → **la aplicación no arrancaba**. Esto nunca se había detectado porque `DataLoader` solo corre si `usuarios` está vacía, y la DB local nunca había sido recreada desde que se agregó `CatalogSeedService`. Corregido agregando `@Order(0)` a `DataLoader` para que corra primero. Verificado recreando la DB desde cero: ambos seeders corren sin error.

**Archivos:**
- `front-end/src/screens/consignment/UploadItemScreen.tsx`
- `front-end/src/screens/chat/ChatListScreen.tsx`
- `front-end/src/screens/chat/ChatDetailScreen.tsx`
- `backend/src/main/java/com/subastas/config/DataLoader.java`
