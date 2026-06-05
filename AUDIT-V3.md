# AUDIT-V3 — Auditoría de Cierre — Sistema de Subastas DA1
**Fecha:** 2026-06-04  
**Base:** AUDIT-V2.md + PLAN-INTEGRACION.md (completado al 91%)  
**Alcance:** solo hallazgos nuevos o no resueltos — no repetir lo que AUDIT-V2 ya marca como ✅

---

## HALLAZGO 1 — ✅ RESUELTO: imports rotos por eliminación de `types/catalog.ts`

**Severidad:** ~~🔴 Error de compilación TypeScript~~ ✅ Resuelto

El Paso 11a eliminó `front-end/src/types/catalog.ts` pero 5 archivos seguían importando desde él.
`types/catalog.ts` fue restaurado con las dos interfaces (`CatalogCardItem`, `CatalogCategory`).

| Archivo | Línea | Import roto |
|---|---|---|
| `services/auctionService.ts` | 4 | `CatalogCardItem, CatalogCategory` — usados en `mapCatalogItem()` y `getLotDetail()` |
| `screens/home/LotDetailScreen.tsx` | 13 | `CatalogCategory` — usado como tipo del estado local |
| `components/home/CategorySection.tsx` | 5 | `CatalogCategory` — usado como prop type |
| `components/home/AuctionItemCard.tsx` | 12 | `CatalogCardItem` — usado como prop type |
| `data/mockHomeCatalog.ts` | 1 | `CatalogCategory` — archivo huérfano (ver Hallazgo 4) |

**Fix:** restaurar `types/catalog.ts` con solo las dos interfaces — los archivos que las usan son
funcionales y no tienen sustituto disponible.

```ts
// front-end/src/types/catalog.ts
export type CatalogCardItem = {
  id: string;
  title: string;
  price: string;
  timeRemaining: string;
  imageUrl: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  description: string;
  endDate?: string;
  items: CatalogCardItem[];
};
```

---

## HALLAZGO 2 — PENDIENTE: Paso 8 no aplicado

**Severidad:** 🔴 Credenciales en código fuente

`backend/src/main/resources/application.properties` sigue con defaults hardcodeados:

```properties
spring.datasource.password=${DB_PASSWORD:8Z|TmuL6k17V}   ← contraseña real
jwt.secret=${JWT_SECRET:mi-clave-secreta-de-desarrollo-local-12345}  ← secret débil
```

Además:
- `application-local.properties` **no existe**
- `application.properties` **no está en `.gitignore`**

**Fix (Paso 8):**
1. Eliminar los valores default `:valor` → dejar solo `${DB_PASSWORD}` y `${JWT_SECRET}`
2. Crear `application-local.properties` con los valores de dev (no commitear)
3. Agregar `application-local.properties` al `.gitignore` del backend

---

## HALLAZGO 3 — ✅ RESUELTO: TODOs obsoletos en servicios implementados

Eliminados los 5 comentarios `// TODO: implementar` de `authService.ts`, `userService.ts` y `auctionService.ts`.

---

## HALLAZGO 4 — ✅ RESUELTO: datos mock sin uso en archivos de datos

Eliminados `MOCK_BIDS`, `MOCK_AUCTIONS` de `mockActivity.ts`; `MOCK_USER`, `MOCK_CARDS`, `MOCK_CHECKS` de `mockProfile.ts`; `mockHomeCatalog.ts` eliminado completo. Tipos conservados en ambos archivos.

---

## HALLAZGO 5 — CONTRATOS DE ENDPOINTS: sin nuevos mismatches

Verificados los 3 endpoints más propensos a discrepancias:

| Endpoint | Resultado |
|---|---|
| `POST /consignaciones` | ✅ Contrato OK — campos FormData coinciden con `@RequestParam` del backend |
| `GET /consignaciones` | ✅ Contrato OK — todos los campos que lee el frontend existen en `ConsignacionResponse` |
| `GET /usuarios/mis-pujas` | ✅ Contrato OK — `MiPujaResponse` tiene todos los campos que usa `MyBidsScreen` |

---

## RESUMEN DE ACCIÓN

| # | Hallazgo | Severidad | Fix |
|---|---|---|---|
| 1 | Imports rotos por `types/catalog.ts` eliminado | ✅ Resuelto | `types/catalog.ts` restaurado |
| 2 | Paso 8 sin aplicar — credenciales hardcodeadas | 🔴 Pendiente | Ver Paso 8 del plan |
| 3 | TODOs obsoletos en servicios implementados | ✅ Resuelto | 5 comentarios eliminados |
| 4 | Datos mock sin uso + archivo huérfano | ✅ Resuelto | Datos y archivo eliminados |
| 5 | Contratos de endpoints | ✅ Sin acción | — |
