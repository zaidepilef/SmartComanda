-- ============================================================
-- SmartComanda - Bases de datos core (idempotente)
-- Crea cada base solo si no existe. Re-ejecutable en cada arranque.
-- La API (DATABASE_URL) usa la base 'smartcomanda'; su esquema es
-- creado por las migraciones SQL del backend (migrations-pg).
-- ============================================================

SELECT 'CREATE DATABASE smartcomanda'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'smartcomanda')\gexec

SELECT 'CREATE DATABASE restaurant_saas'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'restaurant_saas')\gexec

SELECT 'CREATE DATABASE n8n_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n_db')\gexec
