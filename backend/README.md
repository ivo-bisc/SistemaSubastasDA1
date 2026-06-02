# Backend — BidUp API

API REST del sistema de subastas. Contrato en [`../subastas-api.yaml`](../subastas-api.yaml).

**Desarrollo de Aplicaciones I - 1C Lunes 2026**  
**Grupo 5:** Nicolas Hernández · Ivo Guido Biscardi · Nicolás Zhang · Puleio Santiago · Tobías Hernández

---

## Stack

- **Framework:** Spring Boot 3.3.4 (Java 17)
- **Seguridad:** Spring Security + JWT
- **WebSocket:** STOMP sobre SockJS
- **Base de datos:** H2 (dev) / MySQL (producción)
- **Build:** Maven

## Requisitos

- Java 17+
- Maven 3.6+

## Correr en desarrollo

```bash
mvn spring-boot:run
```

La API levanta en **http://localhost:8080**.  
Swagger UI: **http://localhost:8080/swagger-ui/index.html**

## Compilar JAR

```bash
mvn clean package
java -jar target/subastas-api-0.0.1-SNAPSHOT.jar
```

## Tests

```bash
mvn test
```

## Estructura

| Carpeta | Descripción |
|---|---|
| `src/main/java/com/subastas/controller/` | Controladores REST |
| `src/main/java/com/subastas/service/` | Lógica de negocio |
| `src/main/java/com/subastas/model/` | Entidades, DTOs y enums |
| `src/main/java/com/subastas/repository/` | Repositorios JPA |
| `src/main/java/com/subastas/security/` | Filtro JWT y configuración de seguridad |
| `src/main/java/com/subastas/config/` | Configuración de WebSocket, OpenAPI y datos iniciales |
