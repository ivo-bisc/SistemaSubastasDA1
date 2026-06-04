# Plan de Integración — Sistema de Subastas DA1
**Basado en:** AUDIT-V2.md  
**Fecha:** 2026-06-03  
**Última actualización:** 2026-06-04  
**Criterio de prioridad:** costo/beneficio académico — primero lo que rompe funcionalidad visible, último lo cosmético.

---

## Progreso

| Estado | Pasos |
|--------|-------|
| ✅ **Completados** | 1, 2, 3, 4, 5, 7, 7b, 7c, 10 |
| ⏳ **Pendientes** | 6, 8, 9, 11 |

**Fase 1 (fixes críticos): terminada.**

---

## Resumen rápido

| # | Tarea | Impacto | Esfuerzo | Prioridad | Estado |
|---|-------|---------|----------|-----------|--------|
| 1 | Alinear validación de contraseña (3→8 chars) | 🔴 Crítico | ~5 min | 1 | ✅ |
| 2 | Fix mapeo `MedioPagoResponse` en `profileStore` | 🔴 Crítico | ~30 min | 2 | ✅ |
| 3 | Fix silencio de errores en `chatService.sendMessage` | 🔴 Crítico | ~10 min | 3 | ✅ |
| 4 | Conectar `AddCardScreen` a `POST /usuarios/medios-pago` | 🟡 Medio | ~45 min | 4 | ✅ |
| 5 | Conectar `MyBidsScreen` a API real | 🟡 Medio | ~1 h | 5 | ✅ |
| 6 | Conectar `MyAuctionsScreen` a API real | 🟡 Medio | ~1 h | 6 | ⏳ |
| 7 | Conectar `UploadItemScreen` a `consignService` | 🟡 Medio | ~1 h | 7 | ✅ |
| 7b | Conectar `LotDetailScreen` a `GET /subastas/{id}` + catálogo | 🟡 Medio | ~1.5 h | 7b | ✅ |
| 7c | Llamar `disconnectFromAuction()` al salir de `AuctionDetailScreen` | 🟡 Medio | ~15 min | 7c | ✅ |
| 8 | Credenciales: sacar defaults de `application.properties` | 🔴 Crítico | ~20 min | 8 | ⏳ |
| 9 | Eliminar `tokenEmail: 'dev-bypass'` | 🔴 Crítico | ~30 min | 9 | ⏳ |
| 10 | Race condition en `profileStore.loadProfile()` | 🟢 Menor | ~5 min | 10 | ✅ |
| 11 | Limpieza: servicios muertos, tipos sin usar, `bidService` | 🟢 Menor | ~1 h | 11 | ⏳ |

---

## Paso 1 — Alinear validación de contraseña ✅

**Estado:** Completado (2026-06-03). Regex en `RegisterStep1Screen.tsx` exige mínimo 8 caracteres.

**Archivo:** `front-end/src/screens/auth/RegisterStep1Screen.tsx`  
**Problema:** frontend valida mínimo 3 caracteres; backend tiene `@Size(min=8)`. Contraseñas de 3-7 chars pasan el formulario y explotan con 400 en backend.

**Qué hacer:**
- Buscar la regla de validación de `password` (probablemente `password.length < 3` o similar).
- Cambiarla a `password.length < 8`.
- Actualizar el mensaje de error visible al usuario para que diga "mínimo 8 caracteres".

**Verificación:** ingresar contraseña de 5 chars → el botón debe estar deshabilitado o mostrar el mensaje de error antes de llamar al backend.

---

## Paso 2 — Fix mapeo `MedioPagoResponse` en `profileStore` ✅

**Estado:** Completado (2026-06-03). `loadProfile()` mapea `alias`, `tipo`, `moneda`, `verificado`. `PaymentMethodsScreen` muestra esos campos.

**Archivo:** `front-end/src/stores/profileStore.ts`  
**Problema:** `loadProfile()` mapea la respuesta de `GET /usuarios/medios-pago` a objetos `MockCard { last4, brand, holderName }`, pero el backend retorna `MedioPagoResponse { id, tipo, alias, moneda, verificado, montoLimite }`. Los campos `last4`, `brand` y `holderName` no existen en la respuesta → las tarjetas se muestran vacías en `ProfileScreen`.

**Qué hacer:**
1. Abrir `profileStore.ts` y localizar el mapeo de medios de pago (probablemente dentro de `loadProfile()`).
2. Reemplazar el mapeo a `MockCard` por uno que use los campos reales:
   - `alias` → mostrar como nombre de la tarjeta
   - `tipo` → mostrar como tipo (`TARJETA_CREDITO`)
   - `moneda` → mostrar
   - `id` → conservar para delete
3. Actualizar el tipo/interfaz que usa `ProfileScreen` para mostrar las tarjetas para que coincida con los campos reales del backend.
4. Si `ProfileScreen` o su componente de tarjeta espera `last4` / `brand`, actualizar esos componentes también.

**Verificación:** iniciar sesión, ir a Perfil → la sección de medios de pago debe mostrar el `alias` y `tipo` de cada tarjeta, no campos vacíos.

---

## Paso 3 — Fix silencio de errores en `chatService.sendMessage` ✅

**Estado:** Completado (2026-06-03). `ChatDetailScreen` muestra `sendError`, revierte mensaje optimista si falla el POST.

**Archivo:** `front-end/src/screens/chat/ChatDetailScreen.tsx`  
**Problema:** `.catch(() => {})` después de `sendMessage()` descarta el error por completo. El usuario no sabe si el mensaje falló.

**Qué hacer:**
1. Localizar el `.catch(() => {})` en la llamada a `sendMessage`.
2. Reemplazarlo por un handler que setee un estado de error visible, por ejemplo:
   ```ts
   .catch(() => setSendError('No se pudo enviar el mensaje. Intentá de nuevo.'))
   ```
3. Mostrar ese estado en la UI (un `Text` de error debajo del input o un `Alert`).

**Verificación:** cortar la conexión al backend y enviar un mensaje → debe aparecer el mensaje de error.

---

## Paso 4 — Conectar `AddCardScreen` a `POST /usuarios/medios-pago` ✅

**Estado:** Completado (2026-06-04). `AddCardScreen` llama a `addCardViaApi()` → `paymentService.addPaymentMethod()`. Recarga `loadProfile()` tras el éxito. Manejo de error con `Alert` y estado `loading`.

**Archivo:** `front-end/src/screens/profile/AddCardScreen.tsx`  
**Problema:** al agregar una tarjeta desde el perfil, solo se guarda en el store local sin llamar al backend. Al recargar la app, la tarjeta desaparece.

**Qué hacer:**
1. En el handler de confirmación de `AddCardScreen`, importar y llamar a `paymentService.addPaymentMethod()` (ya existe en `RegisterStep3Screen`).
2. El payload que ya funciona en `RegisterStep3Screen` sirve de referencia exacta.
3. En caso de éxito: cerrar la pantalla y recargar `profileStore.loadProfile()` para reflejar la nueva tarjeta.
4. En caso de error: mostrar mensaje visible (no silenciar).
5. Agregar estado `saving` para deshabilitar el botón durante la llamada.

**Verificación:** agregar tarjeta → cerrar app → volver a Perfil → la tarjeta debe seguir apareciendo.

---

## Paso 5 — Conectar `MyBidsScreen` a API real

**Archivo:** `front-end/src/screens/activity/MyBidsScreen.tsx`  
**Problema:** usa `MOCK_BIDS` hardcodeado incondicionalmente. No hay endpoint directo de "mis pujas" en el backend auditado.

**Decisión tomada:** `GET /usuarios/participaciones` existe en el backend pero retorna **agregados por subasta** (`{ subastaId, titulo, itemsPujados, itemsGanados, montoTotalOfertado, resultado }`), no pujas individuales. Para mostrar una lista de pujas una por una se necesitaría un endpoint nuevo (`GET /usuarios/mis-pujas`) que no existe hoy. Crear ese endpoint no es parte de este sprint.

**Qué hacer:**
1. Mantener `MOCK_BIDS` pero envolverlo con el flag `USE_MOCKS` para que el switch sea explícito y la pantalla no quede hardcodeada:
   ```ts
   const bids = USE_MOCKS ? MOCK_BIDS : []; // reemplazar [] con endpoint real cuando exista
   ```
2. Agregar estado de carga y manejo del caso vacío.
3. Dejar un comentario en el código indicando qué endpoint se necesita crear para conectar datos reales.

**Si se quiere conectar a datos reales en el futuro:** crear `GET /usuarios/mis-pujas` en el backend que retorne pujas individuales con `{ pujaId, itemDescripcion, monto, estado, subastaId, timestamp }`.

**Verificación:** la pantalla sigue mostrando el mock, pero el switch `USE_MOCKS` funciona y el código no tiene la dependencia hardcodeada.

---

## Paso 6 — Conectar `MyAuctionsScreen` a API real

**Archivo:** `front-end/src/screens/activity/MyAuctionsScreen.tsx`  
**Problema:** usa `MOCK_AUCTIONS` hardcodeado. Las consignaciones enviadas desde `UploadItemScreen` tampoco llegan al backend.

**Qué hacer:**
1. Revisar qué retorna `GET /usuarios/participaciones` — si incluye subastas en las que participó el usuario como consignante.
2. Si hay un endpoint adecuado: implementar el servicio y conectarlo.
3. Si no hay endpoint: igual que el paso anterior, envolver el mock con `USE_MOCKS` para dejar la puerta abierta.
4. Agregar loading state.

---

## Paso 7 — Conectar `UploadItemScreen` a `consignService`

**Archivo:** `front-end/src/screens/consignment/UploadItemScreen.tsx`  
**Problema:** al subir un ítem para consignación, solo se guarda en `myAuctionsStore` local con IDs generados por `Date.now()`. No llega nada al backend.

**Qué hacer:**
1. En `consignService.ts`, implementar `submitItem()` quitando el TODO y haciendo el `POST /consignaciones` con el payload del formulario.
2. En `UploadItemScreen`, reemplazar la llamada a `myAuctionsStore.addSubmission()` por `consignService.submitItem()`.
3. Si el backend retorna el objeto creado, guardar el ID real en el store.
4. Agregar loading state en el botón de confirmar (ya marcado como `⚠️` en el audit por riesgo de doble submit).

**Verificación:** subir un ítem → verificar en el backend que llegó el POST y que aparece en la lista de consignaciones.

---

## Paso 7c — Llamar a `disconnectFromAuction()` al salir de `AuctionDetailScreen`

**Archivo:** `front-end/src/screens/auction/AuctionDetailScreen.tsx`  
**Problema:** cuando el usuario sale de la pantalla de subasta activa, el frontend desconecta el WebSocket (STOMP) correctamente, pero **nunca llama a `POST /subastas/{id}/desconectar`**. La `Participacion` queda con `conectado = true` en el backend. Esto puede bloquear al usuario si el backend aplica la regla de "un usuario no puede conectarse a más de una subasta simultánea".

**Aclaración sobre el servicio:** `auctionService.disconnectFromAuction()` YA tiene la implementación real (`apiClient.post(DISCONNECT(id))`). El comentario `// TODO` es residual — se puede borrar. Lo único que falta es llamarlo.

**Qué hacer:**
1. En `AuctionDetailScreen`, ubicar el `useEffect` de cleanup que ya desconecta el WebSocket (`stompService.disconnect()`).
2. Agregar la llamada a `auctionService.disconnectFromAuction(auctionId)` en ese mismo cleanup, **antes** de desconectar el WebSocket:
   ```ts
   return () => {
     auctionService.disconnectFromAuction(auctionId).catch(() => {});
     stompService.disconnect();
   };
   ```
3. El `.catch(() => {})` es intencional aquí: si el backend falla o el token ya expiró al salir, no queremos bloquear el unmount de la pantalla.
4. Eliminar el comentario `// TODO` de `auctionService.disconnectFromAuction()`.

**Verificación:** entrar a una subasta → salir → verificar en el backend (logs o Swagger) que `POST /subastas/{id}/desconectar` se ejecuta y la `Participacion` queda con `conectado = false`.

---

## Paso 7b — Conectar `LotDetailScreen` a `GET /subastas/{id}` + catálogo ✅

**Estado:** Completado (2026-06-03). `auctionService.getLotDetail()` carga subasta + catálogo. `LotDetailScreen` usa API real con loading/error. Navegación a `AuctionDetail` con `auctionId: lotId`.

**Archivos:** `front-end/src/services/auctionService.ts`, `front-end/src/screens/home/LotDetailScreen.tsx`  
**Problema:** `LotDetailScreen` llama a `getLotById(route.params.lotId)` del mock. Un "lote" en el frontend (nombre + descripción + lista de ítems) corresponde exactamente a una **subasta** en el backend. El backend tiene `GET /subastas/{id}` y `GET /subastas/{id}/catalogo` completamente implementados.

**Por qué es más complejo que otros mocks:**  
El mock usa IDs string (`'cat-1'`, `'cat-2'`). El backend usa IDs Long. Para que `LotDetailScreen` reciba un ID real, `HomeScreen` también tiene que pasar IDs reales de subastas al navegar. Si `HomeScreen` ya está conectado a `GET /subastas` (lo está, por `auctionService.getAuctions()`), los IDs reales ya están disponibles.

**Qué hacer:**

1. **Verificar qué renderiza `HomeScreen`** en la sección de categorías/lotes — si usa `MOCK_HOME_CATEGORIES` para esa sección, reemplazarla con los datos reales que ya trae `auctionService.getAuctions()`.
2. **Adaptar la navegación:** al tapear un lote en `HomeScreen`, pasar el `id` real de la subasta (número) en vez del `cat-X` del mock.
3. **En `LotDetailScreen`**, reemplazar `getLotById(route.params.lotId)` por dos llamadas paralelas:
   - `auctionService.getAuctionDetail(id)` → para el título y descripción de la subasta
   - `auctionService.getAuctionCatalog(id)` (o el método equivalente) → para la lista de ítems
4. **Adaptar el render:** el mock usa `item.title`, `item.price`, `item.timeRemaining`, `item.imageUrl`. El backend retorna `ItemResponse { itemId, descripcion, precioBase, estado, imagenes[], pujaMinima, pujaMaxima }`. Mapear los campos o adaptar el componente `AuctionItemCard` para aceptar el schema real.
5. Agregar loading state (`ActivityIndicator`) y estado de error.
6. Eliminar el import de `getLotById` y `mockHomeCatalog` una vez que no se use más.

**Verificación:** navegar desde `HomeScreen` → lote → `LotDetailScreen` debe mostrar el título de la subasta real, su descripción y la lista de ítems del catálogo con precios reales.

---

## Paso 8 — Sacar credenciales de `application.properties`

**Archivo:** `backend/src/main/resources/application.properties`  
**Problema:** `DB_PASSWORD` y `JWT_SECRET` tienen valores reales/débiles como defaults commiteados al repo.

**Qué hacer:**
1. En `application.properties`, cambiar los defaults a valores vacíos que fuercen error de arranque si no se setean:
   ```properties
   spring.datasource.password=${DB_PASSWORD}
   jwt.secret=${JWT_SECRET}
   ```
   (sin el `: valor_default` — así Spring falla al arrancar si la variable no existe, en vez de usar el valor inseguro).
2. Crear un archivo `application-local.properties` **no commiteado** con los valores reales para desarrollo local.
3. Agregar `backend/src/main/resources/application-local.properties` al `.gitignore`.
4. Documentar en `backend/README.md` qué variables de entorno se necesitan para levantar el proyecto.

**Nota:** no rotar la contraseña de la DB ahora (está commiteada pero es un proyecto académico local). La acción crítica es que no vuelva a commitearse.

---

## Paso 9 — Eliminar `tokenEmail: 'dev-bypass'`

**Archivo:** `front-end/src/screens/auth/RegisterStep2Screen.tsx`  
**Problema:** el campo `tokenEmail` está hardcodeado como `'dev-bypass'`. Esto rompe el flujo de registro real si el backend valida el token.

**Qué hacer:**
1. Verificar en el backend (`AuthController`) si el paso 2 del registro valida el token de email o si `'dev-bypass'` tiene un tratamiento especial.
2. **Si el backend tiene lógica de bypass para ese valor**: es un bypass intencional de dev que hay que dejar pero documentar. Evaluar si se quiere implementar el flujo real de verificación de email (envío de token por correo).
3. **Si el backend valida el token normalmente**: hay que implementar el flujo completo:
   - Paso 1 genera token y lo envía por email al usuario.
   - El usuario ingresa el token en un campo visible en `RegisterStep2Screen`.
   - Se envía el token real.
4. Para el contexto académico, lo más probable es que el bypass sea intencional. En ese caso: dejarlo pero envolverlo en una constante descriptiva `const EMAIL_VERIFY_BYPASS = 'dev-bypass'` con un comentario que indique que es un bypass de desarrollo.

---

## Paso 10 — Race condition en `profileStore.loadProfile()` ✅

**Estado:** Completado (2026-06-03). Store usa `(set, get)` y `if (get().isLoading) return;` al inicio de `loadProfile()`.

**Archivo:** `front-end/src/stores/profileStore.ts`  
**Problema:** si `ProfileScreen` se desmonta y remonta, se lanza una segunda llamada a `loadProfile()` en paralelo. La última en llegar gana y puede sobrescribir datos inconsistentes.

**Qué hacer:**
- Agregar al inicio de `loadProfile()`:
  ```ts
  if (get().isLoading) return;
  ```

**Tiempo estimado:** 2 minutos.

---

## Paso 11 — Limpieza de código muerto

Solo hacer esto una vez que los pasos anteriores estén completos y el proyecto funcione.

### 11a — Eliminar tipos TypeScript sin usar
**Archivo:** `front-end/src/types/index.ts` y `front-end/src/types/catalog.ts`  
Eliminar: `CatalogItem`, `CardPayment`, `CheckPayment`, `ChatConversation`, `PaymentMethod`, `CatalogCardItem`, `CatalogCategory`.  
Verificar con TypeScript que nadie los importa antes de borrar.

### 11b — Eliminar `bidService.ts`
**Archivo:** `front-end/src/services/bidService.ts`  
El sistema de pujas usa WebSocket (`useAuctionSocket.sendBid()`). El `bidService` REST es código duplicado que nunca se llama. Borrarlo y eliminar la constante `BIDS` de `endpoints.ts` que solo él usaba.

### 11c — Decidir el destino de los servicios esqueleto
Para cada uno de estos servicios, elegir: **implementar** o **eliminar**.

| Servicio | Recomendación |
|---|---|
| `catalogService.ts` | Eliminar — `/catalogo/items` no existe en el backend; implementarlo requiere primero crear el endpoint |
| `metricsService.ts` | Implementar si se conecta `MyBidsScreen` (Paso 5); si no, eliminar |
| `consignService.ts` | Implementar en Paso 7; si no se hace, eliminar |
| `purchaseService.ts` | Conectar a `ComprasDetailScreen` (pantalla que falta) o eliminar |

### 11d — Eliminar ruta inexistente
**Archivo:** `front-end/src/services/catalogService.ts`  
`catalogService.getItems()` llama a `GET /catalogo/items` que no existe en el backend. Eliminar el método o corregir la ruta al endpoint real (`/subastas/{id}/catalogo` ya está conectado desde otro lado).

---

## Orden de ejecución sugerido

```
✅ Paso 1  (5 min)   — contraseña 8 chars
✅ Paso 3  (10 min)  — error visible en chat
✅ Paso 10 (5 min)   — race condition perfil
✅ Paso 2  (30 min)  — mapeo tarjetas
✅ Paso 4  (45 min)  — AddCardScreen → API
✅ Paso 7b (1.5 h)   — LotDetailScreen + getLotDetail
✅ Paso 7c (15 min)  — disconnectFromAuction al salir de subasta
✅ Paso 7  (1 h)     — UploadItemScreen → consignaciones
⏳ Paso 5  (1 h)     — MyBidsScreen (USE_MOCKS o endpoint nuevo)
⏳ Paso 6  (1 h)     — MyAuctionsScreen
⏳ Paso 11 (1 h)     — limpieza final
```

**Completado:** ~3 h (pasos 1–4, 7b, 10).  
**Restante estimado:** ~5.5 h.

---

## Lo que se puede dejar para después (o ignorar en contexto académico)

- `authStore.logout()` sin llamar al backend: el token expira en 24 h, el riesgo es bajo para un proyecto académico.
- `null` en `ALLOWED_ORIGINS`: solo importa antes de producción real.
- `show-sql=true` y `level=DEBUG`: crear un `application-prod.properties` si alguna vez se despliega.
- Swagger UI sin auth: aceptable en desarrollo.
- `⚠️ /compras/{id}/entrega`: endpoint definido pero sin pantalla — dejar hasta que se implemente la pantalla de entrega.
