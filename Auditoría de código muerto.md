# Auditoría de código muerto — SistemaSubastasDA1
 
> Generado el 2026-06-11. Análisis de solo lectura sobre `front-end/` y `backend/`. Nada fue modificado.
 
> **Actualización 2026-06-13:** se ejecutaron los 7 ítems del "Top de candidatos a limpieza segura e inmediata" (sección final). Resultado: 193 líneas eliminadas en 18 archivos (0 agregadas). Verificado con `tsc --noEmit` (front-end) y `mvn compile` (backend), ambos sin errores nuevos respecto al estado previo. Los ítems marcados ✅ abajo ya están eliminados del código.
>
> **Actualización adicional 2026-06-13:** se eliminó también el barrel raíz `components/index.ts`, la `ConfirmBidScreen` placeholder (+ su registro en `RootNavigator.tsx`, su export en `screens/auction/index.ts` y el param `ConfirmBid` de `RootStackParamList`), y se corrigieron los comentarios obsoletos de `endpoints.ts:36,38`. Re-verificado con `tsc --noEmit` (mismo único error preexistente en `RemoteImage.tsx`, no relacionado).
 
---
 
## FRONT-END
 
### 1. Imports no usados
 
| Archivo | Línea | Qué | Confianza | Seguro de eliminar |
|---|---|---|---|---|
| `front-end/src/screens/auth/RegisterStep2Screen.tsx` | 25 | `import { useAuthStore } from '../../stores'` — nunca referenciado | ALTA | ✅ Eliminado |
| `front-end/src/screens/profile/ProfileScreen.tsx` | 8 | `ProfileHeaderBar` dentro del import desde `components/profile` — nunca referenciado (sigue usado por otras screens) | ALTA | ✅ Eliminado |
 
Confirmado además vía `tsc --noUnusedLocals --noUnusedParameters`, no aparecieron más casos.
 
---
 
### 2. Variables y constantes declaradas pero nunca referenciadas
 
| Archivo | Línea | Qué | Confianza | Notas |
|---|---|---|---|---|
| `front-end/src/components/auction/AuctionProductInfo.tsx` | 6-21 | prop `categories?: string[]` (tipo + destructuring), nunca leída en el componente ni pasada por `AuctionDetailScreen` | ALTA | ✅ Eliminado |
| `front-end/src/screens/auction/AuctionDetailScreen.tsx` | 467-470 | Estilo huérfano `chevronRow` en `StyleSheet.create`, reemplazado por `floatingChevronContainer`/`chevronPill` | ALTA | ✅ Eliminado |
| `front-end/src/data/mockActivity.ts:5`, `mockAuctionDetail.ts:1`, `mockProfile.ts:6` | — | `export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true'` duplicado en 3 archivos, sin ningún consumidor (todas las pantallas pegan a la API real) | ALTA | ✅ Eliminado (código). `.env.example` no se tocó, fuera de alcance |
| `front-end/src/data/mockAuctionDetail.ts` | 11-85 | `type AuctionDetailData` y `MOCK_AUCTION_DETAIL` completos, sin importadores (solo `AuctionBidEntry` del mismo archivo se usa) | ALTA | ✅ Eliminado (se mantuvo `AuctionBidEntry`) |
 
**Confianza MEDIA / no recomendado tocar:**
- `ProfileScreenShell.tsx:17,24` — prop `scrollable` (default `true`); ningún caller pasa `false`, pero es API legítima de un shell reutilizable.
- `FormSelect.tsx:12` — `export type SelectOption` se usa internamente; lo cuestionable es solo el modificador `export` (sin consumidores externos).
 
---
 
### 3. Funciones y hooks definidos pero nunca llamados
 
| Archivo | Qué | Confianza | Notas |
|---|---|---|---|
| `front-end/src/stores/auctionStore.ts` (completo) | `useAuctionStore` (Zustand) — `auctions`, `currentAuction`, `sessionId` + setters | ALTA | ✅ Eliminado — sin importadores fuera del barrel `stores/index.ts:3`. Reemplazado por `useState` local en `HomeScreen` |
| `front-end/src/stores/bidStore.ts` (completo) | `useBidStore` (Zustand) — `bids`, `currentBid`, `placeBid` | ALTA | ✅ Eliminado — sin importadores fuera del barrel `stores/index.ts:4`. `MyBidsScreen` usa `useState` local |
| `front-end/src/stores/myAuctionsStore.ts` (completo) | `useMyAuctionsStore` — `submissions`, `addSubmission` | ALTA | ✅ Eliminado — sin importadores fuera del barrel `stores/index.ts:5`. Reemplazado por `consignService.getConsignaciones()` |
| `front-end/src/stores/profileStore.ts:34,134-137` | método `addCard` (versión mock, sin API) | ALTA | ✅ Eliminado — `AddCardScreen` usa `addCardViaApi` (sí llama a `paymentService`), no este |
 
**Eliminar estos 4 implica también limpiar sus exports en `front-end/src/stores/index.ts`** y, como consecuencia, el tipo `Bid` en `types/index.ts` (usado solo por `bidStore`) quedaría sin consumidores — ver categoría 6.

✅ **Hecho (2026-06-13):** se eliminaron los 3 stores, sus exports en `stores/index.ts`, el método `addCard` de `profileStore.ts` y el tipo `Bid` de `types/index.ts`.
 
UI layer (components/screens/navigation): **sin hallazgos** — todas las funciones/hooks locales se invocan al menos una vez.
 
---
 
### 4. Componentes/pantallas declarados pero nunca renderizados
 
| Archivo | Qué | Confianza | Notas |
|---|---|---|---|
| `front-end/src/components/index.ts` (1-3) | Barrel raíz que re-exporta solo `auth`, `home`, `auction` | ALTA | ✅ Eliminado (2026-06-13) — nadie importaba desde `'.../components'` a secas (todos usan sub-barrels) |
| `front-end/src/screens/auction/ConfirmBidScreen.tsx` (completo, 26 líneas) | Screen placeholder (`<Text>ConfirmBidScreen</Text>`), registrada en `RootNavigator.tsx:27-31` y tipada en `types/index.ts:145` (`ConfirmBid: { auctionId, amount }`) | MEDIA | ✅ Eliminado (2026-06-13) — el flujo real de confirmación de puja usa `ConfirmBidModal` (dentro de `AuctionDetailScreen`). Se tocaron los 4 archivos: el screen, `screens/auction/index.ts`, `RootNavigator.tsx` y `types/index.ts` |
 
---
 
### 5. Params de navegación en `types/index.ts` que ningún `navigate()` usa
 
| Archivo | Línea | Qué | Confianza | Notas |
|---|---|---|---|---|
| `types/index.ts:145` | `RootStackParamList.ConfirmBid: { auctionId, amount }` | ALTA | ✅ Eliminado (2026-06-13) — mismo hallazgo que 4, ruta nunca navegada |
| `types/index.ts:153-158` | `HomeStackParamList.ChatDetail.vendedorNombre?` | ALTA (de que nunca se pasa) | El único `navigate('ChatDetail', ...)` (`ChatListScreen.tsx:36-40`) no envía `vendedorNombre`; `ChatDetailScreen.tsx:28` siempre cae al hardcode `'Carlos Martini'`. **No es código muerto puro** — es integración incompleta. No recomendado eliminar el param; mejor completar la integración pasando el dato real, o documentar el placeholder |
 
Resto de param lists (`UploadItem/ItemUploaded`, `AuctionDetail`, `LotDetail`, `RegisterStep2/3`, etc.) — todos usados correctamente.
 
---
 
### 6. Servicios o métodos de servicio exportados pero nunca importados
 
| Método | Archivo | Confianza | Notas |
|---|---|---|---|
| `authService.logout` | `services/authService.ts:12-14` | ALTA | Ninguna pantalla lo llama; usan `useAuthStore().logout()` (limpieza local de estado, sin HTTP). El propio `AuthController` documenta "logout es responsabilidad del cliente". Candidato a *cablear* más que a borrar |
| `consignService.getItemLocation` | `services/consignService.ts:64-66` | ALTA | Sin consumidor en screens. Backend lo tiene completamente implementado (`UbicacionResponse`) |
| `consignService.getInsurancePolicy` | `services/consignService.ts:68-70` | ALTA | Ídem, backend implementa `PolizaResponse` |
 
Resto de servicios (`auctionService`, `chatService`, `metricsService`, `paymentService`, `userService`, `stompService`) — **todos los métodos tienen consumidor**.
 
---
 
### 7. Endpoints en `endpoints.ts` que ningún servicio llama
 
| Endpoint | Archivo:línea | Confianza | Notas |
|---|---|---|---|
| `PURCHASES.DETAIL: (id) => /usuarios/compras/${id}` | `constants/endpoints.ts:35` | ALTA | Sin uso en `chatService` ni otros. Posible feature futura "detalle de compra" |
| `CONSIGNMENT.ITEM_LOCATION` | `constants/endpoints.ts:54` | ALTA | Encadenado con hallazgo 6 (`getItemLocation`) |
| `CONSIGNMENT.INSURANCE_POLICY` | `constants/endpoints.ts:55` | ALTA | Encadenado con hallazgo 6 (`getInsurancePolicy`) |
 
**Nota aparte (no es código muerto, pero detectado):** comentarios `// PENDIENTE: sin pantalla ni servicio implementado` en `endpoints.ts:36,38` (`PURCHASES.CHAT`/`PURCHASES.DELIVERY`) estaban **desactualizados** — ambos sí están implementados y en uso por `ChatDetailScreen`.

✅ **Corregido (2026-06-13):** se eliminaron ambos comentarios obsoletos.
 
---
 
## BACKEND
 
### 1. Métodos privados nunca invocados
**Sin hallazgos** en controllers, exceptions, services, util, scheduler, security ni config. Todo método `private` revisado se llama al menos una vez dentro de su propia clase.
 
---
 
### 2. DTOs definidos pero nunca instanciados
**Sin hallazgos.** Los 32 DTOs (request/response/websocket, incluyendo clases anidadas) se construyen vía builder/setters y se usan como tipo en algún controller/service. Caso verificado especialmente: `ConsignacionResponse.fechaSubasta`/`gastosEstimados` — sí se usan vía setters Lombok en `ConsignacionService`.
 
---
 
### 3. Campos de entidad nunca leídos ni escritos
 
| Campo | Archivo:línea | Confianza | Notas |
|---|---|---|---|
| `Multa.puja` (`@ManyToOne Puja puja`) | `model/entity/Multa.java:43-45` | ALTA | ✅ Eliminado — ningún getter/setter usado en `MultaService`/`MultaResponse`/`DataLoader`. La multa se gestiona sin vincularse a la puja que la originó |
| `Rematador.telefono` | `model/entity/Rematador.java:26` | ALTA | ✅ Eliminado — sin uso en ningún lado, ni en seeds |
| `Rematador.email` | `model/entity/Rematador.java:24` | MEDIA | Se setea en `DataLoader:122` pero nunca se lee (no expuesto en `RematadorResponse`) |
| `MedioPago.numeroCuenta/banco/tipoCuenta/cbu/numeroTarjeta/titular/vencimiento/tipoTarjeta` | `model/entity/MedioPago.java:40-61` | MEDIA | "Write-only": se persisten desde `MedioPagoRequest` pero `MedioPagoResponse` no los expone. Probable diseño intencional (no exponer datos sensibles de pago) |
| `Consignacion.motivoRechazo` | `model/entity/Consignacion.java:37` | MEDIA | Se lee en `ConsignacionResponse` pero nunca se escribe — el flujo de rechazo no está implementado (ver enum 5.2 abajo) |
 
---
 
### 4. Endpoints sin consumidor conocido (frontend o test)
 
| Endpoint | Controller:línea | Confianza | Notas |
|---|---|---|---|
| `POST /api/v1/auth/logout` | `AuthController.java:53-57` | MEDIA | Sin consumidor frontend ni test. El propio comentario del método dice "con JWT stateless, logout es responsabilidad del cliente" — endpoint casi decorativo |
| `GET /api/v1/consignaciones/{id}/ubicacion` | `ConsignacionController.java:74-80` | MEDIA | `UbicacionResponse`/`obtenerUbicacion` completamente implementados, sin pantalla frontend |
| `GET /api/v1/consignaciones/{id}/poliza` | `ConsignacionController.java:82-88` | MEDIA | `PolizaResponse`/`obtenerPoliza` completamente implementados, sin pantalla frontend |
| `GET /api/v1/usuarios/metricas` | `UsuarioController.java:105-109` | MEDIA | `MetricasResponse`/`obtenerMetricas` implementados (cálculo de % victorias, etc.), sin consumidor |
| `GET /api/v1/usuarios/participaciones` | `UsuarioController.java:117-125` | MEDIA | `ParticipacionHistorialResponse` implementado con filtros, sin consumidor |
 
**Sin consumidor frontend pero SÍ cubiertos por tests de integración (no recomendable tocar):** `GET /api/v1/items/{itemId}`, `GET /api/v1/items/{itemId}/imagenes` (`SeguridadTest`), `GET /api/v1/subastas/{id}/pujas/estado`, `POST /api/v1/subastas/{id}/pujas` (`SubastaControllerTest`, `SeguridadTest` — alternativa REST documentada a la puja por WebSocket).
 
---
 
### 5. Beans nunca inyectados
**Sin hallazgos.** Todos los `@Component/@Service/@Configuration` se inyectan explícitamente (constructor) o son usados implícitamente por Spring (`CommandLineRunner`, `@Scheduled`, `WebMvcConfigurer`, `SecurityFilterChain`, `WebSocketMessageBrokerConfigurer`, springdoc `OpenAPI` bean, etc.).
 
---
 
### Hallazgos adicionales (no pedidos explícitamente, pero relevantes)
 
**Repository methods nunca llamados — todos ALTA confianza:**
 
| Método | Archivo:línea | Notas |
|---|---|---|
| `CompraRepository.sumTotalByUsuario(...)` | `repository/CompraRepository.java:28-29` | ✅ Eliminado — posible regla de negocio pendiente: límite de monto acumulado para cheques certificados (`context.md:138`) |
| `ParticipacionRepository.findByUsuarioAndConectadoTrue(...)` | `repository/ParticipacionRepository.java:21` | ✅ Eliminado — relacionado con regla "no conectado a 2 subastas a la vez" (cubierta por `existsByUsuarioAndConectadoTrue`, que sí se usa) |
| `UsuarioRepository.findByTokenEmail(...)` | `repository/UsuarioRepository.java:22` | ✅ Eliminado — `AuthService.registroPaso2` usa `findByEmail` + comparación en memoria; este método quedó duplicado/obsoleto |
| `UsuarioRepository.countByEstado(...)` | `repository/UsuarioRepository.java:24` | ✅ Eliminado (junto con el import ahora huérfano de `EstadoUsuario`) — sin endpoint de estadísticas de admin que lo use |
 
**Valores de enum sin uso:**
 
| Valor | Archivo | Confianza | Notas |
|---|---|---|---|
| `EstadoConsignacion.RECHAZADA` | `model/enums/EstadoConsignacion.java` | MEDIA-ALTA | Correlacionado con `Consignacion.motivoRechazo` — flujo de rechazo no implementado |
| `EstadoConsignacion.VENDIDA` | `model/enums/EstadoConsignacion.java` | ALTA | El cierre de subasta actualiza `Item.estado` pero nunca `Consignacion.estado` |
| `EstadoPuja.RECHAZADA` | `model/enums/EstadoPuja.java` | ALTA | Pujas rechazadas se comunican solo por WebSocket (`BidRejectedMessage`), nunca se persisten con este estado |
| `Categoria.PLATINO` | `model/enums/Categoria.java` | MEDIA | Sin datos de seed que lo ejerciten, pero SÍ participa en lógica real (`sinLimitesPuja()`, jerarquía de categorías) — **no es código muerto**, solo falta cobertura de datos |
 
---
 
## Top de candidatos a limpieza segura e inmediata (ALTA confianza, impacto cero)
 
1. ✅ `RegisterStep2Screen.tsx:25` — import `useAuthStore` no usado
2. ✅ `ProfileScreen.tsx:8` — import `ProfileHeaderBar` no usado
3. ✅ `AuctionProductInfo.tsx:6-21` — prop `categories` no usada
4. ✅ `AuctionDetailScreen.tsx:467-470` — estilo `chevronRow` huérfano
5. ✅ `data/mockActivity.ts`, `mockAuctionDetail.ts`, `mockProfile.ts` — `USE_MOCKS` (x3) + `AuctionDetailData`/`MOCK_AUCTION_DETAIL`
6. ✅ `stores/auctionStore.ts`, `bidStore.ts`, `myAuctionsStore.ts` (completos) + sus exports en `stores/index.ts` + `addCard` en `profileStore.ts` + tipo `Bid` en `types/index.ts`
7. ✅ Backend: `Multa.puja`, `Rematador.telefono`, y los 4 repository methods sin uso (`sumTotalByUsuario`, `findByUsuarioAndConectadoTrue`, `findByTokenEmail`, `countByEstado`)

**Estado: completado el 2026-06-13** — 193 líneas eliminadas en 18 archivos, 0 agregadas. Sin tocar `Rematador.email`, los campos write-only de `MedioPago`, `Consignacion.motivoRechazo`, los enums (`EstadoConsignacion`, `EstadoPuja`, `Categoria`) ni los endpoints/servicios marcados MEDIA.
 
## Lo que **no** se recomienda tocar
Todo lo marcado MEDIA que corresponde a **funcionalidad de backend completa esperando pantalla frontend** (ubicación/póliza de consignación, métricas, participaciones, `authService.logout`) y los **gaps de flujo de negocio** (rechazo/venta de consignación, `EstadoPuja.RECHAZADA`, `Categoria.PLATINO`) — eliminarlos sería más costoso que el beneficio y borraría contratos de API ya documentados en `context.md`.
 