# Auditoría de integración Backend ↔ Frontend

> Auditoría: 2026-06-02  
> Última actualización: 2026-06-02  
> Alcance: monorepo `SistemaSubastasDA1` — Spring Boot 3.3.4 + Expo/React Native  
> Método: análisis estático + fixes aplicados en la misma sesión

---

## ════════════════════════
## 1. CONECTIVIDAD BASE
## ════════════════════════

### ¿El baseURL de apiClient apunta correctamente al backend?

**✅ CORREGIDO** — `front-end/src/services/apiClient.ts`

`apiClient.ts` ahora detecta la plataforma automáticamente:
```ts
const DEFAULT_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080/api/v1'
    : 'http://10.0.2.2:8080/api/v1';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;
```

- **Expo web** → `localhost:8080/api/v1`
- **Emulador Android** → `10.0.2.2:8080/api/v1`
- **Override manual** → definir `EXPO_PUBLIC_API_URL` en `.env`

### ¿El prefijo `/api/v1` está configurado?

**✅ CORREGIDO** — el prefijo queda en el `DEFAULT_URL` de `apiClient.ts`. La variable `EXPO_PUBLIC_API_URL` fue eliminada de `.env` para que la detección automática tome efecto.

### ¿CORS está configurado en Spring Boot?

**✅ OK**

`SecurityConfig.java` registra un `CorsConfigurationSource` inyectado en el `SecurityFilterChain`:

- **Orígenes permitidos** (desde `application.properties`): `http://localhost:3000`, `http://localhost:4200`, `http://localhost:8081`, `http://10.0.2.2:8081`, `null`
- **Métodos**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: `*`
- **Credentials**: `true`

### ¿Las variables de entorno están definidas en ambos lados?

| Lado | Variable | Valor definido | Estado |
|---|---|---|---|
| Backend | `DB_URL` | Default MySQL localhost | ✅ |
| Backend | `DB_USERNAME` / `DB_PASSWORD` | Default `root` / vacío | ✅ |
| Backend | `JWT_SECRET` | Default de desarrollo | ✅ |
| Backend | `jwt.expiration` | `86400000` (24h) | ✅ |
| Backend | `cors.allowed-origins` | Configurable via env | ✅ |
| Frontend | `EXPO_PUBLIC_API_URL` | Eliminada del `.env`; detección automática por plataforma en `apiClient.ts` | ✅ |
| Frontend | `EXPO_PUBLIC_USE_MOCKS` | `true` (mocks activos) | ⚠️ |

---

## ════════════════════════
## 2. ENDPOINTS
## ════════════════════════

> Leyenda:  
> ✅ Coincide exactamente (asumiendo baseURL correcto con `/api/v1`)  
> ⚠️ Path distinto pero backend existe  
> ❌ No existe en el backend

### AUTH

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/auth/login` | POST | ✅ | Path correcto; contrato OK; pero `LoginScreen.tsx` nunca llama a `authService.login()` |
| `/auth/logout` | POST | ✅ | |
| `/auth/registro/paso1` | POST | ✅ | Path correcto; contrato roto (ver sección 3) |
| `/auth/registro/paso2` | POST | ✅ | Path correcto; contrato roto (ver sección 3) |
| `/auth/register/step3` | POST | ❌ | El backend no tiene un paso 3 de auth; endpoint inexistente |

### USERS

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/usuarios/perfil` | GET | ✅ | |
| `/usuarios/perfil` | PUT | ❌ | Backend no expone `PUT /api/v1/usuarios/perfil` |

### CATALOG

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/catalog/items` | GET | ❌ | No existe en backend; el catálogo se obtiene por subasta: `GET /subastas/{id}/catalogo` |
| `/items/{id}` | GET | ✅ | |
| `/items/{id}/imagenes` | GET | ✅ | |

### AUCTIONS

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/subastas` | GET | ✅ | |
| `/subastas/{id}` | GET | ✅ | |
| `/subastas/{id}/catalogo` | GET | ✅ | |
| `/subastas/{id}/conectar` | POST | ✅ | Contrato corregido: body `{ medioPagoId }` |
| `/subastas/{id}/desconectar` | POST | ✅ | |

### BIDS

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/subastas/{auctionId}/pujas/estado` | GET | ✅ | |
| `/subastas/{auctionId}/pujas` | POST | ✅ | Contrato corregido: body `{ itemId, monto, medioPagoId }` |
| `/subastas/{auctionId}/pujas/historial` | GET | ✅ | |

### PAYMENTS

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/usuarios/medios-pago` | GET | ✅ | |
| `/usuarios/medios-pago` | POST | ✅ | Corregido: `addPaymentMethod(MedioPagoRequest)` unificado; paths incorrectos eliminados |
| `/usuarios/medios-pago/{id}` | DELETE | ✅ | |

### CONSIGNMENT

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/consignaciones` | POST | ✅ | |
| `/consignaciones/{id}/aceptar-condiciones` | POST | ✅ | |
| `/consignaciones/{id}/rechazar-condiciones` | POST | ✅ | |
| `/consignaciones/{id}/ubicacion` | GET | ✅ | |
| `/consignaciones/{id}/poliza` | GET | ✅ | |

### METRICS

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/usuarios/metricas` | GET | ✅ | |
| `/usuarios/participaciones` | GET | ✅ | |
| `/usuarios/multas` | GET | ✅ | |
| `/usuarios/multas/{id}/pagar` | POST | ✅ | |

### PURCHASES

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/usuarios/compras/{id}` | GET | ✅ | |

### CHAT — backend implementado, frontend ausente

| Backend path | Método | Estado |
|---|---|---|
| `/compras/{compraId}/chat` | GET | ✅ Implementado — `chatService.getMessages(purchaseId)` |
| `/compras/{compraId}/chat` | POST | ✅ Implementado — `chatService.sendMessage(purchaseId, text)` |
| `/compras/{compraId}/entrega` | PATCH | ⚠️ Path agregado en `endpoints.ts` (`PURCHASES.DELIVERY`); sin servicio ni pantalla aún |

### WEBSOCKET STOMP — backend implementado, frontend ausente

| Destino STOMP | Dirección | Estado |
|---|---|---|
| `/app/subastas/{id}/pujar` | Cliente → Servidor | ❌ No hay cliente STOMP en el frontend |
| `/topic/subastas/{id}` | Servidor → Broadcast | ❌ No hay suscripción en el frontend |
| `/user/queue/pujas` | Servidor → Privado | ❌ No hay suscripción en el frontend |

---

## ════════════════════════
## 3. CONTRATOS DE DATOS
## ════════════════════════

### `POST /auth/registro/paso1`

| Campo | Frontend envía | Backend espera | Estado |
|---|---|---|---|
| `nombre` | `firstName` | `nombre` @NotBlank | ❌ Nombre de campo distinto |
| `apellido` | `lastName` | `apellido` @NotBlank | ❌ Nombre de campo distinto |
| `email` | `email` | `email` @Email @NotBlank | ✅ |
| `password` | `password` (aquí) | NO — va en paso 2 | ❌ Campo en paso incorrecto |
| `numeroDni` | NO enviado | `numeroDni` @NotBlank | ❌ Campo obligatorio faltante |
| `domicilioLegal` | NO enviado | `domicilioLegal` @NotBlank | ❌ Campo obligatorio faltante |
| `paisOrigen` | NO enviado | `paisOrigen` @NotBlank | ❌ Campo obligatorio faltante |
| `foto_dni_frente` | NO enviado | MultipartFile (recomendado) | ❌ Multipart no implementado |
| `foto_dni_dorso` | NO enviado | MultipartFile (recomendado) | ❌ Multipart no implementado |

### `POST /auth/registro/paso2`

| Campo | Frontend envía | Backend espera | Estado |
|---|---|---|---|
| `tokenEmail` | NO enviado | `tokenEmail` @NotBlank | ❌ Campo obligatorio faltante |
| `email` | NO enviado | `email` @NotBlank | ❌ Campo obligatorio faltante |
| `password` | NO enviado | `password` @Size(min=8) | ❌ Campo obligatorio faltante |
| `dni` | `dni` | NO | ❌ Campo extra (no esperado) |
| `phone` | `phone` | NO | ❌ Campo extra (no esperado) |
| `address` | `address` | NO | ❌ Campo extra (no esperado) |

**Conclusión**: los pasos están invertidos. El frontend manda en paso 1 datos que corresponden al paso 2 y viceversa; además omite `tokenEmail` que es el campo central del paso 2.

### `POST /subastas/{id}/conectar`

| Campo | Frontend envía | Backend espera | Estado |
|---|---|---|---|
| `medioPagoId` | `medioPagoId: number` | `medioPagoId` @NotNull Long | ✅ Corregido |

`auctionService.connectToAuction(id, medioPagoId)` — firma y body actualizados.

### `POST /subastas/{id}/pujas`

| Campo | Frontend envía | Backend espera | Estado |
|---|---|---|---|
| `monto` | `monto: number` | `monto: BigDecimal` | ✅ Corregido (era `amount`) |
| `itemId` | `itemId: number` | `itemId` @NotNull @Positive | ✅ Corregido |
| `medioPagoId` | `medioPagoId: number` | `medioPagoId` @NotNull @Positive | ✅ Corregido |

`bidService.placeBid(auctionId, itemId, monto, medioPagoId)` — firma y body actualizados.

### `POST /usuarios/medios-pago` (agregar medio de pago)

| Campo | Frontend envía | Backend espera | Estado |
|---|---|---|---|
| `tipo` | `'TARJETA_CREDITO' \| 'CUENTA_BANCARIA' \| 'CHEQUE_CERTIFICADO'` | `TipoMedioPago` enum | ✅ Corregido |
| `alias` | `string` | `alias` @NotBlank | ✅ Corregido |
| `moneda` | `'ARS' \| 'USD'` | `Moneda` enum | ✅ Corregido |
| campos por tipo | opcionales según `tipo` | opcionales según `tipo` | ✅ Corregido |

`paymentService.addPaymentMethod(MedioPagoRequest)` — reemplaza los 3 métodos separados (`addCard`, `addBankAccount`, `addCheck`) y sus paths incorrectos. Constantes huérfanas eliminadas de `endpoints.ts`.

### `GET /subastas` — response

Frontend accede a: `id`, `title`, `description`, `startDate`, `status`, `category`.  
Backend `SubastaResponse` expone todos esos campos. ✅  
Status map en `auctionService.ts`: `PROXIMA→upcoming, ABIERTA→active, CERRADA→finished`. ✅

### `GET /subastas/{id}` + `GET /subastas/{id}/catalogo` — response

| Campo accedido por frontend | Presente en DTO | Estado |
|---|---|---|
| `subasta.title`, `description`, `startDate`, `status`, `category` | `SubastaResponse` | ✅ |
| `subasta.rematador.id`, `firstName`, `lastName` | `SubastaResponse.rematador` | ✅ |
| `items[0].images[0].url` | `ItemResponse.images[].url` | ✅ |
| `items[0].startingPrice` | `ItemResponse.startingPrice` | ✅ |
| `items[0].currentPrice` | `ItemResponse.currentPrice` | ✅ |

`auctionService.getAuctionDetail()` está correctamente implementado y el mapeo de campos coincide. `AuctionDetailScreen.tsx` ahora lee `auctionId` de `route.params` y llama al servicio real.

### `GET /usuarios/perfil` — response

Frontend (via `authStore`) espera: `id`, `firstName`, `lastName`, `email`, `status`, `dni`.  
Backend `UsuarioResponse` expone todos esos campos más: `category`, `address`, `country`, `registeredAt`, `pendingFines`, `phone`, `avatarUrl`. ✅ Todos los campos del frontend están cubiertos.

---

## ════════════════════════
## 4. AUTENTICACIÓN
## ════════════════════════

### ¿El frontend envía el token JWT en los headers correctamente?

**✅ Mecanismo correcto** — `apiClient.ts` interceptor de request (línea 20-29):
```ts
config.headers.Authorization = `Bearer ${token}`;
```
Lee el token de `useAuthStore.getState().token`. Se aplica a todos los requests del cliente Axios.

### ¿El backend espera el token en el mismo formato?

**✅ Sí** — `JwtAuthFilter` extrae el token del header `Authorization: Bearer {token}`, firma HMAC-SHA256 via JJWT 0.12.6.

### ¿Hay endpoints protegidos que el frontend llama sin token?

**✅ CORREGIDO** — `LoginScreen.tsx` ahora llama a `authService.login(email, password)`, recibe el JWT real del backend y lo guarda en el store. Verificado con `juan@test.com` / `password123`.

### Manejo de 401

**✅ OK** — El response interceptor de `apiClient.ts` (línea 37-40) detecta 401 y llama a `useAuthStore.getState().logout()` automáticamente.

### Endpoints públicos (no requieren token)

Definidos en `SecurityConfig.java`:
- `POST /api/v1/auth/registro/paso1`
- `POST /api/v1/auth/registro/paso2`
- `POST /api/v1/auth/login`
- `GET /api/v1/subastas/*/catalogo`
- `/ws/**` (WebSocket handshake)
- `/swagger-ui/**`, `/v3/api-docs/**`

---

## ════════════════════════
## 5. MOCKS ACTIVOS
## ════════════════════════

### Mocks con condicional (flag `EXPO_PUBLIC_USE_MOCKS`)

| Archivo | Mock | Comportamiento |
|---|---|---|
| `ChatListScreen.tsx` | `MOCK_CHATS` (2 chats ficticios) | ⚠️ Pendiente — el backend no expone listado de chats del usuario; TODO documentado en el archivo |

**Nota**: `ChatDetailScreen.tsx` ya llama a `chatService.getMessages()` y `sendMessage()` con datos reales. El listado queda en mock hasta que el backend implemente `GET /compras/chat` o similar.

### Mocks HARDCODEADOS — siempre activos, ignoran el flag

| Archivo | Mock usado | Impacto |
|---|---|---|
| `HomeScreen.tsx` | ~~`MOCK_HOME_CATEGORIES`~~ | ✅ Reemplazado — llama a `auctionService.getAuctions()`, muestra loading/error |
| `AuctionDetailScreen.tsx` | ~~`MOCK_AUCTION_DETAIL`~~ | ✅ Reemplazado — lee `route.params.auctionId`, llama a `auctionService.getAuctionDetail(id)` |
| `MyBidsScreen.tsx` | `MOCK_BIDS` (4 pujas ficticias) | ❌ Pendiente — `metricsService` no devuelve la forma necesaria (`imageUrl`, `myBid`, `winning/losing`) |
| `MyAuctionsScreen.tsx` | `MOCK_AUCTIONS` (5 subastas ficticias) | ❌ Pendiente — `consignService.getConsignaciones()` no existe |
| `profileStore.ts` | `MOCK_USER`, `MOCK_ADDRESSES`, `MOCK_CARDS` | ❌ Pendiente — `username`/`avatarColor` no existen en backend; estructura de addresses/cards incompatible |

### ¿Hay algún mock que intercepta llamadas reales sin que sea obvio?

**Sí** — `profileStore.ts` inicializa el estado directamente con `MOCK_USER` sin ningún flag condicional ni comentario visible. Un desarrollador que llame a `useProfileStore()` recibirá datos de mock sin saberlo, incluso con `EXPO_PUBLIC_USE_MOCKS=false`.

---

## ════════════════════════
## 6. RESUMEN EJECUTIVO
## ════════════════════════

| Área | Estado | Acción requerida |
|---|---|---|
| **baseURL con prefijo `/api/v1`** | ✅ Resuelto | `apiClient.ts` detecta plataforma: `localhost` en web, `10.0.2.2` en Android |
| **CORS (Spring Boot)** | ✅ OK | Ninguna |
| **Variables de entorno backend** | ✅ OK | Ninguna |
| **Variables de entorno frontend** | ⚠️ Pendiente | URL resuelta. Falta cambiar `EXPO_PUBLIC_USE_MOCKS=false` para deshabilitar mocks |
| **Endpoints que coinciden (path)** | ✅ 18 de 29 | — |
| **Endpoints inexistentes en backend** | ⚠️ 2 paths restantes | `/auth/register/step3`, `/catalog/items` — los 3 `/payment-methods/...` fueron eliminados |
| **Endpoints del backend sin frontend** | ⚠️ 1 pendiente | Chat GET/POST resueltos. Falta: lógica de pantalla para `PATCH /compras/{id}/entrega` |
| **WebSocket STOMP** | ❌ No integrado | El backend tiene STOMP completo; el frontend no tiene cliente STOMP |
| **Contrato registro paso 1** | ❌ Roto | Reescribir: cambiar `firstName/lastName` → `nombre/apellido`, agregar `numeroDni`, `domicilioLegal`, `paisOrigen`, mover `password` al paso 2, implementar multipart |
| **Contrato registro paso 2** | ❌ Roto | Reescribir: agregar `tokenEmail` + `email` + `password`; quitar `dni`, `phone`, `address` |
| **Contrato `POST /auth/register/step3`** | ❌ Roto | Eliminar — este endpoint no existe |
| **Contrato `POST /subastas/{id}/conectar`** | ✅ Resuelto | `connectToAuction(id, medioPagoId)` envía `{ medioPagoId }` |
| **Contrato `POST /subastas/{id}/pujas`** | ✅ Resuelto | `placeBid(auctionId, itemId, monto, medioPagoId)` envía los 3 campos correctos |
| **Contrato `POST /usuarios/medios-pago`** | ✅ Resuelto | `addPaymentMethod(MedioPagoRequest)` unificado; paths incorrectos y constantes huérfanas eliminados |
| **`PUT /usuarios/perfil`** | ❌ Roto | El backend no expone este endpoint; definir si se implementa |
| **Login (autenticación real)** | ✅ Resuelto | `LoginScreen.tsx` llama a `authService.login()`, guarda JWT real. Verificado en web y emulador |
| **Mocks hardcodeados en screens** | ⚠️ 3 pendientes | `HomeScreen` y `AuctionDetailScreen` resueltos. Quedan: `MyBidsScreen`, `MyAuctionsScreen`, `profileStore` |
