# Prompt para generar POS Web — Sanguchón / SmartComanda

Actúa como **Senior Frontend Developer + UX/UI Designer especializado en sistemas POS para restaurantes y comida rápida**.

Necesito construir el primer prototipo funcional del **POS de Sanguchón**, una plataforma de gestión de pedidos para una cadena de foodtrucks especializada en:

* Completos
* Hot Dogs
* Sándwiches
* Hamburguesas
* Papas fritas
* Bebidas
* Combos
* Extras y agregados

El objetivo es crear una interfaz POS rápida, clara y optimizada para que un trabajador pueda tomar un pedido en pocos segundos.

## 1. Entregable

Genera un archivo:

`pos.html`

Debe contener:

* HTML
* CSS
* JavaScript

Todo dentro del mismo archivo.

**NO utilizar frameworks externos.**

No utilizar Angular, React, Vue ni Bootstrap.

Se debe poder abrir directamente con:

```bash
google-chrome pos.html
```

o mediante un servidor estático.

El prototipo debe ser completamente funcional utilizando JavaScript y datos mock en memoria.

---

# 2. Concepto general

El POS representa el sistema utilizado por un trabajador de Sanguchón para registrar una venta.

La pantalla debe dividirse principalmente en:

```text
┌─────────────────────────────────────────────────────────────┐
│ SANGUCHÓN       Local: Foodtruck Centro       Usuario: Felipe│
├───────────────┬───────────────────────────────┬─────────────┤
│ CATEGORÍAS    │ PRODUCTOS                     │ PEDIDO      │
│               │                               │             │
│ 🍔 Completos  │ [ Italiano ] [ Dinámico ]     │ 1 Italiano  │
│ 🌭 Hot Dogs   │ [ Chacarero ] [ Especial ]    │   $4.990    │
│ 🥪 Sandwich   │                               │             │
│ 🍟 Papas      │ [ Barros Luco ]               │ 1 Bebida    │
│ 🥤 Bebidas    │ [ Lomito ]                    │   $1.500    │
│ 🥤 Combos     │                               │             │
│ ➕ Extras     │                               │             │
│               │                               │             │
├───────────────┴───────────────────────────────┴─────────────┤
│              TOTAL              $6.490     [ COBRAR ]       │
└─────────────────────────────────────────────────────────────┘
```

El diseño debe sentirse como un **POS profesional de restaurante**, no como una página web corporativa.

Debe priorizar:

* Velocidad
* Botones grandes
* Lectura rápida
* Poco texto innecesario
* Acciones con pocos clics
* Buena visualización en tablet
* Buena visualización en notebook/PC
* Uso con pantalla táctil

---

# 3. Header

Crear un header superior.

Debe mostrar:

```text
SANGUCHÓN
Foodtruck Centro
Caja #01
Usuario: Felipe
```

A la derecha:

```text
🟢 Caja abierta
14:32
```

Agregar botones:

```text
☰ Menú
🧾 Pedidos
📊 Caja
⚙ Configuración
```

El header debe permanecer visible.

---

# 4. Panel de categorías

Crear una columna izquierda con categorías.

Categorías:

```text
Todos
Completos
Hot Dogs
Sándwiches
Hamburguesas
Papas
Bebidas
Combos
Extras
```

Cada categoría debe tener:

* Icono
* Nombre
* Estado activo

Al hacer clic sobre una categoría, filtrar los productos.

Ejemplo:

```javascript
{
    id: "completos",
    name: "Completos",
    icon: "🌭"
}
```

---

# 5. Catálogo de productos

Mostrar los productos como tarjetas grandes.

Cada tarjeta debe tener:

* Imagen simulada o placeholder
* Nombre
* Descripción corta
* Precio
* Badge de disponibilidad
* Botón/agregar al pedido

Ejemplo:

```text
┌──────────────────────┐
│       🌭             │
│                      │
│ Italiano             │
│ Tomate, palta, mayo  │
│                      │
│ $3.990               │
│                      │
│       + AGREGAR      │
└──────────────────────┘
```

Productos iniciales:

## Completos

```text
Italiano
$3.990

Completo Italiano
$3.990

Dinámico
$4.490

Chacarero
$4.490

Especial
$4.490

A lo Pobre
$4.990
```

## Sándwiches

```text
Barros Luco
$5.990

Chacarero
$5.990

Lomito
$5.490

Ave Mayo
$4.990

Mechada
$6.490
```

## Hot Dogs

```text
Hot Dog Clásico
$3.490

Hot Dog BBQ
$4.490

Hot Dog Cheddar
$4.990
```

## Hamburguesas

```text
Clásica
$5.990

Cheese Burger
$6.490

Doble Cheese
$7.990
```

## Papas

```text
Papas Fritas
$2.490

Papas Cheddar
$3.990

Papas Bacon
$4.490
```

## Bebidas

```text
Coca-Cola
$1.500

Coca-Cola Zero
$1.500

Sprite
$1.500

Fanta
$1.500

Agua
$1.200
```

## Combos

```text
Combo Italiano
$5.990

Combo Cheese Burger
$8.490

Combo Hot Dog
$5.990
```

---

# 6. Personalización del producto

Este es uno de los puntos más importantes.

Al hacer clic en un producto, NO agregarlo inmediatamente cuando el producto requiere personalización.

Abrir un modal:

```text
┌───────────────────────────────────────────────┐
│ Italiano                                  X  │
├───────────────────────────────────────────────┤
│                                               │
│ Tamaño                                        │
│                                               │
│ ○ Normal                                      │
│ ○ XL                         +$1.000           │
│                                               │
│ Ingredientes                                 │
│                                               │
│ ☑ Tomate                                      │
│ ☑ Palta                                       │
│ ☑ Mayo                                        │
│                                               │
│ Quitar ingredientes                           │
│                                               │
│ ☐ Sin tomate                                  │
│ ☐ Sin palta                                   │
│ ☐ Sin mayo                                    │
│                                               │
│ Agregados                                     │
│                                               │
│ ☐ Queso                        +$700           │
│ ☐ Bacon                        +$1.000         │
│ ☐ Huevo                        +$700           │
│ ☐ Papas                        +$1.000         │
│                                               │
│ Cantidad                                      │
│ [-] 1 [+]                                     │
│                                               │
│ TOTAL: $4.690                                 │
│                                               │
│          [ AGREGAR AL PEDIDO ]                │
└───────────────────────────────────────────────┘
```

El precio debe actualizarse dinámicamente.

---

# 7. Modificadores

Crear un sistema genérico de modificadores.

Ejemplo de estructura JavaScript:

```javascript
const modifiers = [
    {
        id: "extra-cheese",
        name: "Queso",
        price: 700
    },
    {
        id: "extra-bacon",
        name: "Bacon",
        price: 1000
    },
    {
        id: "extra-egg",
        name: "Huevo",
        price: 700
    }
];
```

Permitir:

* Agregar extra
* Quitar ingrediente
* Cambiar tamaño
* Agregar observación

Ejemplo:

```text
Observación:

"Pan bien tostado"
```

---

# 8. Carrito / pedido

El panel derecho representa el pedido actual.

Ejemplo:

```text
PEDIDO #1042

Cliente:
Consumidor final

────────────────────────────

1x Italiano
Tomate
Palta
Mayo
Extra queso

$4.690

[-] 1 [+]
Editar
Eliminar

────────────────────────────

1x Coca-Cola

$1.500

[-] 1 [+]

────────────────────────────

Subtotal        $6.190
Descuento       $0
TOTAL           $6.190

[ CANCELAR ]

[ COBRAR ]
```

Cada item debe poder:

* Aumentar cantidad
* Disminuir cantidad
* Editar
* Eliminar

---

# 9. Tipo de pedido

Antes de cobrar, permitir seleccionar:

```text
TIPO DE PEDIDO

[ 🏪 Para llevar ]

[ 🍽️ Servir aquí ]

[ 📱 Pedido QR ]

[ 🛵 Delivery ]
```

Para un foodtruck inicialmente:

```text
Para llevar
```

debe ser la opción predeterminada.

---

# 10. Número de pedido

Generar automáticamente:

```text
PEDIDO #1042
```

Cada nuevo pedido incrementa el número.

Mantenerlo en JavaScript.

Ejemplo:

```javascript
let nextOrderNumber = 1042;
```

---

# 11. Cliente

Permitir opcionalmente registrar:

```text
Cliente

Nombre
Teléfono
Número de mesa
Observación
```

Pero ninguno debe ser obligatorio para venta rápida.

Debe existir una opción:

```text
Consumidor final
```

---

# 12. Cobro

Al presionar:

```text
COBRAR
```

abrir modal de pago.

Mostrar:

```text
TOTAL A PAGAR

$6.190

Método de pago:

[ 💵 EFECTIVO ]

[ 💳 DÉBITO ]

[ 💳 CRÉDITO ]

[ 📱 MERCADO PAGO ]

[ 🏦 TRANSFERENCIA ]
```

---

# 13. Pago efectivo

Si selecciona efectivo:

```text
Total: $6.190

Efectivo recibido:

$10.000

Vuelto:

$3.810

[ CONFIRMAR PAGO ]
```

El vuelto debe calcularse automáticamente.

No permitir confirmar si el dinero recibido es menor al total.

---

# 14. Pago con tarjeta

Mostrar:

```text
Total:

$6.190

Esperando pago...

[ SIMULAR PAGO APROBADO ]

[ CANCELAR ]
```

Al simular aprobación:

```text
✓ PAGO APROBADO

Transacción #TX-1042

[ CONTINUAR ]
```

---

# 15. Mercado Pago

Simular integración.

Mostrar:

```text
Mercado Pago

Total:

$6.190

QR DE PAGO

[ QR SIMULADO ]

Estado:

Esperando pago...

[ SIMULAR PAGO APROBADO ]
```

No implementar realmente la API.

Solo simular el flujo.

---

# 16. Confirmación de venta

Después del pago:

```text
✓ VENTA COMPLETADA

Pedido #1042

Total:
$6.190

Pago:
Débito

Hora:
14:35

[ IMPRIMIR BOLETA ]

[ ENVIAR A COCINA ]

[ NUEVO PEDIDO ]
```

---

# 17. Ticket

Crear una vista de ticket.

Ejemplo:

```text
================================
          SANGUCHÓN
       FOODTRUCK CENTRO
================================

PEDIDO #1042
14/08/2026 14:35

1 x Italiano
    Tomate
    Palta
    Mayo
    Extra queso

              $4.690

1 x Coca-Cola
              $1.500

--------------------------------
TOTAL         $6.190

PAGO          DÉBITO

Gracias por preferir Sanguchón
================================
```

Agregar botón:

```text
IMPRIMIR
```

Utilizar `window.print()`.

---

# 18. Cocina / KDS

El POS debe tener una opción:

```text
ENVIAR A COCINA
```

Al enviarlo, crear una orden para cocina.

Crear una pantalla simulada:

```text
KITCHEN DISPLAY SYSTEM

┌──────────────────────────────┐
│ PEDIDO #1042                 │
│ Hace 1 min                   │
│                              │
│ 1x Italiano                  │
│    SIN MAYO                  │
│    EXTRA QUESO               │
│                              │
│ 1x Papas                     │
│                              │
│ ┌──────────────────────────┐ │
│ │      EN PREPARACIÓN      │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Estados:

```text
NUEVO
EN PREPARACIÓN
LISTO
ENTREGADO
```

Permitir cambiar el estado.

---

# 19. Dashboard de pedidos

Crear una pequeña pantalla accesible desde el menú:

```text
PEDIDOS

#1042    $6.190    PAGADO     EN PREPARACIÓN
#1041    $8.990    PAGADO     LISTO
#1040    $4.490    PAGADO     ENTREGADO
```

Filtros:

```text
Todos
Nuevos
En preparación
Listos
Entregados
Cancelados
```

---

# 20. Caja

Crear una pantalla sencilla:

```text
CAJA

Apertura
$50.000

Ventas efectivo
$185.000

Ventas débito
$420.000

Ventas crédito
$130.000

Mercado Pago
$95.000

──────────────────

VENTAS DEL DÍA

$830.000

[ CERRAR CAJA ]
```

No implementar contabilidad real.

Solo simulación.

---

# 21. Estado de productos

Cada producto debe tener:

```javascript
available: true
```

Si está agotado:

```javascript
available: false
```

Mostrar:

```text
AGOTADO
```

y deshabilitar el botón.

---

# 22. Búsqueda rápida

Agregar buscador:

```text
🔍 Buscar producto...
```

Debe buscar por:

* Nombre
* Categoría
* Código

Ejemplo:

```text
"italiano"
```

muestra:

```text
Italiano
Combo Italiano
```

---

# 23. Atajos de teclado

Implementar:

```text
F1 = Nuevo pedido
F2 = Buscar producto
F3 = Cobrar
F4 = Cancelar pedido
F5 = Pedidos
F6 = Cocina
ESC = Cerrar modal
```

Mostrar opcionalmente los shortcuts en un pequeño menú de ayuda.

---

# 24. Persistencia

Utilizar:

```javascript
localStorage
```

para guardar:

* Número del próximo pedido
* Productos
* Pedidos
* Estado de pedidos
* Caja
* Configuración básica

No utilizar backend todavía.

El objetivo es validar primero la UX del POS.

---

# 25. Modelo de datos

Utilizar estructuras similares a:

```javascript
const products = [
    {
        id: "italiano",
        name: "Italiano",
        category: "completos",
        price: 3990,
        description: "Tomate, palta y mayo",
        available: true,
        modifiers: [
            "size",
            "removeIngredients",
            "extras"
        ]
    }
];
```

Pedido:

```javascript
const order = {
    id: 1042,
    type: "takeaway",
    status: "new",
    paymentStatus: "pending",
    paymentMethod: null,
    customer: {
        name: "Consumidor final",
        phone: null
    },
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    createdAt: new Date()
};
```

Item:

```javascript
{
    productId: "italiano",
    name: "Italiano",
    quantity: 1,
    basePrice: 3990,
    modifiers: [
        {
            name: "Extra queso",
            price: 700
        }
    ],
    removedIngredients: [
        "mayo"
    ],
    notes: "Pan tostado",
    total: 4690
}
```

---

# 26. Diseño visual

Utilizar una estética moderna de restaurante de comida rápida.

Características:

* Alto contraste
* Botones grandes
* Bordes ligeramente redondeados
* Tipografía moderna
* Mucho espacio entre botones
* Estados visuales claros
* Precio destacado
* Total extremadamente visible
* Diseño responsive

El POS debe verse bien en:

```text
1920x1080
1366x768
1280x800
1024x768
Tablet
```

No hacer una página excesivamente decorativa.

Es una herramienta operativa.

---

# 27. UX

Priorizar este flujo:

```text
Seleccionar categoría
        ↓
Seleccionar producto
        ↓
Personalizar
        ↓
Agregar
        ↓
Revisar pedido
        ↓
Cobrar
        ↓
Seleccionar método de pago
        ↓
Confirmar
        ↓
Enviar a cocina
        ↓
Nuevo pedido
```

Un pedido sencillo debería poder registrarse en aproximadamente:

```text
3-5 interacciones principales
```

---

# 28. Datos iniciales

Crear suficientes productos mock para demostrar la aplicación.

Debe haber al menos:

```text
6 completos
5 sándwiches
3 hot dogs
3 hamburguesas
3 papas
5 bebidas
3 combos
5 extras
```

---

# 29. Requisitos técnicos

El código debe estar organizado dentro del mismo HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* CSS */
    </style>
</head>

<body>

    <!-- Aplicación -->

    <script>
        // Estado
        // Productos
        // Pedidos
        // Carrito
        // Modales
        // Pago
        // Cocina
        // Caja
        // LocalStorage
        // Eventos
    </script>

</body>
</html>
```

No utilizar dependencias externas.

No utilizar CDN.

No utilizar imágenes externas obligatorias.

Usar emojis, SVG inline o placeholders generados con CSS cuando sea necesario.

---

# 30. Arquitectura JavaScript

Separar conceptualmente el código en:

```text
STATE
PRODUCTS
CART
ORDERS
PAYMENTS
KITCHEN
CASH_REGISTER
UI
MODALS
STORAGE
KEYBOARD_SHORTCUTS
```

Aunque todo esté dentro de un único HTML, mantener funciones pequeñas y claramente separadas.

Ejemplo:

```javascript
addToCart()
removeFromCart()
updateCartQuantity()
calculateCartTotal()
openProductModal()
confirmProduct()
openPaymentModal()
processPayment()
createOrder()
sendToKitchen()
updateKitchenOrder()
completeOrder()
saveState()
loadState()
```

---

# 31. Importante

No crear solamente una maqueta visual.

Debe ser un **prototipo funcional**.

Debo poder:

1. Abrir `pos.html`.
2. Seleccionar productos.
3. Personalizarlos.
4. Agregarlos al carrito.
5. Cambiar cantidades.
6. Eliminar productos.
7. Ver el total.
8. Cobrar.
9. Seleccionar método de pago.
10. Simular aprobación.
11. Generar número de pedido.
12. Enviar pedido a cocina.
13. Cambiar estado de cocina.
14. Ver pedidos.
15. Ver caja.
16. Crear otro pedido.
17. Recargar la página y conservar los datos mediante localStorage.

---

# 32. Resultado esperado

Entrega únicamente el archivo:

```text
pos.html
```

con una aplicación POS completamente navegable.

El resultado debe sentirse como el **primer MVP real del POS de Sanguchón**, no como un simple ejemplo de HTML.

La prioridad es:

**VENTA RÁPIDA → PERSONALIZACIÓN → PAGO → COCINA → ENTREGA**

Diseña la solución pensando que posteriormente este prototipo será reemplazado por:

```text
Angular
      ↓
SmartComanda API
      ↓
PostgreSQL
      ↓
KDS Cocina
      ↓
Mercado Pago
```

Por ahora, sin backend: todo debe funcionar localmente con JavaScript + localStorage.
