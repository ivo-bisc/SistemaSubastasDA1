 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Plan: Integración Monorepo Backend + Frontend

 Context

 El monorepo tiene backend Spring Boot (Java 17, Spring Boot 3.3.4) y frontend React Native/Expo (SDK 54, React Native 0.81.5, TypeScript). Actualmente el frontend usa mock
 data y tiene la URL del backend hardcodeada. El objetivo es configurar las variables de entorno, CORS, y la infraestructura necesaria para que ambos servicios puedan correr y
 conectarse sin tocar lógica de negocio.

 ---
 FASE 1 — AUDITORÍA (resultados)

 1. URLs y Puertos

 ┌───────────────────────────────────────────────────┬───────┬──────────────────────────────────────┐
 │                      Archivo                      │ Línea │          Valor hardcodeado           │
 ├───────────────────────────────────────────────────┼───────┼──────────────────────────────────────┤
 │ front-end/src/services/apiClient.ts               │ 7     │ https://api.bidup.com                │
 ├───────────────────────────────────────────────────┼───────┼──────────────────────────────────────┤
 │ backend/src/main/resources/application.properties │ 3     │ server.port=8080                     │
 ├───────────────────────────────────────────────────┼───────┼──────────────────────────────────────┤
 │ backend/src/main/resources/application.properties │ 6     │ jdbc:mysql://localhost:3306/subastas │
 └───────────────────────────────────────────────────┴───────┴──────────────────────────────────────┘

 No hay referencias a localhost:8081, 10.0.2.2, ni otras IPs en el frontend.

 2. CORS

 SÍ hay Spring Security. Configurado correctamente dentro de SecurityFilterChain (patrón moderno, no WebSecurityConfigurerAdapter).

 - Clase: backend/src/main/java/com/subastas/config/SecurityConfig.java:91-100
 - Lee de ${cors.allowed-origins} en application.properties
 - Aplica a /** y usa allowCredentials=true
 - La misma variable se usa en WebSocketConfig.java:26-27
 - Valor actual: http://localhost:3000,http://localhost:4200,null
 - Faltan: http://localhost:8081 y http://10.0.2.2:8081 (Expo dev server)
 - No hay @CrossOrigin en ningún controller ni WebMvcConfigurer separado.

 3. Variables de Entorno

 Backend — hardcodeadas (riesgo):
 spring.datasource.url=jdbc:mysql://localhost:3306/subastas...   # hardcoded
 spring.datasource.username=root                                  # hardcoded
 spring.datasource.password=8Z|TmuL6k17V                        # CREDENCIAL EN CLARO
 cors.allowed-origins=http://localhost:3000,http://localhost:4200,null  # hardcoded

 Backend — ya usan variables de entorno:
 jwt.secret=${JWT_SECRET:mi-clave-secreta-de-desarrollo-local-12345}
 app.uploads.base-path=${UPLOADS_PATH:uploads}

 Frontend:
 - No existe .env ni .env.example
 - No hay referencias a process.env ni Constants.expoConfig
 - URL del backend hardcodeada directamente en el código fuente

 4. Mocks

 ┌──────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────┐
 │                     Archivo                      │                           Variables/Funciones                           │
 ├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
 │ front-end/src/data/mockActivity.ts               │ MOCK_BIDS, MOCK_AUCTIONS                                                │
 ├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
 │ front-end/src/data/mockAuctionDetail.ts          │ MOCK_AUCTION_DETAIL                                                     │
 ├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
 │ front-end/src/data/mockHomeCatalog.ts            │ MOCK_HOME_CATEGORIES, getLotById()                                      │
 ├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
 │ front-end/src/data/mockProfile.ts                │ MOCK_USER, MOCK_ADDRESSES, MOCK_CARDS, MOCK_CHECKS, formatAddressLine() │
 ├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
 │ front-end/src/screens/chat/ChatListScreen.tsx:13 │ MOCK_CHATS (inline, no en carpeta data/)                                │
 └──────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘

 Los stores profileStore y myAuctionsStore son locales y no sincronizan con el backend (fuera de scope de este task).

 5. Campos JSON — DISCREPANCIAS (requieren atención futura)

 El frontend NO consume el backend todavía (usa mocks). Cuando se integre, los nombres no van a coincidir:

 ┌─────────────────────────────┬─────────────────────────────────┬────────────┐
 │ Backend (JSON serializado)  │ Frontend (TypeScript interface) │  Impacto   │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ titulo                      │ title                           │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ descripcion                 │ description                     │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ fechaInicio                 │ startDate                       │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ fechaFin                    │ endDate                         │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ precioBase (ItemResponse)   │ startingPrice                   │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ mejorOferta (ItemResponse)  │ currentPrice                    │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ nombre (UsuarioResponse)    │ firstName                       │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ apellido (UsuarioResponse)  │ lastName                        │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ tokenAcceso (LoginResponse) │ token                           │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ timestamp (PujaResponse)    │ createdAt                       │ ❌ Ruptura │
 ├─────────────────────────────┼─────────────────────────────────┼────────────┤
 │ email, id                   │ email, id                       │ ✅ OK      │
 └─────────────────────────────┴─────────────────────────────────┴────────────┘

 ▎ Nota: Este task no incluye fix de campos JSON. Es un bloqueante para la integración real pero queda fuera del scope de Fase 2 según las instrucciones. Se documenta aquí
 ▎ para abordarlo después.

 ---
 FASE 2 — Cambios a realizar

 Orden de ejecución (un archivo a la vez, esperando confirmación):

 BACKEND — 2 archivos

 B1. backend/src/main/resources/application.properties

 Cambios:
 1. Mover DB credentials a variables de entorno con fallback para dev local
 2. Cambiar cors.allowed-origins para leer de ALLOWED_ORIGINS y agregar orígenes de Expo en el default

 # Antes:
 spring.datasource.url=jdbc:mysql://localhost:3306/subastas?...
 spring.datasource.username=root
 spring.datasource.password=8Z|TmuL6k17V
 cors.allowed-origins=http://localhost:3000,http://localhost:4200,null

 # Después:
 spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/subastas?useSSL=false&serverTimezone=America/Argentina/Buenos_Aires&allowPublicKeyRetrieval=true}
 spring.datasource.username=${DB_USERNAME:root}
 spring.datasource.password=${DB_PASSWORD:}
 cors.allowed-origins=${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:4200,http://localhost:8081,http://10.0.2.2:8081,null}

 No se toca nada más (no cambia SecurityConfig.java porque la lectura de ${cors.allowed-origins} ya está correcta).

 B2. backend/src/main/resources/application.properties.example (nuevo)

 Archivo documentado con todas las variables. No tiene valores reales — solo descripciones y ejemplos seguros.

 ---
 FRONTEND — 4 archivos

 F1. front-end/src/services/apiClient.ts

 Cambio en línea 7:
 // Antes:
 const BASE_URL = 'https://api.bidup.com'; // TODO: configurar con la URL real

 // Después:
 const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

 F2. front-end/.env (nuevo)

 EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
 EXPO_PUBLIC_USE_MOCKS=true

 F3. front-end/.env.example (nuevo)

 Archivo documentado. Sin valores sensibles.

 F4. Wrapping de mocks

 Agregar const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true' en cada archivo que consume mock data, y envolver el uso con esa constante.

 Archivos afectados:
 - front-end/src/data/mockActivity.ts — agregar la constante y re-exportar condicionalmente
 - front-end/src/data/mockAuctionDetail.ts — ídem
 - front-end/src/data/mockHomeCatalog.ts — ídem
 - front-end/src/data/mockProfile.ts — ídem
 - front-end/src/screens/chat/ChatListScreen.tsx — envolver el MOCK_CHATS inline

 Estrategia concreta para cada mock file:
 // Al final de cada archivo de mock (ej: mockActivity.ts):
 export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

 En cada screen que importa el mock:
 // Antes:
 const auction = MOCK_AUCTION_DETAIL;

 // Después:
 const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
 const auction = USE_MOCKS ? MOCK_AUCTION_DETAIL : null; // null = no wired to API yet

 ▎ Con EXPO_PUBLIC_USE_MOCKS=true (valor en .env), el comportamiento es idéntico al actual. El cambio es solo estructural.

 ---
 COMPARTIDO — 1 archivo

 C1. README.md (nuevo, en la raíz del monorepo)

 Contenido:
 - Requisitos (Java 17, Node, MySQL)
 - Cómo levantar el backend (con variables de entorno)
 - Cómo levantar el frontend (con Expo)
 - Tabla de todas las variables de entorno requeridas (backend + frontend)
 - URLs de desarrollo según plataforma (emulador Android, iOS, dispositivo físico)

 ---
 Archivos críticos identificados

 ┌───────────────────────────────────────────────────────────┬──────────────────────────┐
 │                          Archivo                          │          Acción          │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ backend/src/main/resources/application.properties         │ Modificar                │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ backend/src/main/resources/application.properties.example │ Crear                    │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ front-end/src/services/apiClient.ts                       │ Modificar línea 7        │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ front-end/.env                                            │ Crear                    │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ front-end/.env.example                                    │ Crear                    │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ front-end/src/data/mockActivity.ts                        │ Agregar export USE_MOCKS │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ front-end/src/data/mockAuctionDetail.ts                   │ Agregar export USE_MOCKS │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ front-end/src/data/mockHomeCatalog.ts                     │ Agregar export USE_MOCKS │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ front-end/src/data/mockProfile.ts                         │ Agregar export USE_MOCKS │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ front-end/src/screens/chat/ChatListScreen.tsx             │ Envolver MOCK_CHATS      │
 ├───────────────────────────────────────────────────────────┼──────────────────────────┤
 │ README.md                                                 │ Crear                    │
 └───────────────────────────────────────────────────────────┴──────────────────────────┘

 No se toca: SecurityConfig.java (CORS ya está bien estructurado), ningún endpoint, ninguna entidad, ningún store.

 ---
 Verificación

 1. Backend arranca: ./mvnw spring-boot:run con DB_PASSWORD=<valor> en el entorno → debe conectarse a MySQL sin error
 2. Frontend arranca: npx expo start en front-end/ → debe compilar sin warnings sobre variables no definidas
 3. CORS funciona: desde un browser en http://localhost:8081, hacer un fetch a http://localhost:8080/api/v1/auth/login → debe llegar (no CORS error)
 4. Mocks aún funcionan: con EXPO_PUBLIC_USE_MOCKS=true, el app muestra los datos de prueba igual que antes
 5. Sin mocks: cambiar .env a EXPO_PUBLIC_USE_MOCKS=false → el app no muestra mock data (screens muestran null/vacío, no crash)