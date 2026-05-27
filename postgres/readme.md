
Este directorio contiene la configuración inicial de PostgreSQL para el proyecto SmartComanda.

---

## Estructura

```txt
postgres/
├── init.sql
└── README.md
```

---

## Bases de datos

El sistema utiliza PostgreSQL con dos bases separadas:

| Base de datos | Uso |
|---|---|
| smartcomanda_db | Base principal de la aplicación SaaS |
| n8n_db | Base exclusiva para n8n |

---

## Archivo init.sql

El archivo `init.sql` se ejecuta automáticamente SOLO la primera vez que Docker crea el volumen de PostgreSQL.

Contenido esperado:

```sql
CREATE DATABASE smartcomanda_db;
CREATE DATABASE n8n_db;
```

---

## Importante

PostgreSQL Docker NO vuelve a ejecutar `init.sql` si el volumen ya existe.

Si se necesita reinicializar completamente PostgreSQL:

```bash
docker compose down -v
docker compose up --build
```

⚠️ ADVERTENCIA:
El comando `-v` elimina TODOS los datos persistentes.

---

## Verificar bases de datos

Entrar al contenedor PostgreSQL:

```bash
docker exec -it smartcomanda_postgres psql -U admin
```

Listar bases de datos:

```sql
\l
```

---

## Credenciales por defecto

| Parámetro | Valor |
|---|---|
| Usuario | admin |
| Password | admin123 |
| Puerto | 5432 |

---

## Conexión desde pgAdmin

### Host

```txt
postgres
```

o:

```txt
smartcomanda_postgres
```

### Database

```txt
smartcomanda_db
```

### Usuario

```txt
admin
```

### Password

```txt
admin123
```

---

## Persistencia de datos

Los datos PostgreSQL se almacenan en el volumen Docker:

```txt
smartcomanda_postgres_data
```

Esto permite mantener la información aunque los contenedores se detengan.

---

## Backup manual

Crear backup:

```bash
docker exec smartcomanda_postgres pg_dump -U admin smartcomanda_db > backup.sql
```

Restaurar backup:

```bash
docker exec -i smartcomanda_postgres psql -U admin smartcomanda_db < backup.sql
```

---

## Logs PostgreSQL

Ver logs en tiempo real:

```bash
docker compose logs -f postgres
```

---

## Arquitectura

```txt
PostgreSQL
│
├── smartcomanda_db
│   ├── usuarios
│   ├── pedidos
│   ├── productos
│   └── etc
│
└── n8n_db
    ├── workflows
    ├── credenciales
    ├── ejecuciones
    └── automatizaciones
```