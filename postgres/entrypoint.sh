#!/bin/sh
set -e

# Arranca PostgreSQL en segundo plano usando el entrypoint oficial de la imagen.
/usr/local/bin/docker-entrypoint.sh postgres &
PG_PID=$!

# Espera a que PostgreSQL acepte conexiones.
echo "Esperando a que PostgreSQL esté listo..."
until pg_isready -U "${POSTGRES_USER:-admin}" -h localhost >/dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL listo."

# Ejecuta los scripts SQL idempotentes de /init.d en cada arranque.
if [ -d /init.d ]; then
  for f in /init.d/*.sql; do
    [ -e "$f" ] || continue
    echo "Ejecutando $f ..."
    psql -U "${POSTGRES_USER:-admin}" -v ON_ERROR_STOP=1 -f "$f"
  done
fi

# Mantiene en primer plano el proceso de PostgreSQL.
wait "$PG_PID"
