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
| `/subastas/{id}/conectar` | POST | ✅ | Path correcto; contrato roto (ver sección 3) |
| `/subastas/{id}/desconectar` | POST | ✅ | |

### BIDS

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/subastas/{auctionId}/pujas/estado` | GET | ✅ | |
| `/subastas/{auctionId}/pujas` | POST | ✅ | Path correcto; contrato roto (ver sección 3) |
| `/subastas/{auctionId}/pujas/historial` | GET | ✅ | |

### PAYMENTS

| Frontend path | Método | Estado | Observación |
|---|---|---|---|
| `/usuarios/medios-pago` | GET | ✅ | |
| `/payment-methods/card` | POST | ❌ | Backend usa `POST /usuarios/medios-pago` unificado con campo `tipo` |
| `/payment-methods/bank-account` | POST | ❌ | Ídem |
| `/payment-methods/check` | POST | ❌ | Ídem |
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
| `/compras/{compraId}/chat` | GET | ❌ Falta en frontend |
| `/compras/{compraId}/chat` | POST | ❌ Falta en frontend |
| `/compras/{compraId}/entrega` | PATCH | ❌ Falta en frontend |

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
| `medioPagoId` | NO enviado (body vacío) | `medioPagoId` @NotNull Long | ❌ Campo obligatorio faltante |

`auctionService.ts` llama `apiClient.post(url)` sin body — el backend rechazará con 400.

### `POST /subastas/{id}/pujas`

| Campo | Frontend envía | Backend espera | Estado |
|---|---|---|---|
| `amount` | `amount: number` | `monto: BigDecimal` | ❌ Nombre de campo distinto |
| `itemId` | NO enviado | `itemId` @NotNull @Positive | ❌ Campo obligatorio faltante |
| `medioPagoId` | NO enviado | `medioPagoId` @NotNull @Positive | ❌ Campo obligatorio faltante |

### `POST /usuarios/medios-pago` (agregar tarjeta)

Frontend (`paymentService.ts`) envía a `/payment-methods/card`:
```json
{ "cardNumber": "...", "cardHolder": "...", "expirationDate": "...", "cvv": "..." }
```

Backend espera en `POST /usuarios/medios-pago`:
```json
{
  "tipo": "TARJETA_CREDITO",
  "alias": "...",
  "moneda": "ARS|USD",
  "numeroTarjeta": "...",
  "titular": "...",
  "vencimiento": "...",
  "tipoTarjeta": "..."
}
```

❌ Path incorrecto + campos distintos en los 3 tipos (tarjeta, banco, cheque).

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

`auctionService.getAuctionDetail()` está correctamente implementado y el mapeo de campos coincide. Sin embargo, `AuctionDetailScreen.tsx` nunca llama a este servicio — usa `MOCK_AUCTION_DETAIL` hardcodeado.

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
| `ChatListScreen.tsx` línea 69 | `MOCK_CHATS` (2 chats ficticios) | Usa mocks si `EXPO_PUBLIC_USE_MOCKS=true`; lista vacía si false |

**Actualmente**: `.env` tiene `EXPO_PUBLIC_USE_MOCKS=true` → ChatListScreen siempre muestra mocks.

### Mocks HARDCODEADOS — siempre activos, ignoran el flag

| Archivo | Mock usado | Impacto |
|---|---|---|
| `HomeScreen.tsx` línea 54 | `MOCK_HOME_CATEGORIES` (3 categorías, 9 items ficticios) | El Home nunca llama a ningún endpoint de la API |
| `AuctionDetailScreen.tsx` línea 30 | `MOCK_AUCTION_DETAIL` (subasta única hardcodeada) | El detalle nunca llama a `auctionService.getAuctionDetail()`, aunque el servicio está implementado |
| `MyBidsScreen.tsx` línea 17 | `MOCK_BIDS` (4 pujas ficticias) | La pantalla de mis pujas nunca llama a la API |
| `MyAuctionsScreen.tsx` línea 20 | `MOCK_AUCTIONS` (5 subastas ficticias) | Combina mocks con `userSubmissions` del store; nunca consulta el backend |
| `profileStore.ts` líneas 37-46 | `MOCK_USER`, `MOCK_ADDRESSES`, `MOCK_CARDS` | El store se inicializa con datos falsos; `GET /usuarios/perfil` nunca se llama |

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
| **Endpoints inexistentes en backend** | ❌ 5 paths | Eliminar `/auth/register/step3`, `/catalog/items`, `/payment-methods/{card,bank-account,check}` del frontend |
| **Endpoints del backend sin frontend** | ❌ 3 endpoints | Implementar chat (GET/POST `compras/{id}/chat`) y entrega (PATCH `compras/{id}/entrega`) |
| **WebSocket STOMP** | ❌ No integrado | El backend tiene STOMP completo; el frontend no tiene cliente STOMP |
| **Contrato registro paso 1** | ❌ Roto | Reescribir: cambiar `firstName/lastName` → `nombre/apellido`, agregar `numeroDni`, `domicilioLegal`, `paisOrigen`, mover `password` al paso 2, implementar multipart |
| **Contrato registro paso 2** | ❌ Roto | Reescribir: agregar `tokenEmail` + `email` + `password`; quitar `dni`, `phone`, `address` |
| **Contrato `POST /auth/register/step3`** | ❌ Roto | Eliminar — este endpoint no existe |
| **Contrato `POST /subastas/{id}/conectar`** | ❌ Roto | Agregar `medioPagoId` en el body |
| **Contrato `POST /subastas/{id}/pujas`** | ❌ Roto | Cambiar `amount` → `monto`; agregar `itemId` y `medioPagoId` |
| **Contrato `POST /usuarios/medios-pago`** | ❌ Roto | Unificar los 3 endpoints en uno; adaptar campos al DTO `MedioPagoRequest` |
| **`PUT /usuarios/perfil`** | ❌ Roto | El backend no expone este endpoint; definir si se implementa |
| **Login (autenticación real)** | ✅ Resuelto | `LoginScreen.tsx` llama a `authService.login()`, guarda JWT real. Verificado en web y emulador |
| **Mocks hardcodeados en screens** | ❌ 5 archivos | `HomeScreen`, `AuctionDetailScreen`, `MyBidsScreen`, `MyAuctionsScreen`, `profileStore` usan mocks sin condicional |
