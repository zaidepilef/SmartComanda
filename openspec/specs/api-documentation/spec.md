# api-documentation Specification

## Purpose

Documenta la API pública de SmartComanda mediante una especificación OpenAPI accesible desde un navegador, permitiendo a desarrolladores y consumidores externos explorar y probar los endpoints.

## Requirements

### Requirement: Servir especificación OpenAPI de la API
El sistema SHALL exponer una especificación OpenAPI 3.0 de la API pública, accesible en una ruta dedicada, y documentar todos los endpoints existentes (auth, users, tenants, branches y health).

#### Scenario: Acceso a la especificación JSON
- **WHEN** un cliente solicita la especificación en formato JSON
- **THEN** el sistema responde con la especificación OpenAPI que incluye todos los endpoints públicos documentados

#### Scenario: Acceso a la interfaz de documentación
- **WHEN** un usuario navega a la ruta de documentación desde un navegador
- **THEN** el sistema presenta una interfaz interactiva (Swagger UI) que permite explorar los endpoints y sus esquemas

#### Scenario: Endpoint sin documentación
- **WHEN** un endpoint existente no está documentado en la especificación
- **THEN** el sistema no lo incluye en la especificación servida

### Requirement: Documentar contratos de datos
La especificación SHALL incluir los esquemas de datos principales de la API: usuario, tenant, sucursal (branch), respuestas de error estándar y el flujo de autenticación.

#### Scenario: Esquema de autenticación documentado
- **WHEN** se consulta la especificación
- **THEN** esta describe el endpoint de login, los parámetros requeridos (email, password) y las respuestas de éxito y error

#### Scenario: Esquema de error estándar
- **WHEN** un endpoint documentado indica respuestas de error
- **THEN** la especificación define un esquema de error consistente con los códigos HTTP utilizados por la API

### Requirement: Documentar seguridad de la API
La especificación SHALL declarar el esquema de seguridad de la API (autenticación mediante Bearer token) y marcar los endpoints que lo requieren.

#### Scenario: Endpoints protegidos marcados
- **WHEN** se consulta la especificación
- **THEN** los endpoints que requieren autenticación indican el requisito de Bearer token

#### Scenario: Endpoints públicos sin seguridad
- **WHEN** se consulta la especificación
- **THEN** los endpoints públicos (health, login, registro) no indican requisito de autenticación

### Requirement: Proteger la documentación en producción
El sistema SHALL restringir el acceso a la interfaz de documentación en entornos de producción, de forma que no se exponga información sensible.

#### Scenario: Documentación deshabilitada en producción
- **WHEN** el entorno es de producción
- **THEN** el sistema no sirve la interfaz de documentación ni la especificación JSON

#### Scenario: Documentación disponible en desarrollo
- **WHEN** el entorno no es de producción
- **THEN** el sistema sirve la interfaz de documentación y la especificación JSON