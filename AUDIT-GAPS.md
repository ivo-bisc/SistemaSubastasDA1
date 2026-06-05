# AUDIT-GAPS — Items ⚠️ sin acción de resolución en el Plan de Integración
**Fuente:** AUDIT-V2.md + AUDIT-V3.md cruzados contra PLAN-INTEGRACION.md  
**Fecha:** 2026-06-05  
**Criterio:** solo items marcados ⚠️ que no tienen paso en el plan ni aparecen en "Lo que se puede dejar para después"

---

## Ordenados de mayor a menor impacto visible para el usuario

---

### 1. Flujo de consignación incompleto — 4 endpoints bloqueados
**Impacto: ALTO — funcionalidad entera inaccesible**
**Estado: PENDIENTE — requiere pantallas nuevas**

Los 4 endpoints del ciclo post-consignación existen en el backend y tienen métodos en `consignService.ts`, pero todos tienen `TODO` y ninguna pantalla los llama:

| Endpoint | Método en servicio |
|---|---|
| `POST /consignaciones/{id}/aceptar-condiciones` | `acceptConditions()` |
| `POST /consignaciones/{id}/rechazar-condiciones` | `rejectConditions()` |
| `GET /consignaciones/{id}/ubicacion` | `getItemLocation()` |
| `GET /consignaciones/{id}/poliza` | `getInsurancePolicy()` |

**Archivo afectado:** `front-end/src/services/consignService.ts`

Un usuario que sube un ítem para consignar nunca puede aceptar o rechazar las condiciones que le envíe la empresa, ni ver dónde dejar el objeto, ni ver la póliza de seguro.

**Requiere decisión de negocio** — hay que crear las pantallas faltantes para cada flujo.

---

### 2. Usuario bloqueado no se detecta post-login
**Impacto: ALTO — estado de cuenta invisible**
**Estado: RESUELTO (2026-06-05)**
- `authStore`: nuevo método `updateUserStatus()`
- `profileStore`: `loadProfile()` traduce y propaga status al authStore
- `ProfileScreen`: banner rojo visible cuando `user.status === 'rejected'`

El campo `status` del response de `GET /usuarios/perfil` no se mapea en `profileStore`.

**Archivo afectado:** `front-end/src/stores/profileStore.ts`

Si el backend cambia el estado del usuario a `BLOQUEADO` después del login (por mora, multa, etc.), el frontend no lo refleja. El usuario sigue viendo la app con normalidad hasta que algún endpoint empiece a responder 403.

**Solución simple (1 archivo):** leer `status` en `loadProfile()` y mostrar aviso o redirigir si el estado es `BLOQUEADO`.

---

### 3. No hay forma de eliminar una tarjeta desde la app
**Impacto: MEDIO-ALTO — funcionalidad de perfil incompleta**
**Estado: RESUELTO (2026-06-05)**
- `profileStore`: nuevo método `removeCard()` con optimistic delete
- `PaymentMethodsScreen`: botón trash con Alert de confirmación, flujo DELETE backend → `loadProfile()` en éxito, revertir en error

`paymentService.deletePaymentMethod()` está implementado y el backend tiene `DELETE /usuarios/medios-pago/{id}`, pero ninguna pantalla llama a ese método.

**Archivo afectado:** falta botón de eliminación en la pantalla de medios de pago (probablemente `PaymentMethodsScreen` o `ProfileScreen`).

El usuario puede agregar tarjetas pero nunca borrarlas desde la app.

**Solución simple (1-2 archivos):** agregar botón de eliminación que llame al servicio ya implementado.

---

### 4. Campo `vencimiento` se guarda en formato incorrecto
**Impacto: MEDIO — dato corrupto silencioso**
**Estado: RESUELTO (2026-06-05)**
- `cardForm.ts`: `buildCardMedioPagoRequest()` convierte `MM/YYYY` → `MM/YY` antes de enviar. Afecta `RegisterStep3Screen` y `AddCardScreen`.

El frontend envía `vencimiento` en formato `MM/YYYY` (ej: `"06/2029"`), pero la entidad backend documenta `MM/YY` (ej: `"06/29"`). No hay validación en ninguno de los dos lados — el dato se guarda tal como llega, sin error visible.

**Archivos afectados:**
- `front-end/src/screens/auth/RegisterStep3Screen.tsx`
- `front-end/src/screens/profile/AddCardScreen.tsx`

**Solución simple (1-2 archivos):** convertir el formato antes de enviarlo, o confirmar con el backend qué formato realmente persiste y alinear la validación.

---

### 5. `ChatDetailScreen` — error en carga inicial puede ser silencioso
**Estado: CERRADO — falso positivo (2026-06-05)**

`loadError` está conectado a un early return visible en pantalla. No hay bug.

---

### 6. `HomeScreen` — catch genérico sin diferenciación de errores
**Impacto: MEDIO — mala UX en errores de red**
**Estado: PENDIENTE — mejora de UX, no crítico**

El `catch` de `getAuctions()` usa un mensaje genérico que no diferencia timeout, 401 ni 500.

**Archivo afectado:** `front-end/src/screens/home/HomeScreen.tsx`

Un 401 debería disparar logout (ya manejado globalmente por `apiClient`); un timeout debería mostrar "Reintentá más tarde"; un 500 debería decir "Error del servidor".

**Solución simple (1 archivo):** distinguir al menos el caso de red caída del resto y dar un mensaje de reintento apropiado.

---

### 7. Race condition en conexión WebSocket — sin mitigación completa
**Impacto: BAJO — falla rara, parcialmente mitigada**
**Estado: PENDIENTE — parcialmente mitigado, baja probabilidad**

Si el componente se desmonta durante la conexión inicial (antes de que `onConnect` se ejecute), el cliente STOMP puede completar la conexión asíncronamente e intentar suscribirse. El guard `client?.connected` en `subscribe()` lo previene en la mayoría de los casos, pero el cliente puede quedar en estado inconsistente si el timing es exacto.

**Archivos afectados:** `front-end/src/hooks/useAuctionSocket.ts` / `front-end/src/services/stompService.ts`

**Requiere decisión técnica** — implementar un flag `isMounted` en el hook o una bandera de cancelación en el servicio STOMP.

---

## Items explícitamente diferidos en el Plan (tienen decisión, no son omisiones)

| ⚠️ | Archivo | Motivo del diferimiento |
|---|---|---|
| `authStore.logout()` no invalida token en backend | `front-end/src/stores/authStore.ts` | Token expira en 24h, riesgo bajo en contexto académico |
| `null` en `ALLOWED_ORIGINS` | `backend/src/main/resources/application.properties` | Solo importa antes de producción real |
| `spring.jpa.show-sql=true` y `level=DEBUG` | `backend/src/main/resources/application.properties` | Crear `application-prod.properties` si se despliega |
| Swagger UI sin autenticación | `SecurityConfig.java` | Aceptable en desarrollo |
| `PATCH /compras/{id}/entrega` sin pantalla | `front-end/src/constants/endpoints.ts` | Espera implementación de la pantalla de entrega |

---

## Item pendiente con acción en el Plan (no resuelto aún)

| ⚠️ | Paso | Estado |
|---|---|---|
| Credenciales hardcodeadas en `application.properties` (`DB_PASSWORD`, `JWT_SECRET`) | Paso 8 | ✅ Resuelto (2026-06-05) |
