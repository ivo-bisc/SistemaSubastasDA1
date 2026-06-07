# Plan: 8 Tareas antes de la entrega — DA1

## Contexto
Evaluación del ESTADO-TP.md determinó que el happy path funciona, pero hay flujos del TP incompletos que un corrector encontraría fácilmente. Este plan cubre las 8 tareas identificadas, en orden de menor a mayor impacto en archivos existentes.

---

## TAREA 1 — Credenciales en application.properties
**Estado: ✅ COMPLETADA**

`application.properties` usa `${DB_PASSWORD}` y `${JWT_SECRET}` sin defaults. `application-local.properties` existe y está en `.gitignore` del backend.

---

## TAREA 2 — Pantalla de multas
**Complejidad: Media | 1 pantalla nueva + 2 archivos existentes**

**Estado actual:**
- Backend: `GET /usuarios/multas` y `POST /usuarios/multas/{id}/pagar` implementados ✅
- `MultaResponse`: multaId, monto, motivo, fechaGeneracion, fechaLimitePago, estado, puedeParticiparNuevamente
- `METRICS.FINES` y `METRICS.PAY_FINE(id)` ya están en `endpoints.ts` ✅
- `metricsService.ts` NO tiene `getFines()` ni `payFine()`
- ProfileScreen no tiene fila de navegación a multas

**Qué hacer:**
1. `metricsService.ts`: agregar `getFines()` → `apiClient.get(Endpoints.METRICS.FINES)` y `payFine(id, medioPagoId)` → `apiClient.post(Endpoints.METRICS.PAY_FINE(id), { medioPagoId })`
2. Crear `front-end/src/screens/profile/FinesScreen.tsx`:
   - Llama `metricsService.getFines()` al montar
   - Lista multas con monto, motivo, fecha límite, estado
   - Por cada multa PENDIENTE: botón "Pagar" que abre `Alert` con selector de medio de pago (cards del profileStore) → llama `payFine()`
   - Loading state + error state
3. `ProfileScreen.tsx`: agregar `ProfileMenuRow` "Multas pendientes" solo visible si `pendingFines > 0`, navega a `'Fines'`
4. Agregar `FinesScreen` al `ProfileStack` (navigator + ParamList)

**Archivos:**
- `front-end/src/services/metricsService.ts`
- `front-end/src/screens/profile/FinesScreen.tsx` (nuevo)
- `front-end/src/screens/profile/ProfileScreen.tsx`
- `front-end/src/navigation/ProfileStack.tsx`
- `front-end/src/types/index.ts` (agregar `Fines` a `ProfileStackParamList`)

---

## TAREA 3 — Aceptar/rechazar condiciones de consignación
**Complejidad: Media | Modal dentro de pantalla existente**

**Estado actual:**
- `ConsignacionResponse` devuelve `valorBase`, `comisiones`, `subastaId`, `fechaSubasta` cuando estado es ACEPTADA ✅
- `consignService.acceptConditions(id)` y `rejectConditions(id)`: implementados sin TODOs ✅
- `MyAuctionsScreen` tiene `onPress` en cada ítem pero solo navega si `moderationStatus === 'published'`; para `approved_pending_lot` retorna sin acción ❌
- El mapping en `MyAuctionsScreen` no incluye `valorBase`, `comisiones`, `subastaId`, `fechaSubasta` ❌

**Qué hacer:**
1. `MyAuctionsScreen.tsx`: extender el mapeo de consignaciones para incluir `valorBase`, `comisiones`, `subastaId`, `fechaSubasta` en el objeto local
2. Agregar estado `selectedItem` y `showModal` en `MyAuctionsScreen`
3. En `handleItemPress`, cuando `moderationStatus === 'approved_pending_lot'` (estado ACEPTADA), abrir modal en vez de retornar sin acción
4. Modal: muestra título del ítem, valorBase, comisiones, fecha de subasta estimada + botones "Aceptar condiciones" / "Rechazar condiciones"
5. En Aceptar: llama `consignService.acceptConditions(id)` → recarga lista → cierra modal
6. En Rechazar: `Alert` de confirmación ("El bien será devuelto con un cargo") → llama `rejectConditions(id)` → recarga lista → cierra modal
7. Loading state en botones durante la llamada

**Archivos:**
- `front-end/src/screens/activity/MyAuctionsScreen.tsx`

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
**Complejidad: Baja | 1 archivo, lógica condicional**
**Depende de: TAREA 2 (necesita la ruta 'Fines' en ProfileStack)**

**Estado actual:**
- Backend envía `BID_REJECTED` con `motivo: "MULTA_PENDIENTE"` y mensaje descriptivo ✅
- `useAuctionSocket` devuelve `rejection` con `motivo` y `mensaje` ✅
- `AuctionDetailScreen` usa solo `rejection.mensaje` en el banner; `rejection.motivo` se ignora

**Qué hacer:**

En `AuctionDetailScreen.tsx`, en el `useEffect` que maneja `rejection`, distinguir por motivo:

```ts
if (rejection.motivo === 'MULTA_PENDIENTE') {
  Alert.alert(
    'Multa pendiente',
    'Tenés multas pendientes. Debés pagarlas antes de pujar.',
    [
      { text: 'Cerrar', style: 'cancel' },
      { text: 'Ver multas', onPress: () => navigation.navigate('Profile', { screen: 'Fines' }) },
    ]
  );
} else {
  setBidError(rejection.mensaje);
}
```

Usar `Alert` para MULTA_PENDIENTE (fuerza atención y da acción concreta), mantener el banner inline para otros errores (monto fuera de rango, etc.).

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

4. **Datos obligatorios a completar con valores mock:**
   - `Subasta`: `titulo`, `moneda` (Consignacion no tiene moneda → default `ARS`), `rematador` (asignar uno existente), `ubicacion`, `fechaInicio`/`fechaFin`
   - `Item`: `descripcion`, `precioBase = valorBase`, `estado = EN_SUBASTA`, `duenioActual`, fotos (migrar `FotoConsignacion` → `ImagenItem`), `poliza`/`ubicacionFisica` desde `consignacion.getPoliza()`/`getDeposito()`

5. **Vincular:** `consignacion.setSubastaAsignada(subasta)` y guardar — recién ahí `ConsignacionResponse.subastaId`/`fechaSubasta` llegan con datos reales.

**Archivos:**
- `backend/src/main/java/com/subastas/service/ConsignacionService.java` (o nuevo servicio espejo de `MockRevisionConsignacionService`)
- `backend/src/main/java/com/subastas/service/MockRevisionConsignacionService.java` (si se opta por B)

**Decisión pendiente:** confirmar las 4 preguntas de arriba antes de tocar código backend.

---

## Orden de ejecución

```
✅ TAREA 1  — Credenciales (completada)
✅ TAREA 6  — Historial de pujas (completada)
   TAREA 2  — Multas (habilita TAREA 7)
   TAREA 7  — Error multa (depende de TAREA 2)
   TAREA 3  — Condiciones consignación (UI front ✅, navegación corregida ✅)
   TAREA 9  — Asignación de lote/subasta (backend) — gap descubierto en TAREA 3, decisión pendiente
   TAREA 4  — Entrega en chat
```

TAREA 5 y TAREA 8: no hay nada que hacer.

---

## Verificación por tarea

| Tarea | Cómo verificar |
|---|---|
| 1 ✅ | Levantar backend sin env vars → falla al arrancar ✅ |
| 2 | Perfil → fila "Multas" visible si hay pendientes → pantalla lista multas → botón Pagar funciona |
| 3 | Consignar ítem → esperar mock 3s → MyAuctions muestra ACEPTADA → tap abre modal con valorBase/comisiones → Aceptar actualiza estado |
| 4 | Ganar un ítem → ir a chat → card de entrega visible → seleccionar opción → card desaparece, queda chip informativo |
| 6 ✅ | Abrir subasta activa → historial de pujas visible → pujar → nueva puja aparece al tope ✅ |
| 7 | Tener multa pendiente → intentar pujar → Alert con botón "Ver multas" → navega a FinesScreen |
| 9 | Aceptar condiciones de una consignación → `subastaId` deja de ser `null` → MyAuctions navega a la subasta correcta (no a una al azar) |
