# Plan: Correcciones Entrega 2 (BidUp - Sistema de Subastas DA1)

> Este archivo sirve como checklist de seguimiento durante la implementación de `CorreccionesEntrega2.md`. Marcar cada item con `✅ Resuelto` a medida que se completa.

## Contexto

`CorreccionesEntrega2.md` pide 3 mejoras para la próxima entrega:

1. **Login/Registro**: la "verificación" hoy es un mock con `Thread.sleep(3000)` que nunca rechaza nada, y `registroPaso1()` asigna `categoria=COMUN` hardcodeado mientras `registroPaso2()` aprueba al usuario (`estado=APROBADO`) automáticamente. Hay que reemplazar esto por una aprobación real hecha por un actor "empresa/admin", que además asigna la `categoria` del usuario.
2. **Comprador**: el acceso a subastas según categoría del usuario vs. categoría de la subasta. **Ya está implementado** en `SubastaService` (`listar`, `obtener`, `conectar`) vía `Categoria.puedeAcceder()`. Esta área es mayormente verificación.
3. **Vendedor/Consignación**: la "revisión" hoy es un mock (`MockRevisionConsignacionService.revisarYAceptar`) que siempre acepta automáticamente con valores calculados. Hay que reemplazar esto por una revisión real de admin que propone condiciones (precio base, comisión, fecha de subasta, categoría), y el usuario decide aceptar/rechazar. El enum `EstadoConsignacion` se redefine a 6 valores exactos: `PENDIENTE_INSPECCION, RECHAZADO, PROPUESTA_ENVIADA, ACEPTADO_POR_USUARIO, RECHAZADO_POR_USUARIO, INCLUIDO_EN_SUBASTA`.

**Decisiones ya tomadas con el usuario** (no rediscutir):
- Se agrega un actor "admin/empresa" real: campo `rol` (`POSTOR`/`ADMIN`) en `Usuario`, `ROLE_ADMIN`, un `AdminController` nuevo, un usuario admin seedeado, y una sección "Admin" dentro de la misma app (tab condicional visible solo para esa cuenta).
- `EstadoConsignacion` queda con EXACTAMENTE los 6 valores pedidos. Se elimina `VENDIDA` (el ciclo de vida posterior lo sigue trackeando `Item.estado`).
- Mientras `estado != APROBADO` (y no es ADMIN), el backend bloquea con 403 los endpoints protegidos, excepto `GET/PUT /api/v1/usuarios/perfil` y `POST /api/v1/auth/logout` (para que la pantalla de espera pueda hacer polling).

El cambio de valores del enum `EstadoConsignacion` (con `@Enumerated(EnumType.STRING)`) invalida las filas existentes en MySQL. Como el proyecto usa `spring.jpa.hibernate.ddl-auto=update` (sin Flyway/Liquibase), la mitigación pragmática es **recrear la base de datos local** (drop + reiniciar backend para que `DataLoader` repueble) en los puntos indicados más abajo. No se escribe ningún script de migración SQL.

---

## 0. Infraestructura de Admin (transversal, va primero)

### ✅ Resuelto — 0.1 — `RolUsuario` + campo `rol` en `Usuario`
- Nuevo: `backend/src/main/java/com/subastas/model/enums/RolUsuario.java` → `public enum RolUsuario { POSTOR, ADMIN }`
- Modificar `backend/src/main/java/com/subastas/model/entity/Usuario.java`:
  - Agregar `@Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default private RolUsuario rol = RolUsuario.POSTOR;` (el `@Builder.Default` evita romper los builders existentes en `AuthService`/`DataLoader`).
  - Hacer `categoria` nullable (quitar `nullable = false`): un usuario `PENDIENTE_VERIFICACION` que recién completó el registro literalmente no tiene categoría asignada todavía.
- **Complejidad: Baja.**

### ✅ Resuelto — 0.2 — `ROLE_ADMIN` vía `UserDetailsServiceImpl`
- Modificar `backend/src/main/java/com/subastas/security/UserDetailsServiceImpl.java`: si `usuario.getRol() == RolUsuario.ADMIN`, otorgar `ROLE_ADMIN` además de `ROLE_USER`; si no, solo `ROLE_USER`.
- **Complejidad: Baja.** Depende de 0.1.

### ✅ Resuelto — 0.3 — Exponer `rol` en DTOs
- `UsuarioResponse.java`: agregar `@JsonProperty("role") private RolUsuario rol;`.
- `LoginResponse.java` (`UsuarioInfo`): agregar el mismo campo `rol` con `@JsonProperty("role")`.
- `UsuarioService.java`: en el mapeo a `UsuarioResponse`, incluir `.rol(u.getRol())`.
- `AuthService.java`: en `login()`, al construir `LoginResponse.UsuarioInfo`, incluir `.rol(usuario.getRol())`.
- **Complejidad: Baja.** Depende de 0.1.

### ✅ Resuelto — 0.4 — `AdminController` + `AdminService` (núcleo de la nueva infraestructura)

Nuevos archivos:
- `controller/AdminController.java`
- `service/AdminService.java`
- DTOs request nuevos: `AprobarUsuarioRequest`, `ProponerCondicionesRequest`, `RechazarConsignacionRequest` (en `model/dto/request/`)

Para las respuestas se reutilizan `UsuarioResponse` y `ConsignacionResponse`.

**Endpoints** (todos bajo `/api/v1/admin`, protegidos con `hasRole("ADMIN")`):

1. `GET /api/v1/admin/usuarios/pendientes` → `List<UsuarioResponse>` de usuarios con `estado == PENDIENTE_VERIFICACION` y `tokenEmail == null`. Repository: `findByEstadoAndTokenEmailIsNull(EstadoUsuario estado)`.
2. `POST /api/v1/admin/usuarios/{id}/aprobar` → body `AprobarUsuarioRequest { categoria }`. 404 si no existe; `ESTADO_INVALIDO` si `estado != PENDIENTE_VERIFICACION`; setea `categoria` + `estado = APROBADO`. Respuesta: `UsuarioResponse`.
3. `POST /api/v1/admin/usuarios/{id}/rechazar` → sin body. `ESTADO_INVALIDO` si `estado != PENDIENTE_VERIFICACION`; setea `estado = BLOQUEADO`. Respuesta: `UsuarioResponse`.
4. `GET /api/v1/admin/consignaciones/pendientes` → `List<ConsignacionResponse>` con `estado == PENDIENTE_INSPECCION`. Repository: `findByEstadoOrderByIdAsc(EstadoConsignacion estado)`. `ConsignacionResponse` gana `usuarioNombre`/`usuarioEmail` opcionales (solo poblados por `AdminService`).
5. `POST /api/v1/admin/consignaciones/{id}/proponer` → body `ProponerCondicionesRequest { valorBase, comisiones, fechaSubasta, categoria }`. `ESTADO_INVALIDO` si `estado != PENDIENTE_INSPECCION`; setea `valorBase`, `comisiones`, `fechaSubastaPropuesta`, `categoriaPropuesta`, `estado = PROPUESTA_ENVIADA`. Respuesta: `ConsignacionResponse`.
6. `POST /api/v1/admin/consignaciones/{id}/rechazar` → body `RechazarConsignacionRequest { motivoRechazo }`. `ESTADO_INVALIDO` si `estado != PENDIENTE_INSPECCION`; setea `motivoRechazo` + `estado = RECHAZADO`. Respuesta: `ConsignacionResponse`.

Seguridad: en `SecurityConfig.java`, agregar `.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")` antes de `anyRequest().authenticated()`.

- **Complejidad: Alta.** Depende de 0.1, 0.2, 2.1, 2.2.

### ✅ Resuelto — 0.5 — Frontend: sección "Admin"

- `types/index.ts`: `User` gana `role: 'POSTOR' | 'ADMIN'` y `category?: string`; `MainTabParamList` gana `Admin: undefined`; nuevo `AdminStackParamList` (`AdminHome`, `AdminPendingUsers`, `AdminPendingConsignments`, `AdminProposeConditions: { consignacionId: string }`); `RootStackParamList` gana `PendingApproval: undefined` (se mueve desde `AuthStackParamList`).
- `stores/authStore.ts`: agregar `updateUserRole(role)` análogo a `updateUserStatus`.
- `stores/profileStore.ts`: en `loadProfile()`, llamar también `useAuthStore.getState().updateUserRole(u.role)`.
- `screens/auth/LoginScreen.tsx`: agregar `role: u.role` al construir `User`.
- Nuevo `services/adminService.ts`: `getPendingUsers`, `approveUser`, `rejectUser`, `getPendingConsignments`, `proposeConditions`, `rejectConsignment`. Registrar en `services/index.ts`.
- `constants/endpoints.ts`: nueva sección `ADMIN` con las 6 rutas.
- Navegación: nuevo `navigation/AdminStack.tsx`; en `MainNavigator.tsx` agregar `<Tab.Screen name="Admin" ...>` condicional a `user?.role === 'ADMIN'`, + entrada en `TAB_ICONS`.
- Pantallas nuevas en `screens/admin/`: `AdminHomeScreen.tsx`, `AdminPendingUsersScreen.tsx`, `AdminPendingConsignmentsScreen.tsx`, `AdminProposeConditionsScreen.tsx` (+ `index.ts`). `fechaSubasta` como input de texto simple `YYYY-MM-DDTHH:mm` — **NO agregar librería de date-picker**.
- **Complejidad: Alta.** Depende de 0.4, 0.3.

---

## 1. Flujo Login/Registro

### ✅ Resuelto — 1.1 — `registroPaso1()`: no asignar categoría fija
- Quitar `.categoria(Categoria.COMUN)` del builder de `Usuario`. La categoría queda `null` hasta que el admin la asigne. Requiere 0.1.
- `RegistroResponse`: manejar `categoria == null` sin NPE.
- **Complejidad: Media.**

### ✅ Resuelto — 1.2 — `registroPaso2()`: ya no auto-aprueba
- Eliminar `usuario.setEstado(EstadoUsuario.APROBADO)`. El usuario queda en `PENDIENTE_VERIFICACION` (ahora significa "registro completo, esperando aprobación de admin"). Se sigue generando y devolviendo el JWT.
- **Complejidad: Baja.** Depende de 1.1.

### [ ] 1.3 — `MockVerificacionService`: sin cambios de lógica
- Se mantiene tal cual (mock de "envío de email con token" para el paso 2). Ajustar Javadoc si hace falta aclarar que es solo para el email.
- **Complejidad: Baja (sin cambios funcionales).**

### ✅ Resuelto — 1.4 — `login()`: ajustar mensaje para `PENDIENTE_VERIFICACION`
- Cambiar el mensaje de `BusinessException(ErrorCodes.REGISTRO_INCOMPLETO, ...)` a algo genérico como "Tu cuenta está pendiente de aprobación. Intentá más tarde.", manteniendo el mismo código.
- **Complejidad: Baja.** Depende de 1.2.

### ✅ Resuelto — 1.5 — Frontend: `PendingApprovalScreen` con polling real
- Eliminar `setTimeout(5000)` + `setGuest()`.
- Poll cada ~5s con `useProfileStore.getState().loadProfile()`. Reaccionar a `user?.status`: `'approved'` → nada (RootNavigator cambia de rama), `'rejected'` → mostrar mensaje de rechazo + volver a Access/Login, `'pending'` → seguir polleando. Cleanup del interval.
- **Complejidad: Media.** Depende de 0.5, 3.1, 3.2.

### ✅ Resuelto — 1.6 — `DataLoader`: usuario admin + usuario pendiente + consignaciones
- Usuario `ADMIN` seedeado: `admin@subastas.com`/`admin123`, `rol=ADMIN`, `estado=APROBADO`, `categoria=PLATINO`.
- Usuario pendiente: `pendiente@test.com`/`password123`, `rol=POSTOR`, `estado=PENDIENTE_VERIFICACION`, `categoria=null`, `tokenEmail=null` (paso2 completo, espera aprobación).
- Consignaciones cubriendo 5 de los 6 estados nuevos: `PROPUESTA_ENVIADA` (+ fix `categoriaPropuesta` para no romper `asignarSubasta()`), `PENDIENTE_INSPECCION`, `RECHAZADO`, `ACEPTADO_POR_USUARIO`, `INCLUIDO_EN_SUBASTA`. `RECHAZADO_POR_USUARIO` queda para prueba manual.
- `log.info` final actualizado con 4 usuarios / 5 consignaciones y las 4 credenciales de prueba.
- **Complejidad: Baja.** Depende de 0.1, 1.1. Se ejecuta en Bloque E.

---

## 2. Vendedor / Consignación — redefinir el ciclo de vida

### ✅ Resuelto — 2.1 — Redefinir `EstadoConsignacion` (6 valores exactos)
```java
public enum EstadoConsignacion {
    PENDIENTE_INSPECCION,
    RECHAZADO,
    PROPUESTA_ENVIADA,
    ACEPTADO_POR_USUARIO,
    RECHAZADO_POR_USUARIO,
    INCLUIDO_EN_SUBASTA
}
```
Se eliminan `PENDIENTE_REVISION, ACEPTADA, RECHAZADA, EN_SUBASTA, VENDIDA, DEVUELTA`. **Requiere recrear la BD local.**
- **Complejidad: Baja** (operativamente, bloquea 2.2-2.5, 0.4, 4.x).

### ✅ Resuelto — 2.2 — Nuevos campos en `Consignacion`
```java
@Column(name = "fecha_subasta_propuesta")
private LocalDateTime fechaSubastaPropuesta;

@Enumerated(EnumType.STRING)
@Column(name = "categoria_propuesta")
private Categoria categoriaPropuesta;
```
- **Complejidad: Baja.**

### ✅ Resuelto — 2.3 — `ConsignacionService.crear()`: ya no dispara auto-aceptación
- `.estado(PENDIENTE_INSPECCION)`. Eliminar la llamada a `mockRevisionConsignacionService.revisarYAceptar(...)`.
- **Complejidad: Baja.** Depende de 2.1.

### ✅ Resuelto — 2.4 — Eliminar `MockRevisionConsignacionService.revisarYAceptar()`
- Eliminar el método completo. `asignarSubasta()` se mantiene en este archivo, reescrito en 4.2. No renombrar la clase. Ajustar Javadoc.
- **Complejidad: Media.** Depende de 2.1, 2.2.

### ✅ Resuelto — 2.5 — Nuevos códigos de error
- `ErrorCodes.java`: agregar `USUARIO_PENDIENTE_APROBACION`. Para `AdminService`, reutilizar `ESTADO_INVALIDO`.
- **Complejidad: Baja.**

---

## 3. Filtro de acceso durante `PENDIENTE_VERIFICACION`

### ✅ Resuelto — 3.1 — `UserStatusFilter`
- Nuevo `security/UserStatusFilter.java`, `extends OncePerRequestFilter`, inyecta `UsuarioRepository`.
- Lógica: sin `Authentication` → dejar pasar. Si `usuario.getRol() == ADMIN` → dejar pasar siempre. Si `estado != APROBADO`: permitir solo `GET/PUT /api/v1/usuarios/perfil` y `POST /api/v1/auth/logout`; el resto → 403 con `ErrorResponse(USUARIO_PENDIENTE_APROBACION, "Tu cuenta está pendiente de aprobación")` vía `ObjectMapper` inyectado.
- `SecurityConfig.java`: inyectar `UserStatusFilter`, `.addFilterAfter(userStatusFilter, JwtAuthFilter.class)`.
- **Complejidad: Media.** Depende de 0.1, 2.5.

### ✅ Resuelto — 3.2 — Frontend: `RootNavigator` reacciona al `status`
- 3 ramas: `!isAuthenticated && !isGuest` → `Auth`; `isAuthenticated && user?.status !== 'approved'` → `PendingApproval`; resto → `Main` + `AuctionDetail`.
- Mover `PendingApproval` de `AuthStackParamList`/`AuthNavigator` a `RootStackParamList`/`RootNavigator`.
- `RegisterStep3Screen.tsx`: quitar las llamadas a `navigation.navigate('PendingApproval', ...)` (innecesarias, RootNavigator reacciona solo).
- **Complejidad: Media-Alta.** Depende de 0.5, 1.5, 3.1.

---

## 4. Vendedor — aceptar/rechazar condiciones reales

### ✅ Resuelto — 4.1 — `ConsignacionService`: nuevo gate en `PROPUESTA_ENVIADA`
- `obtenerConsignacionParaDecision()`: `estado != ACEPTADA` → `estado != PROPUESTA_ENVIADA`.
- `aceptarCondiciones()`: → `ACEPTADO_POR_USUARIO`; guardar; disparar `mockRevisionConsignacionService.asignarSubasta(...)`. `fechaSubasta` de la respuesta = `consignacion.getFechaSubastaPropuesta()`.
- `rechazarCondiciones()`: → `RECHAZADO_POR_USUARIO`.
- **Complejidad: Baja.** Depende de 2.1, 2.2.

### ✅ Resuelto — 4.2 — Reescribir `MockRevisionConsignacionService.asignarSubasta()`
- Mantener `Thread.sleep(3000)` + `@Async @Transactional`.
- `Item.precioBase = consignacion.getValorBase()`.
- `Subasta.categoria = consignacion.getCategoriaPropuesta()` (fallar explícito si `null`, no default silencioso).
- `Subasta.fechaInicio = consignacion.getFechaSubastaPropuesta()`, `fechaFin = fechaInicio + 7 días`.
- Al final: `consignacion.setSubastaAsignada(subasta)`, `consignacion.setEstado(INCLUIDO_EN_SUBASTA)`, guardar.
- **Complejidad: Media.** Depende de 2.1, 2.2, 4.1, 0.4 #5.

### ✅ Resuelto — 4.3 — Frontend: `MyAuctionsScreen` con el nuevo `estadoMap`

| `EstadoConsignacion` | `moderationStatus` | `status` |
|---|---|---|
| `PENDIENTE_INSPECCION` | `pending` | `soon` |
| `RECHAZADO` | `rejected` | `canceled` |
| `PROPUESTA_ENVIADA` | `approved_pending_lot` | `soon` |
| `ACEPTADO_POR_USUARIO` | `approved_pending_lot` | `soon` |
| `RECHAZADO_POR_USUARIO` | `rejected` | `canceled` |
| `INCLUIDO_EN_SUBASTA` | `published` | `soon` |

- Agregar `rawEstado` al `ConsignmentItem`. El modal de aceptar/rechazar abre solo si `rawEstado === 'PROPUESTA_ENVIADA'`. Navegar al detalle de subasta cuando `rawEstado === 'INCLUIDO_EN_SUBASTA'` y existe `subastaId`.
- **Complejidad: Media.** Depende de 2.1, 4.1.

---

## 5. Flujo comprador — verificación (sin cambios funcionales esperados)

### ✅ Resuelto — 5.1 — Backend: confirmar que `SubastaService` ya aplica el control
- `listar()`, `obtener()`, `conectar()` ya usan `Categoria.puedeAcceder()`. Con `categoria` nullable, el invariante "categoría no nula para quien llega acá" lo garantiza `UserStatusFilter` (3.1). No agregar null-check adicional.
- **Verificado en Bloque G**: `Categoria.puedeAcceder()` aplica `this.ordinal() >= categoriaSubasta.ordinal()`. `UserStatusFilter` garantiza que solo usuarios `APROBADO` llegan a `SubastaService`, y los usuarios solo pasan a `APROBADO` cuando el admin asigna `categoria` en el mismo acto → sin riesgo de NPE. No se requirió ningún cambio de código.
- **Complejidad: Baja.** Depende de 0.4, 1.1, 3.1.

### [ ] 5.2 — Frontend: mensaje específico para 403 `CATEGORIA_INSUFICIENTE` (opcional)
- En `AuctionDetailScreen.tsx`, si `err?.response?.data?.codigo === 'CATEGORIA_INSUFICIENTE'`, mostrar "No tenés acceso a esta subasta por tu categoría."
- **Complejidad: Baja.**

---

## Orden de implementación

**Bloque A — Esquema de datos (termina con UNA recreación de la BD local):**
1. 0.1 — `RolUsuario` + `rol` en `Usuario` + `categoria` nullable
2. 2.1 — Redefinir `EstadoConsignacion` (6 valores)
3. 2.2 — Nuevos campos `fechaSubastaPropuesta`/`categoriaPropuesta` en `Consignacion`
4. 2.5 — Nuevos códigos de error

→ **Recrear la base de datos local** (drop schema `subastas`, reiniciar backend).

**Bloque B — Seguridad y permisos base:**
5. 0.2 — `ROLE_ADMIN`
6. 0.3 — `rol` en `UsuarioResponse`/`LoginResponse`
7. 3.1 — `UserStatusFilter` + registro en `SecurityConfig`

**Bloque C — Backend de negocio:**
8. 1.2 — `registroPaso2` ya no auto-aprueba
9. 1.4 — Mensaje de `login()` ajustado
10. 1.1 (resto) — `registroPaso1` sin categoría hardcodeada
11. 2.3 — `crear()` sin disparo de mock
12. 2.4 — eliminar `revisarYAceptar()`
13. 4.1 — `aceptarCondiciones`/`rechazarCondiciones` con nuevo gate
14. 4.2 — reescribir `asignarSubasta()`

**Bloque D — Admin API:**
15. 0.4 — `AdminController` + `AdminService` completos

**Bloque E — Seed (requiere OTRA recreación de BD):**
16. 1.6 — `DataLoader`: admin + usuario pendiente + consignaciones cubriendo varios de los 6 estados nuevos

**Bloque F — Frontend:**
17. 0.5 (parte frontend) — `User.role`, `updateUserRole`, `LoginScreen`, `profileStore`
18. 0.5 (sección Admin) — tipos, `AdminStack`, pantallas, `adminService`, endpoints
19. 4.3 — `MyAuctionsScreen` nuevo `estadoMap`/`rawEstado`
20. 1.5 — `PendingApprovalScreen` con polling real
21. 3.2 — `RootNavigator` con 3 ramas + ajustes en `RegisterStep3Screen`/`AuthNavigator`
22. 5.2 — mensaje específico para 403 `CATEGORIA_INSUFICIENTE` (opcional)

**Bloque G:**
23. 5.1 — verificación funcional end-to-end del flujo comprador con categorías asignadas por el admin

**Bloque H — Tests de integración:**
24. Adaptar tests al código actual: `ConsignacionControllerTest` idempotente (reset estado en `@BeforeEach`), nuevo `AdminControllerTest` (listados, aprobar/rechazar usuario), nuevos tests de `UserStatusFilter` en `SeguridadTest`, test de login pendiente en `AuthControllerTest`.

---

## Qué NO tocar

- WebSocket STOMP de pujas (handler, `PujaService`, `PujaRangeUtil`, `AliasUtil`, `WebSocketConfig`).
- Lógica de límites de puja (`Categoria.puedeAcceder()`, `Categoria.sinLimitesPuja()`).
- Multas (`MultaService`, `EstadoPago`, flujo de pago de multas).
- Compras y chat post-subasta (`CompraService`, `MensajeChatRepository`, `SubastaService.cerrarSubasta()`).
- Medios de pago (`MedioPagoService`/Controller, `paymentService` frontend).
- `EstadoItem` (`DISPONIBLE`, `EN_SUBASTA`, `VENDIDO`).
- Campos existentes de `ConsignacionResponse`/`UsuarioResponse`/`LoginResponse` consumidos por el frontend de usuario — solo se agregan campos opcionales nuevos.
- `JwtUtil`/`JwtAuthFilter` — sin cambios estructurales.
- El bypass `dev-bypass` en `registroPaso2`/`RegisterStep2Screen`.

---

## Verificación final

1. Backend compila y levanta tras cada bloque, revisando logs de Hibernate al recrear la BD (Bloques A y E).
2. Flujo Login/Registro: registro nuevo → `PENDIENTE_VERIFICACION`, `categoria=null`. Login → 403/mensaje pendiente salvo `/usuarios/perfil`. Admin lista/aprueba con categoría. `PendingApprovalScreen` pasa a `Main` solo.
3. Flujo Vendedor: consignación → `PENDIENTE_INSPECCION` sin auto-aceptar. Admin propone condiciones → `PROPUESTA_ENVIADA`. Usuario ve propuesta real y acepta/rechaza. Aceptar → `ACEPTADO_POR_USUARIO` → `INCLUIDO_EN_SUBASTA` con Item/Subasta reales. Rechazar → `RECHAZADO_POR_USUARIO`. Rechazo directo → `RECHAZADO`.
4. Flujo Comprador: usuario `APROBADO` en categoría intermedia ve solo subastas accesibles; subasta de categoría superior → 403 `CATEGORIA_INSUFICIENTE` con mensaje en frontend.
5. Regresión rápida: pujas WebSocket, pago de multas, historial de compras/chat siguen funcionando.
