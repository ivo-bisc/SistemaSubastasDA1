# Sistema de Subastas DA1

Monorepo con backend Spring Boot y frontend React Native (Expo).

```
SistemaSubastasDA1/
├── backend/      → API REST + WebSocket (Java 17, Spring Boot 3.3.4)
└── front-end/    → App móvil (React Native 0.81, Expo SDK 54, TypeScript)
```

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Java        | 17             |
| Maven       | 3.9+ (o usar `./mvnw`) |
| MySQL       | 8.0+           |
| Node.js     | 18+            |
| npm         | 9+             |
| Expo CLI    | `npx expo` (sin instalación global) |

---

## Backend

### 1. Configurar variables de entorno

Copiá el archivo de ejemplo y completá los valores:

```bash
cp backend/src/main/resources/application.properties.example \
   backend/src/main/resources/application.properties
```

Editá `application.properties` con tus credenciales de MySQL. Las variables que podés sobreescribir con variables de entorno del sistema operativo son:

| Variable de entorno | Descripción | Ejemplo |
|---------------------|-------------|---------|
| `DB_URL`            | URL de conexión JDBC | `jdbc:mysql://localhost:3306/subastas?useSSL=false&serverTimezone=America/Argentina/Buenos_Aires&allowPublicKeyRetrieval=true` |
| `DB_USERNAME`       | Usuario MySQL | `root` |
| `DB_PASSWORD`       | Contraseña MySQL | `mi_password` |
| `JWT_SECRET`        | Clave secreta para firmar JWT (mín. 32 chars en producción) | `clave-aleatoria-larga` |
| `ALLOWED_ORIGINS`   | Orígenes CORS permitidos, separados por coma | ver abajo |
| `UPLOADS_PATH`      | Directorio para archivos subidos | `uploads` |

**Orígenes CORS por defecto (desarrollo):**
```
http://localhost:3000, http://localhost:4200, http://localhost:8081, http://10.0.2.2:8081, null
```
`null` permite requests sin header `Origin` (apps móviles nativas).

### 2. Crear la base de datos

```sql
CREATE DATABASE subastas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Levantar el backend

```bash
cd backend
./mvnw spring-boot:run
```

El servidor arranca en `http://localhost:8080`.  
Swagger UI disponible en `http://localhost:8080/swagger-ui.html`.

---

## Frontend

### 1. Instalar dependencias

```bash
cd front-end
npm install
```

### 2. Configurar variables de entorno

```bash
cp front-end/.env.example front-end/.env
```

Editá `.env` según la plataforma donde vas a correr el frontend:

| Variable | Descripción | Valor según plataforma |
|----------|-------------|------------------------|
| `EXPO_PUBLIC_API_URL` | URL del backend | ver tabla abajo |
| `EXPO_PUBLIC_USE_MOCKS` | Usar datos de prueba en vez de API real | `true` / `false` |

**URL del backend según plataforma:**

| Plataforma | URL |
|------------|-----|
| Emulador Android | `http://10.0.2.2:8080` |
| Simulador iOS / Expo Web | `http://localhost:8080` |
| Dispositivo físico | `http://<IP-de-tu-máquina>:8080` (ej: `http://192.168.1.50:8080`) |

Para encontrar la IP de tu máquina: `ipconfig` (Windows) o `ifconfig` / `ip a` (Linux/Mac).

### 3. Levantar el frontend

```bash
cd front-end
npx expo start
```

Escaneá el QR con Expo Go o presioná `a` (Android) / `i` (iOS) para abrir el emulador.

---

## Variables de entorno — resumen completo

### Backend

| Variable | Requerida | Default (dev) | Descripción |
|----------|-----------|---------------|-------------|
| `DB_URL` | No | URL MySQL local | URL JDBC de conexión |
| `DB_USERNAME` | No | `root` | Usuario de la base de datos |
| `DB_PASSWORD` | **Sí** | _(vacío)_ | Contraseña de la base de datos |
| `JWT_SECRET` | No | clave de dev | Clave para firmar tokens JWT |
| `ALLOWED_ORIGINS` | No | orígenes dev | Orígenes CORS permitidos |
| `UPLOADS_PATH` | No | `uploads` | Directorio de archivos subidos |

### Frontend

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | No | `http://10.0.2.2:8080` | URL base del backend |
| `EXPO_PUBLIC_USE_MOCKS` | No | — | `true` = datos de prueba, `false` = API real |
