## Why

La operación de un local necesita roles con responsabilidades claras y una caja confiable, y hoy no las hay: cualquier usuario autenticado puede crear, cobrar y anular pedidos; no existe el rol de cocina; el owner no puede crear a su personal; no se puede corregir un pedido; y la caja no guarda el arqueo al cerrar (en desarrollo hay una caja abierta desde septiembre que bloquea abrir otra). El usuario reporta que en el POS no logra abrir ni cerrar la caja.

## What Changes

- **Roles y permisos por función** (matriz única aplicada en API, POS y admin):
  - `sysadmin`, `owner` y `admin` (mostrado como **Encargado**): abren y cierran caja, crean y cobran pedidos, **anulan y corrigen** pedidos.
  - `cashier` (**Cajero**): crea pedidos, recibe los pedidos del QR, cobra, envía a cocina, entrega; abre y cierra caja. No anula ni corrige.
  - **Nuevo rol `cook` (Cocinero)**: solo ve los pedidos de su sucursal en cocina, los recibe (en preparación) y los despacha (listo / entregado). No crea, no cobra, no anula.
- **Gestión de personal**: el `owner` puede crear y editar usuarios Encargado, Cajero y Cocinero de su tenant; el Encargado puede crear Cajeros y Cocineros. Nadie puede asignar un rol superior al propio.
- **Acceso por aplicación**: Cajero y Cocinero solo entran al POS; el panel admin queda para Encargado, owner y sysadmin. En el POS el Cocinero solo ve Cocina.
- **Pedidos del QR**: llegan al POS como pendientes de cobro; el Cajero los cobra y con eso pasan a cocina. Cocina no ve pedidos QR sin cobrar.
- **Anular y corregir**: anular exige motivo; si el pedido estaba cobrado se revierte su monto en la caja abierta. Corregir (cambiar ítems y cantidades) solo antes de cobrar.
- **Caja**: el cierre **guarda** los montos contados y la diferencia por medio de pago (cuadre manual); el POS muestra la caja abierta aunque sea de días anteriores, con su fecha, y permite cerrarla. Medios de pago: efectivo, débito, crédito y transferencia (cada sucursal activa los suyos). Integraciones de pago quedan fuera.
- **BREAKING**: endpoints de pedidos, caja y usuarios pasan a validar rol (403 si no corresponde). Un `cashier` ya no puede cancelar pedidos.

## Capabilities

### New Capabilities

- `role-permissions`: roles del sistema (incluido `cook`), nombres visibles, matriz de permisos por acción y acceso por aplicación (POS / admin).

### Modified Capabilities

- `users`: el owner gestiona usuarios de su tenant; reglas de qué roles puede asignar cada uno.
- `order-checkout`: acceso por rol para crear y cobrar; anular con motivo y reverso en caja; corregir antes de cobrar.
- `kitchen-display`: cambios de estado por rol (cocina avanza, solo Encargado o superior anula); cocina ve solo pedidos cobrados.
- `pos-order-taking`: el Cajero recibe y cobra pedidos QR pendientes desde el POS.
- `pos-cash-session`: roles que abren caja; caja abierta de días anteriores visible y cerrable; se elimina el requisito obsoleto "cierre diferido".
- `cash-session-closure`: el cierre persiste montos contados y diferencias; roles que cierran.

## Impact

- **@backend** (`SmartComanda_api`): rol `cook` (migración de `roles`, nombre visible de `admin` → "Encargado"), middleware de permisos por acción, guards en `orders`, `cash-sessions` y `users`, endpoints de anular y corregir pedido, columnas de arqueo en `cash_sessions` (migración), reverso de totales al anular.
- **@frontend-pos** (`SmartComanda_pos`): menú y rutas por rol, cola de pedidos QR por cobrar, anular/corregir para Encargado, caja abierta antigua visible, mensajes 403 claros.
- **@frontend-admin** (`SmartComanda_admin`): bloquear ingreso de Cajero y Cocinero, alta de usuarios con roles permitidos según quien crea, etiqueta "Encargado". **Se superpone con la rama local `fix/user-role-update` (auth y usuarios) en Sources**: coordinar antes de implementar esa parte.
- **Datos**: la caja abierta antigua de desarrollo se cierra desde el POS una vez implementado.
