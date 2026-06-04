# AUDIT-V2 — Auditoría de Integración — Sistema de Subastas DA1
**Fecha:** 2026-06-03  
**Rama:** main  
**Alcance:** monorepo completo (frontend React Native/Expo + backend Spring Boot 3.3.4)

---

## 1. CONECTIVIDAD BASE

### Base URL y prefijo /api/v1
- El backend no tiene `server.servlet.context-path`; el prefijo `/api/v1` está en cada `@RequestMapping` de los controllers.
- El frontend define: `http://localhost:8080/api/v1` (web) y `http://10.0.2.2:8080/api/v1` (emulador Android), configurable vía `EXPO_PUBLIC_API_URL`.
- **✅ Coincide**: ambos lados usan `/api/v1` como base.

### CORS
Backend (`SecurityConfig.java`):
```
Orígenes: ${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:4200,http://localhost:8081,http://10.0.2.2:8081,null}
Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS
Headers: * (todos)
Credentials: true
```
- **✅ Correcto**: el puerto 8081 de Expo está en la lista de orígenes por defecto.
- **⚠️ `null` origin**: incluir `null` como origen permitido habilita requests desde `file://` (apps empaquetadas). Aceptable en desarrollo, revisar antes de producción.

### Variables de entorno

**Frontend (`.env`):**
| Variable | Valor actual | Uso |
|---|---|---|
| `EXPO_PUBLIC_USE_MOCKS` | `false` | Definido pero **ignorado** en pantallas — ver §5 |
| `EXPO_PUBLIC_API_URL` | (no seteada) | Fallback a `localhost:8080` |
| `EXPO_PUBLIC_WS_URL` | (no seteada) | Fallback a `localhost:8080` |

**Backend (`application.properties`):**
| Variable | Valor por defecto (commiteado) | Riesgo |
|---|---|---|
| `DB_PASSWORD` | `8Z\|TmuL6k17V` | 🔴 Contraseña real en código fuente |
| `JWT_SECRET` | `mi-clave-secreta-de-desarrollo-local-12345` | 🔴 Secret débil y expuesto |
| `DB_USERNAME` | `root` | 🟡 Usuario root, no de aplicación |
| `ALLOWED_ORIGINS` | lista con `null` | 🟡 Ver arriba |

### EXPO_PUBLIC_USE_MOCKS actual
`false` en `.env`. La variable existe en todos los archivos de mock (`data/mockActivity.ts`, `data/mockProfile.ts`, `data/mockHomeCatalog.ts`) como `export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true'`, pero **ninguna pantalla la evalúa**. Los mocks de `MyBidsScreen` y `MyAuctionsScreen` están activos incondicionalmente. `LotDetailScreen` fue conectado a la API real (Paso 7b).

---

## 2. ENDPOINTS

### Leyenda
- ✅ Coincide — ruta, método y uso conectados
- ⚠️ Existe pero con problema — desconexión, mismatch de contrato, o sin pantalla
- ❌ No existe en backend

### AUTH
| Endpoint frontend | Método | Backend | Estado | Notas |
|---|---|---|---|---|
| `/auth/login` | POST | `AuthController` | ✅ | Conectado vía `LoginScreen` |
| `/auth/logout` | POST | `AuthController` | ⚠️ | Endpoint existe pero `authStore.logout()` no lo llama — solo limpia estado local |
| `/auth/registro/paso1` | POST | `AuthController` | ✅ | Conectado vía `RegisterStep2Screen` |
| `/auth/registro/paso2` | POST | `AuthController` | ⚠️ | Conectado pero `tokenEmail: 'dev-bypass'` hardcodeado (ver §11) |

### USUARIOS
| Endpoint frontend | Método | Backend | Estado | Notas |
|---|---|---|---|---|
| `/usuarios/perfil` | GET | `UsuarioController` | ✅ | Conectado vía `profileStore.loadProfile()` |
| `/usuarios/perfil` | PUT | `UsuarioController` | ✅ | Conectado vía `profileStore.updateAddress()` → `AddAddressScreen` |
| `/usuarios/medios-pago` | GET | `UsuarioController` | ✅ | Conectado vía `profileStore.loadProfile()` |
| `/usuarios/medios-pago` | POST | `UsuarioController` | ✅ | Conectado vía `RegisterStep3Screen`; **no conectado** desde `AddCardScreen` |
| `/usuarios/medios-pago/{id}` | DELETE | `UsuarioController` | ⚠️ | `paymentService.deletePaymentMethod()` implementado pero sin pantalla que lo llame |
| `/usuarios/multas` | GET | `UsuarioController` | ⚠️ | `metricsService.getFines()` tiene TODO, nunca llamado |
| `/usuarios/multas/{id}/pagar` | POST | `UsuarioController` | ⚠️ | `metricsService.payFine()` tiene TODO, nunca llamado |
| `/usuarios/compras` | GET | `UsuarioController` | ✅ | Conectado vía `chatService.getCompras()` → `ChatListScreen` |
| `/usuarios/compras/{id}` | GET | `UsuarioController` | ⚠️ | `purchaseService.getPurchaseDetail()` implementado pero sin pantalla conectada |
| `/usuarios/metricas` | GET | `UsuarioController` | ⚠️ | `metricsService.getStats()` tiene TODO, nunca llamado |
| `/usuarios/participaciones` | GET | `UsuarioController` | ⚠️ | `metricsService.getParticipationHistory()` tiene TODO, nunca llamado |

### SUBASTAS
| Endpoint frontend | Método | Backend | Estado | Notas |
|---|---|---|---|---|
| `/subastas` | GET | `SubastaController` | ✅ | Conectado vía `auctionService.getAuctions()` → `HomeScreen` |
| `/subastas/{id}` | GET | `SubastaController` | ✅ | Conectado vía `auctionService.getAuctionDetail()` |
| `/subastas/{id}/catalogo` | GET | `CatalogoController` | ✅ | Conectado vía `auctionService.getAuctionDetail()` (Promise.all) |
| `/subastas/{id}/conectar` | POST | `SubastaController` | ✅ | Conectado vía `auctionService.connectToAuction()` → `AuctionDetailScreen` |
| `/subastas/{id}/desconectar` | POST | `SubastaController` | ⚠️ | `auctionService.disconnectFromAuction()` marcado TODO, nunca llamado |
| `/subastas/{id}/pujas/estado` | GET | `SubastaController` | ⚠️ | `bidService.getCurrentBid()` marcado TODO; la pantalla usa WebSocket en su lugar |
| `/subastas/{id}/pujas` | POST | `SubastaController` | ⚠️ | `bidService.placeBid()` implementado pero `AuctionDetailScreen` usa WebSocket, no REST |
| `/subastas/{id}/pujas/historial` | GET | `SubastaController` | ⚠️ | `bidService.getBidHistory()` marcado TODO, nunca llamado |

### ITEMS / CATÁLOGO
| Endpoint frontend | Método | Backend | Estado | Notas |
|---|---|---|---|---|
| `/items/{id}` | GET | `CatalogoController` | ⚠️ | `catalogService.getItemDetail()` marcado TODO, nunca llamado |
| `/items/{id}/imagenes` | GET | `CatalogoController` | ⚠️ | `catalogService.getItemImages()` marcado TODO, nunca llamado |
| `/catalogo/items` | GET | — | ❌ | `catalogService.getItems()` usa esta ruta que **no existe en el backend** |

### COMPRAS / CHAT
| Endpoint frontend | Método | Backend | Estado | Notas |
|---|---|---|---|---|
| `/compras/{id}/chat` | GET | `ChatController` | ✅ | Conectado vía `chatService.getMessages()` → `ChatDetailScreen` |
| `/compras/{id}/chat` | POST | `ChatController` | ✅ | Conectado vía `chatService.sendMessage()` → `ChatDetailScreen` |
| `/compras/{id}/entrega` | PATCH | `ChatController` | ⚠️ | Definido en `endpoints.ts` como `PURCHASES.DELIVERY` pero sin servicio ni pantalla |

### CONSIGNACIONES
| Endpoint frontend | Método | Backend | Estado | Notas |
|---|---|---|---|---|
| `/consignaciones` | POST | `ConsignacionController` | ⚠️ | `consignService.submitItem()` marcado TODO; `UploadItemScreen` usa solo store local |
| `/consignaciones/{id}/aceptar-condiciones` | POST | `ConsignacionController` | ⚠️ | `consignService.acceptConditions()` marcado TODO, nunca llamado |
| `/consignaciones/{id}/rechazar-condiciones` | POST | `ConsignacionController` | ⚠️ | `consignService.rejectConditions()` marcado TODO, nunca llamado |
| `/consignaciones/{id}/ubicacion` | GET | `ConsignacionController` | ⚠️ | `consignService.getItemLocation()` marcado TODO, nunca llamado |
| `/consignaciones/{id}/poliza` | GET | `ConsignacionController` | ⚠️ | `consignService.getInsurancePolicy()` marcado TODO, nunca llamado |

### WEBSOCKET (STOMP)
| Destino | Dirección | Backend | Estado |
|---|---|---|---|
| `/app/subastas/{id}/pujar` | send | `PujaWebSocketController` | ✅ Conectado vía `useAuctionSocket.sendBid()` |
| `/topic/subastas/{id}` | subscribe | `PujaWebSocketController` broadcast | ✅ Conectado |
| `/user/queue/pujas` | subscribe | `PujaWebSocketController` privado | ✅ Conectado |

---

## 3. CONTRATOS DE DATOS

### POST /auth/login
| Campo | Frontend envía | Backend espera | ¿Match? |
|---|---|---|---|
| `email` | String | `@NotBlank @Email String` | ✅ |
| `password` | String | `@NotBlank String` | ✅ |

**Response:**
| Campo JSON | Frontend espera | Backend retorna | ¿Match? |
|---|---|---|---|
| `token` | `response.token` | `@JsonProperty("token") tokenAcceso` | ✅ |
| `user.id` | `response.user.id` | `UsuarioInfo.id` (Long) | ✅ |
| `user.firstName` | usado para nombre | `@JsonProperty("firstName") nombre` | ✅ |
| `user.status` | mapea APROBADO→approved, PENDIENTE→pending, BLOQUEADO→rejected | `EstadoUsuario` enum como string | ✅ |

### POST /auth/registro/paso2
| Campo | Frontend envía | Backend espera | ¿Match? |
|---|---|---|---|
| `tokenEmail` | `'dev-bypass'` (hardcodeado) | `@NotBlank String` | 🔴 Dev bypass activo en código |
| `email` | String | `@NotBlank @Email String` | ✅ |
| `password` | mín 8 chars (validación frontend) | `@NotBlank @Size(min=8) String` | ✅ Resuelto (Paso 1) |

### POST /usuarios/medios-pago (RegisterStep3Screen)
| Campo | Frontend envía | Backend espera | ¿Match? |
|---|---|---|---|
| `tipo` | `'TARJETA_CREDITO'` | `TipoMedioPago` enum | ✅ |
| `alias` | `cardName` | `@NotBlank String` | ✅ |
| `moneda` | `'ARS'` | `Moneda` enum | ✅ |
| `numeroTarjeta` | 16 dígitos | `String` | ✅ |
| `titular` | String | `String` | ✅ |
| `vencimiento` | formato `MM/YYYY` | `String` (sin validación de formato) | ⚠️ Se guarda pero en formato diferente al MM/YY que describe la entidad |
| `tipoTarjeta` | `'CREDITO'` | `String` (docs indican 'nacional'/'extranjera') | 🟡 Se guarda como string; semántica incorrecta |

### GET /usuarios/perfil — Response
| Campo JSON backend | Frontend usa en profileStore | ¿Match? |
|---|---|---|
| `firstName` | no mapeado directamente (profileStore usa `name`) | 🟡 Necesita concatenar `firstName + lastName` para `name` |
| `lastName` | no mapeado | 🟡 |
| `email` | `email` | ✅ |
| `category` | `category` | ✅ |
| `address` (= domicilioLegal) | `address` | ✅ |
| `status` | no mapeado en profileStore | ⚠️ No se verifica si el usuario fue bloqueado post-login |

### GET /usuarios/medios-pago — Response
Backend retorna `MedioPagoResponse { id, tipo, alias, moneda, verificado, montoLimite }`.  
`profileStore.loadProfile()` mapea → `{ id, alias, tipo, moneda, verificado }`.  
**✅ Resuelto (Paso 2)**: los campos `last4`, `brand` y `holderName` ya no están en el mapeo de `loadProfile()`.

### GET /usuarios/compras — Response
| Campo JSON backend | Frontend espera | ¿Match? |
|---|---|---|
| `compraId` | `compraId` | ✅ |
| `item` (objeto `{id, descripcion, numeroPieza}`) | `item` | ✅ |
| `estadoPago` | `estadoPago` | ✅ |
| `total` | `total` | ✅ |
| `moneda` | `moneda` | ✅ |

### GET/POST /compras/{id}/chat
| Campo | Backend retorna/espera | Frontend usa | ¿Match? |
|---|---|---|---|
| `mensajeId` | Long | `mensajeId` | ✅ |
| `remitente` | `USUARIO` o `EMPRESA` (enum serializado como string) | `!== 'USUARIO'` → tipo 'in' | ✅ |
| `contenido` | String | `contenido` | ✅ |
| `timestamp` | `LocalDateTime` (ISO string) | `timestamp` | ✅ |

### WebSocket — sendBid payload
| Campo | Frontend envía | Backend espera | ¿Match? |
|---|---|---|---|
| `itemId` | Long (de item.id) | `Long` | ✅ |
| `monto` | number | `BigDecimal` | ✅ |
| `medioPagoId` | `parseInt(card.id)` | `Long` | ✅ si card.id es string numérico |

---

## 4. AUTENTICACIÓN

- **JWT enviado correctamente**: `apiClient.ts` tiene interceptor de request que inyecta `Authorization: Bearer ${token}` desde `useAuthStore.getState().token`. ✅
- **WebSocket JWT**: `stompService.connect(token, onConnect)` envía el token en `connectHeaders`. El `WebSocketAuthInterceptor` del backend lo valida en el frame CONNECT. ✅
- **Error 401 manejado**: el interceptor de response detecta 401 y ejecuta `logout()` automáticamente. ✅
- **Token hardcodeado activo**: `RegisterStep2Screen` envía `tokenEmail: 'dev-bypass'` — si el backend valida el token de email, esto rompe el registro en producción. 🔴
- **Logout sin invalidar token**: `authStore.logout()` no llama a `POST /auth/logout` — solo limpia estado local. El token JWT queda válido en el servidor hasta expirar (24 horas). 🟡

---

## 5. CÓDIGO MUERTO

### Constantes en endpoints.ts sin servicio conectado
| Constante | Ruta | Problema |
|---|---|---|
| `PURCHASES.DELIVERY(id)` | `PATCH /compras/{id}/entrega` | Definida, sin servicio ni pantalla |
| `BIDS.CURRENT(id)` | `GET /subastas/{id}/pujas/estado` | Definida, servicio con TODO, pantalla usa WS |
| `BIDS.HISTORY(id)` | `GET /subastas/{id}/pujas/historial` | Definida, servicio con TODO, nadie la llama |
| `CATALOG.ITEM_DETAIL(id)` | `GET /items/{id}` | Definida, servicio con TODO |
| `CATALOG.ITEM_IMAGES(id)` | `GET /items/{id}/imagenes` | Definida, servicio con TODO |

### Servicios enteros sin ningún caller en pantallas
- `catalogService.ts` — 3 métodos TODO, nunca importado por ninguna pantalla o store
- `bidService.ts` — 4 métodos (algunos TODO), nunca importado (WebSocket se usa en su lugar)
- `consignService.ts` — 5 métodos TODO, nunca importado (`UploadItemScreen` usa solo store local)
- `metricsService.ts` — 4 métodos TODO, nunca importado
- `purchaseService.ts` — 1 método implementado, nunca importado por ninguna pantalla

### Mocks activos sin flag condicional
- `MyBidsScreen` — importa `MOCK_BIDS` directamente, nunca llama API. `USE_MOCKS` ignorado.
- `MyAuctionsScreen` — importa `MOCK_AUCTIONS` directamente, nunca llama API. `USE_MOCKS` ignorado.
- ~~`LotDetailScreen`~~ — ✅ Conectado a `auctionService.getLotDetail()` (Paso 7b).
- `myAuctionsStore` — `addSubmission()` genera IDs con `Date.now()` sin llamar al backend.
- ~~`AddCardScreen`~~ — ✅ Conectado a `paymentService.addPaymentMethod()` + recarga `loadProfile()` (Paso 4).

---

## 6. OVER-ENGINEERING

### Interfaces TypeScript definidas y nunca importadas
Ubicación: `front-end/src/types/index.ts` y `front-end/src/types/catalog.ts`
- `CatalogItem` — nunca importada; `MockBidItem` se usa en su lugar
- `CardPayment` — nunca importada; `MockCard` se usa en su lugar
- `CheckPayment` — nunca importada; `MockCheck` se usa en su lugar
- `ChatConversation` — nunca importada
- `PaymentMethod` — interfaz genérica, nunca importada; mocks locales se usan en su lugar
- `CatalogCardItem`, `CatalogCategory` — en `catalog.ts`, nunca importadas

### Servicios esqueleto sin implementación real
`catalogService`, `bidService`, `consignService`, `metricsService` y `purchaseService` tienen cuerpos con TODO o implementaciones que nadie llama — son código de andamiaje sin valor actual.

### Duplicación de lógica de puja
El frontend tiene dos caminos para pujar: `bidService.placeBid()` (REST) y `useAuctionSocket.sendBid()` (WebSocket). Solo el segundo está conectado. `bidService` es código duplicado que confunde el modelo de integración.

---

## 7. PROBLEMAS DE CONEXIÓN

### Pantallas con servicio disponible pero sin llamarlo
| Pantalla | Servicio disponible | Estado real |
|---|---|---|
| `MyBidsScreen` | `metricsService` / `bidService` | Usa `MOCK_BIDS` hardcodeado |
| `MyAuctionsScreen` | `consignService` / `myAuctionsStore` | Usa `MOCK_AUCTIONS` + store local |
| ~~`AddCardScreen`~~ | `paymentService.addPaymentMethod()` | ✅ Resuelto (Paso 4) |
| `UploadItemScreen` | `consignService.submitItem()` | Solo guarda en `myAuctionsStore` local |

### Stores no inicializados desde la API
- `auctionStore` — solo tiene setters; las pantallas llaman directamente a `auctionService` y manejan estado localmente sin persistir en el store.
- `bidStore` — solo tiene setters locales, no está conectado a ningún endpoint REST ni WebSocket.
- `myAuctionsStore` — genera datos locales con `Date.now()` sin backend.

### Flujos conectados en teoría pero con contrato roto
- ~~**ProfileScreen / `profileStore.loadProfile()`**~~: ✅ Resuelto (Paso 2) — mapeo usa los campos reales `{ id, alias, tipo, moneda, verificado }`.
- ~~**RegisterStep2Screen** (password)~~: ✅ Resuelto (Paso 1) — ambos lados validan mínimo 8 caracteres.
- **`authStore.logout()`**: no llama a `POST /auth/logout` → el token JWT sigue válido en el servidor hasta que expire (24 horas).

---

## 8. WEBSOCKET

### Desconexión al salir de AuctionDetailScreen
`useAuctionSocket` hook: el `useEffect` retorna `() => stompService.disconnect()` como cleanup.  
`stompService.disconnect()` llama `client?.deactivate()` y setea `client = null`.  
**✅ Correcto**: la desconexión se ejecuta en unmount, no quedan conexiones huérfanas.

### Reconexión al volver a AuctionDetailScreen
`stompService.connect(token, onConnect)`: si el client existe y está conectado, ejecuta `onConnect` inmediatamente. Si no existe (fue destruido en disconnect), crea uno nuevo y lo activa.  
El `reconnectDelay: 5000ms` aplica para reconexiones automáticas de la librería STOMP, no para navegación manual.  
**✅ Correcto**: el client se destruye en unmount y se recrea al volver — no hay conexión huérfana.

### Riesgo de race condition en conexión/desmontaje
Si el componente se desmonta durante la conexión inicial (antes de que `onConnect` se ejecute), `disconnect()` ya fue llamado pero el cliente STOMP puede completar la conexión asíncronamente e intentar suscribirse.  
**⚠️ Riesgo menor**: el guard `client?.connected` en `subscribe()` lo previene — retorna `null` en vez de suscribirse.

### JWT del WebSocket vs apiClient
`useAuctionSocket` obtiene el token de `useAuthStore.getState().token`.  
`apiClient` obtiene el token de `useAuthStore.getState().token`.  
**✅ Mismo store, mismo campo** — no hay divergencia de tokens.

---

## 9. MANEJO DE ERRORES

### Pantallas con errores silenciados o sin feedback visible
| Pantalla | Situación | Problema |
|---|---|---|
| `ChatDetailScreen` — `sendMessage` | `setSendError()` + revierte mensaje | ✅ Resuelto (Paso 3) |
| `ChatDetailScreen` — carga inicial | `catch` setea `loadError` | 🟡 Verificar que la UI renderiza el estado de error |
| `AuctionDetailScreen` — bid | Error WS llega por `rejection` state | ✅ Se muestra `bidError` al usuario |
| `HomeScreen` — `getAuctions()` | catch genérico | 🟡 Mensaje genérico; no diferencia timeout vs 401 vs 500 |
| `ProfileScreen` — `loadProfile()` | error state en store | ✅ Se muestra si `profileStore.error !== null` |

### Comportamiento si el backend no está disponible
- `HomeScreen`: muestra string de error genérico; la pantalla queda vacía.
- `AuctionDetailScreen`: muestra "No se pudo cargar la subasta." y la pantalla queda vacía.
- `ProfileScreen`: `loadProfile()` captura la excepción y setea `error`; la pantalla muestra el mensaje.
- `ChatListScreen`: si `getCompras()` falla, la lista queda vacía — verificar que el catch actualiza un estado visible.
- No hay toast global ni pantalla de error centralizada; cada pantalla maneja el error de forma inconsistente.

---

## 10. ESTADO DE CARGA

### Pantallas con loading state
| Pantalla | ¿Tiene ActivityIndicator? | Notas |
|---|---|---|
| `HomeScreen` | ✅ | Loading y error diferenciados |
| `AuctionDetailScreen` | ✅ | Loading y error diferenciados |
| `ProfileScreen` | ✅ (usa `isLoading` del store) | Loading y error diferenciados |
| `ChatDetailScreen` | ✅ | Loading y error diferenciados |
| `ChatListScreen` | ✅ (`isLoading` state) | Verificar que error state es visible |
| `AddAddressScreen` | ✅ (`saving` state) | Botón deshabilitado durante guardado |
| `RegisterStep2/3Screen` | ✅ | Botón deshabilitado durante submit |
| `MyBidsScreen` | ❌ No necesita (usa mocks) | Sin API call |
| `MyAuctionsScreen` | ❌ No necesita (usa mocks) | Sin API call |
| `UploadItemScreen` | ❌ Sin loading al confirmar | 🟡 El usuario puede presionar doble submit |

### profileStore.loadProfile() — race condition ✅ Resuelto (Paso 10)
`if (get().isLoading) return;` agregado al inicio del método. Si `ProfileScreen` re-monta, la segunda llamada aborta inmediatamente.

---

## 11. SEGURIDAD BÁSICA

### Credenciales y tokens hardcodeados
| Ubicación | Hallazgo | Severidad |
|---|---|---|
| `application.properties` — `DB_PASSWORD` | `8Z\|TmuL6k17V` como valor default commiteado al repo | 🔴 Crítico |
| `application.properties` — `JWT_SECRET` | `mi-clave-secreta-de-desarrollo-local-12345` como valor default commiteado | 🔴 Crítico |
| `application.properties` (comentario Azure SQL) | `password=${DB_PASSWORD:A12345678#}` — otro default en código | 🟡 Medio |
| `RegisterStep2Screen` | `tokenEmail: 'dev-bypass'` hardcodeado — bypass de verificación de email activo | 🔴 Crítico |

### .gitignore
- `front-end/.env` está en `.gitignore` ✅
- `application.properties` **no está en `.gitignore`** — los defaults con credenciales están commiteados ⚠️
- No existe `application-local.properties` ni mecanismo equivalente para sobrescribir localmente sin commitear

### Superficie de ataque adicional
- `spring.jpa.show-sql=true` activo — en producción logea queries al stdout con riesgo de exponer datos sensibles.
- `logging.level.com.subastas=DEBUG` — logs verbosos exponen trazas internas.
- Swagger UI (`/swagger-ui/**`) públicamente accesible sin autenticación — expone todos los endpoints, DTOs y esquemas del sistema.

---

## 12. RESUMEN EJECUTIVO

| Área | Estado | Severidad | Acción requerida |
|---|---|---|---|
| Credenciales en `application.properties` | 🔴 Roto | Crítico | Eliminar defaults de DB_PASSWORD y JWT_SECRET; usar env vars obligatorias sin fallback |
| `tokenEmail: 'dev-bypass'` en registro | 🔴 Roto | Crítico | El registro real requiere token de email válido; este hardcodeo rompe el flujo en producción |
| Password mismatch: 3 chars (frontend) vs 8 chars (backend) | ✅ Resuelto (Paso 1) | Crítico | — |
| Mapeo `MedioPagoResponse` → `MockCard` | ✅ Resuelto (Paso 2) | Crítico | — |
| `chatService.sendMessage` silencia errores | ✅ Resuelto (Paso 3) | Crítico | — |
| Mocks incondicionales en MyBids/MyAuctions | 🟡 Funciona con datos falsos | Medio | Conectar a API real o implementar switch por `EXPO_PUBLIC_USE_MOCKS`; LotDetail ✅ conectado (Paso 7b) |
| `authStore.logout()` no invalida token en backend | 🟡 Funciona con riesgo | Medio | Llamar `POST /auth/logout` antes de limpiar estado local |
| `/catalogo/items` no existe en backend | 🟡 Falla en runtime | Medio | `catalogService.getItems()` llama ruta inexistente; eliminar o corregir ruta |
| Servicios enteros sin implementación ni uso | 🟡 Deuda técnica | Medio | Implementar o eliminar `catalogService`, `bidService`, `consignService`, `metricsService`, `purchaseService` |
| `AddCardScreen` no llama API | ✅ Resuelto (Paso 4) | Medio | — |
| `UploadItemScreen` no llama `consignService` | 🟡 Funciona con datos falsos | Medio | Las consignaciones no llegan al backend |
| Race condition en `profileStore.loadProfile()` | ✅ Resuelto (Paso 10) | Menor | — |
| Interfaces TypeScript sin usar | 🟢 Limpieza | Menor | Eliminar `CatalogItem`, `CardPayment`, `CheckPayment`, `ChatConversation`, `PaymentMethod` de `types/` |
| `bidService` duplica lógica de WebSocket | 🟢 Limpieza | Menor | Eliminar el servicio REST de pujas; mantener solo WebSocket |
| `null` en `ALLOWED_ORIGINS` | 🟢 Riesgo bajo | Menor | Eliminar antes de producción |
| `show-sql=true` y `level=DEBUG` en producción | 🟢 Configuración | Menor | Crear `application-prod.properties` con valores apropiados |
| Swagger UI sin autenticación | 🟢 Exposición de API | Menor | Proteger con auth básica o deshabilitar en producción |
