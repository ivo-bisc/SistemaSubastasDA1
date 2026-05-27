# Guía de prueba WebSocket — Sistema de Subastas

## Prerequisito

Tener el backend corriendo en `http://localhost:8080`.

---

## PASO 1 — Obtener JWT para cada usuario

Usá Swagger (`http://localhost:8080/swagger-ui/index.html`) o Hoppscotch REST.

**Juan (Postor 1):**
```json
POST http://localhost:8080/api/v1/auth/login

{
  "email": "juan@test.com",
  "password": "password123"
}
```

**María (Postor 2):**
```json
POST http://localhost:8080/api/v1/auth/login

{
  "email": "maria@test.com",
  "password": "password123"
}
```

Guardar el valor de `tokenAcceso` de cada respuesta.

---

## PASO 2 — Conectar a la subasta (REST, obligatorio antes de pujar)

Antes de conectarse al WebSocket, cada usuario debe registrar su participación vía REST.
Esto valida categoría, medio de pago y que no estén conectados a otra subasta.

**Juan:**
```json
POST http://localhost:8080/api/v1/subastas/1/conectar
Authorization: Bearer <tokenAcceso_de_juan>

{
  "medioPagoId": 1
}
```

**María:**
```json
POST http://localhost:8080/api/v1/subastas/1/conectar
Authorization: Bearer <tokenAcceso_de_maria>

{
  "medioPagoId": 2
}
```

---

## PASO 3 — Abrir 2 tabs de WebSocket en Hoppscotch

Ir a **Realtime → WebSocket** y abrir dos tabs del browser.

- **Tab 1:** Juan (va a pujar)
- **Tab 2:** María (va a observar y también pujar)

URL en ambos tabs:
```
ws://localhost:8080/ws/websocket
```

---

## PASO 4 — Conectar con STOMP

Enviar el frame CONNECT con el JWT correspondiente en cada tab.

**Tab 1 — Juan:**
```
CONNECT
Authorization:Bearer <tokenAcceso_de_juan>
accept-version:1.2
heart-beat:0,0

\0
```

**Tab 2 — María:**
```
CONNECT
Authorization:Bearer <tokenAcceso_de_maria>
accept-version:1.2
heart-beat:0,0

\0
```

Deberías recibir `CONNECTED` en ambos tabs.

---

## PASO 5 — Suscribirse a los topics

Hacer esto en **ambos tabs**.

**Topic público de la Subasta 1:**
```
SUBSCRIBE
id:sub-0
destination:/topic/subastas/1

\0
```

**Cola privada personal:**
```
SUBSCRIBE
id:sub-1
destination:/user/queue/pujas

\0
```

---

## PASO 6 — Juan envía una puja

Desde **Tab 1 (Juan)**:

```
SEND
destination:/app/subastas/1/pujar
content-type:application/json

{"itemId":1,"monto":55000.00,"medioPagoId":1}
\0
```

> El Item 1 tiene precio base de **50.000 ARS**, así que 55.000 es una puja válida.  
> Rango válido: mín = 50.500, máx = 60.000 (mejor oferta + 1% / 20% del precio base).  
> El MedioPago 1 es la cuenta bancaria ARS de Juan.

**Resultado esperado:**

| Tab | Canal | Mensaje |
|-----|-------|---------|
| Tab 1 (Juan) | `/user/queue/pujas` | `BID_CONFIRMED` con monto 55000 |
| Tab 2 (María) | `/topic/subastas/1` | `BID_UPDATED` con nuevaMejorOferta: 55000 |

---

## PASO 7 — María supera la oferta

Desde **Tab 2 (María)**:

```
SEND
destination:/app/subastas/1/pujar
content-type:application/json

{"itemId":1,"monto":60000.00,"medioPagoId":2}
\0
```

> Después de la puja de Juan (55.000), el nuevo rango es: mín = 55.500, máx = 65.000.  
> 60.000 está dentro del rango. ✅  
> El MedioPago 2 es la cuenta bancaria ARS de María.

**Resultado esperado:**

| Tab | Canal | Mensaje |
|-----|-------|---------|
| Tab 2 (María) | `/user/queue/pujas` | `BID_CONFIRMED` con monto 60000 |
| Tab 1 (Juan) | `/topic/subastas/1` | `BID_UPDATED` con nuevaMejorOferta: 60000 |

---

## PASO 8 — Probar un rechazo

Desde **Tab 1 (Juan)**, pujar menos que el mínimo (después de 60.000, el mín es 60.500):

```
SEND
destination:/app/subastas/1/pujar
content-type:application/json

{"itemId":1,"monto":50000.00,"medioPagoId":1}
\0
```

**Resultado esperado:**

| Tab | Canal | Mensaje |
|-----|-------|---------|
| Tab 1 (Juan) | `/user/queue/pujas` | `BID_REJECTED` con motivo del rechazo |

---

## Flujo completo

```
Tab 1 (Juan)                    Servidor                    Tab 2 (María)
    |                               |                              |
    |--- puja 55000 /app/... ------>|                              |
    |<-- BID_CONFIRMED /user/... ---|                              |
    |                               |--- BID_UPDATED /topic/... -->|
    |                               |                              |
    |                               |<-- puja 60000 /app/... ------|
    |<-- BID_UPDATED /topic/... ----|                              |
    |                               |--- BID_CONFIRMED /user/... ->|
    |                               |                              |
    |--- puja 50000 /app/... ------>|                              |
    |<-- BID_REJECTED /user/... ----|                              |
```

---

## Datos de referencia

| Recurso | ID | Detalle |
|--------|----|---------|
| Subasta activa | 1 | "Subasta de Arte Argentino - Lote 01" — Estado: ABIERTA, Moneda: ARS |
| Item | 1 | "Óleo sobre tela - Paisaje pampeano" — Precio base: 50.000 ARS — Estado: EN_SUBASTA |
| Item | 2 | "Escultura de bronce - Figura abstracta" — Precio base: 80.000 ARS — Estado: EN_SUBASTA |
| MedioPago Juan | 1 | Cuenta Bancaria — Banco Nación, ARS |
| MedioPago María | 2 | Cuenta Corriente — Banco Galicia, ARS |
| MedioPago María | 3 | Tarjeta Visa Internacional, USD (para subastas en USD) |

---

## Tips

- Si algo falla, revisar la consola del backend para ver los logs.
- Ver los datos en la H2 console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:subastasdb`
  - Usuario: `sa` — Contraseña: *(vacía)*
- La base de datos es **in-memory**, se reinicia con cada restart del servidor y los IDs vuelven desde 1.
- **Recordá hacer el PASO 2 (REST conectar) antes de cualquier puja** — sin eso el WebSocket rechaza la puja con `USUARIO_NO_CONECTADO`.
