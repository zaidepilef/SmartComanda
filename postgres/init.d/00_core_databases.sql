-- ============================================================
-- SmartComanda - Base de datos de la aplicación (idempotente)
-- Crea la base solo si no existe. Re-ejecutable en cada arranque.
-- La API (DATABASE_URL) usa la base 'smartcomanda' (POSTGRES_DB);
-- su esquema lo crean las migraciones SQL del backend (migrations-pg).
-- ============================================================

SELECT 'CREATE DATABASE smartcomanda'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'smartcomanda')\gexec
