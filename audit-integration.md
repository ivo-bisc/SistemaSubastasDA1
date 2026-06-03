# Auditoría de integración Backend ↔ Frontend

> Auditoría: 2026-06-02  
> Última actualización: 2026-06-03 (rev 3 — commits `cb73651`, `e36dab5`, `e9183ad`, `fa8cd1c` + sesión actual)  
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
| Frontend | `EXPO_PUBLIC_USE_MOCKS` | `false` | ✅ |

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
| `/auth/registro/paso1` | POST | ✅ | Contrato corregido: FormData multipart con `nombre`, `apellido`, `email`, `numeroDni`, `domicilioLegal`, `paisOrigen`, fotos DNI |
| `/auth/registro/paso2` | POST | ✅ | Contrato corregido: `{ tokenEmail, email, password }` |
| `/auth/register/step3` | POST | ✅ Eliminado | Constante `REGISTER_STEP3` y método `registerStep3` removidos |

### USERS

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/usuarios/perfil` | GET | ✅ | |
| `/usuarios/perfil` | PUT | ✅ | Endpoint implementado en backend (`ActualizarPerfilRequest`: firstName, lastName, phone); verificado con curl |

### CATALOG

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/catalog/items` | GET | ✅ Eliminado | Constante `CATALOG.ITEMS` removida de `endpoints.ts`; el catálogo se obtiene por `GET /subastas/{id}/catalogo` |
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
| `/usuarios/compras` | GET | ✅ | Nuevo endpoint — lista todas las compras del usuario; usado por `ChatListScreen` |
| `/usuarios/compras/{id}` | GET | ✅ | |

### CHAT — backend implementado, frontend ausente

| Backend path | Método | Estado |
|---|---|---|
| `/compras/{compraId}/chat` | GET | ✅ Implementado — `chatService.getMessages(purchaseId)`; `PURCHASES.CHAT` marcado como PENDIENTE en `endpoints.ts` |
| `/compras/{compraId}/chat` | POST | ✅ Implementado — `chatService.sendMessage(purchaseId, text)`; ídem |
| `/compras/{compraId}/entrega` | PATCH | ⚠️ `PURCHASES.DELIVERY` marcado como PENDIENTE en `endpoints.ts`; sin servicio ni pantalla |

### WEBSOCKET STOMP — ✅ INTEGRADO (commit `e9183ad`)

| Destino STOMP | Dirección | Estado |
|---|---|---|
| `/app/subastas/{id}/pujar` | Cliente → Servidor | ✅ `stompService.send()` vía `useAuctionSocket.sendBid()` |
| `/topic/subastas/{id}` | Servidor → Broadcast | ✅ Suscripción en `useAuctionSocket`; actualiza `currentPrice` en tiempo real |
| `/user/queue/pujas` | Servidor → Privado | ✅ Suscripción en `useAuctionSocket`; expone `confirmation` y `rejection` |

Archivos nuevos:
- `front-end/src/services/stompService.ts` — cliente STOMP (`@stomp/stompjs`), detección de plataforma (web → `localhost:8080`, Android → `10.0.2.2:8080`), reconexión automática, auth `Bearer` en headers de conexión. URL override vía `EXPO_PUBLIC_WS_URL`.
- `front-end/src/hooks/useAuctionSocket.ts` — hook que conecta, suscribe a ambos canales y expone `{ liveBid, confirmation, rejection, sendBid }`.
- Tipos `BidUpdatedMessage`, `BidConfirmedMessage`, `BidRejectedMessage` agregados a `front-end/src/types/index.ts`.

`AuctionDetailScreen.tsx` integra el hook:
- Actualiza `currentPrice` y `pujaMinima` en tiempo real cuando llega `BID_UPDATED`.
- Muestra banner de error cuando llega `BID_REJECTED`.
- Usa `sendBid({ itemId, monto, medioPagoId })` en lugar del REST `POST /subastas/{id}/pujas`.

---

## ════════════════════════
## 3. CONTRATOS DE DATOS
## ════════════════════════

### `POST /auth/registro/paso1`

| Campo | Frontend envía | Backend espera | Estado |
|---|---|---|---|
| `nombre` | `nombre` (de Step1 params) | `nombre` @NotBlank | ✅ Corregido |
| `apellido` | `apellido` (de Step1 params) | `apellido` @NotBlank | ✅ Corregido |
| `email` | `email` (de Step1 params) | `email` @Email @NotBlank | ✅ |
| `numeroDni` | `numeroDoc` (de Step2) | `numeroDni` @NotBlank | ✅ Corregido |
| `domicilioLegal` | `direccion` (de Step2) | `domicilioLegal` @NotBlank | ✅ Corregido |
| `paisOrigen` | `pais` (de Step2) | `paisOrigen` @NotBlank | ✅ Corregido |
| `foto_dni_frente` | URI del picker | MultipartFile | ✅ Implementado con `expo-image-picker` |
| `foto_dni_dorso` | URI del picker | MultipartFile | ✅ Implementado con `expo-image-picker` |

Step2 llama con FormData multipart. Step1 pasa sus datos a Step2 vía `route.params`.

### `POST /auth/registro/paso2`

| Campo | Frontend envía | Backend espera | Estado |
|---|---|---|---|
| `tokenEmail` | `'dev-bypass'` | `tokenEmail` @NotBlank | ✅ Corregido (bypass para dev; backend acepta `'dev-bypass'`) |
| `email` | `params.email` (de Step1) | `email` @NotBlank | ✅ Corregido |
| `password` | `params.password` (de Step1) | `password` @Size(min=8) | ✅ Corregido |

Llamado desde `RegisterStep2Screen` inmediatamente después de paso1. JWT guardado en `authStore` al recibir `tokenAcceso`.

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
| `ChatListScreen.tsx` | `MOCK_CHATS` (2 chats ficticios) | ⚠️ Mejorado (commit `cb73651`) — ahora respeta el flag: con `true` muestra MOCK_CHATS, con `false` lista vacía. TODO sigue vigente: el backend no expone listado de chats del usuario |

**Nota**: `ChatDetailScreen.tsx` llama a `chatService.getMessages()` y `sendMessage()` con datos reales. Acepta `purchaseId` o `conversationId` como param de navegación. El listado (`ChatListScreen`) queda en mock hasta que el backend implemente `GET /compras/chat` o similar.

### Mocks HARDCODEADOS — siempre activos, ignoran el flag

| Archivo | Mock usado | Impacto |
|---|---|---|
| `HomeScreen.tsx` | ~~`MOCK_HOME_CATEGORIES`~~ | ✅ Reemplazado — llama a `auctionService.getAuctions()`, muestra loading/error |
| `AuctionDetailScreen.tsx` | ~~`MOCK_AUCTION_DETAIL`~~ | ✅ Reemplazado — lee `route.params.auctionId`, llama a `auctionService.getAuctionDetail(id)` |
| `MyBidsScreen.tsx` | — | ✅ Pantalla eliminada del proyecto (no existe en `screens/profile/`) |
| `MyAuctionsScreen.tsx` | — | ✅ Pantalla eliminada del proyecto (no existe en `screens/profile/`) |
| `profileStore.ts` | ~~`MOCK_USER`, `MOCK_CARDS`, `MOCK_CHECKS`~~ | ✅ Conectado — `loadProfile()` llama a `GET /usuarios/perfil` y `GET /usuarios/medios-pago`; estado inicial vacío; `isLoading`/`error` agregados. `MOCK_ADDRESSES` se mantiene hasta que el backend exponga `GET /usuarios/direcciones` (TODO comentado en el store) |

### ¿Hay algún mock que intercepta llamadas reales sin que sea obvio?

**No** — `profileStore.ts` ya no inicializa con datos de mock. El estado arranca vacío y se puebla mediante `loadProfile()`. Queda pendiente llamar a `loadProfile()` desde `ProfileScreen` al montar la pantalla.

---

## ════════════════════════
## 6. RESUMEN EJECUTIVO
## ════════════════════════

### ✅ Resuelto

| Área | Detalle |
|---|---|
| **baseURL con prefijo `/api/v1`** | `apiClient.ts` detecta plataforma: `localhost` en web, `10.0.2.2` en Android |
| **CORS (Spring Boot)** | Configurado en `SecurityConfig.java`; orígenes, métodos y headers correctos |
| **Variables de entorno backend** | DB, JWT y CORS configurados con defaults de desarrollo |
| **WebSocket STOMP** | `stompService.ts` + `useAuctionSocket.ts`; `AuctionDetailScreen` usa WebSocket para pujas en tiempo real (commit `e9183ad`) |
| **Selectores Android en RegisterStep2** | `tipoDoc` y `pais` usan `Modal` nativo + `FlatList`, fuera del ScrollView (commit `e36dab5`) |
| **Login (autenticación real)** | `LoginScreen.tsx` llama a `authService.login()`, guarda JWT real |
| **Contrato registro paso 1** | FormData multipart con datos de Step1+Step2+fotos DNI |
| **Contrato registro paso 2** | `{ tokenEmail: 'dev-bypass', email, password }` — bypass habilitado en backend |
| **Contrato `POST /auth/register/step3`** | Constante y método eliminados del frontend |
| **Contrato `POST /subastas/{id}/conectar`** | `connectToAuction(id, medioPagoId)` envía `{ medioPagoId }` |
| **Contrato `POST /subastas/{id}/pujas`** | Resuelto vía WS — `useAuctionSocket.sendBid()` publica en `/app/subastas/{id}/pujar` |
| **Contrato `POST /usuarios/medios-pago`** | `addPaymentMethod(MedioPagoRequest)` unificado; paths incorrectos y constantes huérfanas eliminados |
| **Mocks en `HomeScreen` y `AuctionDetailScreen`** | Reemplazados por llamadas reales al backend |
| **`MyBidsScreen` / `MyAuctionsScreen`** | Pantallas eliminadas del proyecto; mocks ya no aplican |
| **Chat GET/POST** | `ChatDetailScreen` llama a `chatService.getMessages()` y `sendMessage()` con datos reales |
| **`PUT /usuarios/perfil`** | Endpoint implementado en backend (`ActualizarPerfilRequest`: firstName, lastName, phone); verificado con curl; path coincide con `endpoints.ts` |
| **`profileStore.ts` conectado al backend** | `loadProfile()` reemplaza MOCK_USER/MOCK_CARDS/MOCK_CHECKS con llamadas reales; `isLoading`/`error` agregados |
| **`ProfileScreen` carga datos reales** | `useEffect` llama a `loadProfile()` al montar; loading y error manejados visualmente |
| **`ChatListScreen` conectada al backend** | `GET /usuarios/compras` nuevo en backend; `ChatListScreen` reemplaza mock por llamada real |
| **DataLoader: compra + chat de prueba** | `subasta3` CERRADA + `item3` VENDIDO + `compra1` (Juan) + 3 `MensajeChat` cargados al iniciar con BD vacía |
| **`CATALOG.ITEMS` eliminado** | Constante removida de `endpoints.ts`; no existía en backend |
| **`EXPO_PUBLIC_USE_MOCKS=false`** | Mocks desactivados en `.env` |
| **`MOCK_ADDRESSES` eliminado** | `AddressListScreen` muestra `domicilioLegal` del usuario; `AddAddressScreen` edita vía `PUT /usuarios/perfil` con campo `domicilioLegal` agregado al backend |

---

### ⚠️ Pendiente

| Área | Qué falta |
|---|---|
| **`PATCH /compras/{id}/entrega`** | `PURCHASES.DELIVERY` marcado en `endpoints.ts`; sin servicio ni pantalla en el frontend |
| **DataLoader: truncate manual** | Los datos de prueba (compra1 + 3 mensajes) solo se cargan si la BD está vacía al arrancar; requiere truncate manual si ya había datos previos |
