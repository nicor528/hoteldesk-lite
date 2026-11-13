# 🏨 HotelDesk Lite

> Aplicación web *Single Page Application* (SPA) mobile-first diseñada para la gestión rápida y eficiente de habitaciones sucias y pedidos de huéspedes en recepción y housekeeping.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Dexie.js](https://img.shields.io/badge/Dexie.js-IndexedDB-blue?style=for-the-badge)

---

## ✨ Características Principales

- **📱 Diseño Mobile-First & Alto Contraste:** Optimizado para dispositivos táctiles (botones de 48px+, micro-interacciones y legibilidad garantizada).
- **🌗 Sistema de Temas (Claro / Oscuro):** Alternancia dinámica con transición fluida y persistencia en `localStorage`.
- **🗄️ Base de Datos Local con Dexie.js (IndexedDB):** Persistencia en el navegador (`HotelDeskDB`) con flujo CRUD completo:
  - **Habitaciones Sucias:** Registro y control de limpieza en tiempo real.
  - **Pedidos de Huéspedes:** Gestión de solicitudes y atención de clientes.
  - **Historial:** Archivo automático de tareas completadas ordenadas por fecha reciente.
- **🚨 Botón Flotante de Emergencia (FAB):** Botón táctil para llamar al gerente con enlace telefónico directo (`tel:`).
- **⚡ Cero dependencias de servidor:** Aplicación ligera y lista para desplegarse como sitio estático.

---

## 🛠️ Tecnologías

- **HTML5 Semántico:** `role="tablist"`, `role="tabpanel"` y accesibilidad ARIA.
- **CSS3 Moderno:** Variables CSS (`:root` / `[data-theme]`), transiciones y diseño adaptable.
- **JavaScript (ES6+):** Render reactivo del DOM y animaciones de salida al resolver tareas.
- **Dexie.js:** Wrapper declarativo para IndexedDB en el cliente.

---

## 🚀 Despliegue

La aplicación es un sitio estático listo para desplegarse en **Vercel**, **GitHub Pages** o cualquier proveedor de hosting estático sin necesidad de compilación.

---

Desarrollado con ❤️ para optimizar la operativa hotelera diaria.
