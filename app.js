/**
 * HotelDesk Lite — Lógica de Aplicación (SPA Mobile-First)
 * Gestión de Habitaciones Sucias y Pedidos de Huéspedes con persistencia en localStorage.
 */

const STORAGE_KEY = 'hoteldesk_lite_state_v1';

// Datos iniciales de demostración (solo se cargan la primera vez si localStorage está vacío)
const DEFAULT_STATE = {
  rooms: [
    { id: 'room-1', number: '304', createdAt: 'Hace 15 min' },
    { id: 'room-2', number: '108', createdAt: 'Hace 5 min' }
  ],
  orders: [
    { id: 'order-1', text: 'Hab. 205 — 2 toallas extra y almohada', createdAt: 'Hace 10 min' },
    { id: 'order-2', text: 'Hab. 412 — Kit de café y agua mineral', createdAt: 'Hace 2 min' }
  ]
};

// Estado en memoria
let state = loadState();
let toastTimeoutId = null;

// Referencias del DOM
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

const formRooms = document.getElementById('form-rooms');
const inputRoom = document.getElementById('input-room');
const listRooms = document.getElementById('list-rooms');
const emptyRooms = document.getElementById('empty-rooms');
const feedbackRooms = document.getElementById('feedback-rooms');
const badgeRooms = document.getElementById('badge-rooms');

const formOrders = document.getElementById('form-orders');
const inputOrder = document.getElementById('input-order');
const listOrders = document.getElementById('list-orders');
const emptyOrders = document.getElementById('empty-orders');
const feedbackOrders = document.getElementById('feedback-orders');
const badgeOrders = document.getElementById('badge-orders');

const totalPendingText = document.getElementById('total-pending-text');
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toast-message');

/* ==========================================================================
   Persistencia en localStorage
   ========================================================================== */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      return structuredClone(DEFAULT_STATE);
    }
    const parsed = JSON.parse(raw);
    return {
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : []
    };
  } catch (err) {
    console.warn('No se pudo leer localStorage, usando estado en memoria:', err);
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('No se pudo guardar en localStorage:', err);
  }
}

/* ==========================================================================
   Utilidades de Formato y UI
   ========================================================================== */
function getCurrentTimeFormatted() {
  const now = new Date();
  return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showFeedback(element, message) {
  element.textContent = message;
  element.classList.add('visible');
  setTimeout(() => {
    element.classList.remove('visible');
    element.textContent = '';
  }, 3000);
}

function showToast(message) {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastMessageEl.textContent = message;
  toastEl.hidden = false;

  toastTimeoutId = setTimeout(() => {
    toastEl.hidden = true;
  }, 2200);
}

/* ==========================================================================
   Navegación por Pestañas (Tabs)
   ========================================================================== */
function setupTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      // Actualizar estado visual y ARIA de los botones
      tabButtons.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });

      // Mostrar panel activo y ocultar el resto
      tabPanels.forEach((panel) => {
        const isTarget = panel.id === targetId;
        panel.classList.toggle('active', isTarget);
        panel.hidden = !isTarget;
      });
    });
  });
}

/* ==========================================================================
   Renderizado de Listas y Contadores
   ========================================================================== */
function updateCounters() {
  const roomsCount = state.rooms.length;
  const ordersCount = state.orders.length;
  const totalCount = roomsCount + ordersCount;

  badgeRooms.textContent = roomsCount;
  badgeOrders.textContent = ordersCount;
  totalPendingText.textContent =
    totalCount === 1 ? '1 pendiente' : `${totalCount} pendientes`;

  emptyRooms.hidden = roomsCount > 0;
  emptyOrders.hidden = ordersCount > 0;
}

function createRoomElement(room) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.id = room.id;

  const safeNumber = escapeHTML(room.number);
  const safeTime = escapeHTML(room.createdAt);

  li.innerHTML = `
    <div class="task-info">
      <div class="room-badge" aria-hidden="true">
        <span class="room-badge-label">Hab</span>
        <span class="room-badge-number">${safeNumber}</span>
      </div>
      <div class="task-text-group">
        <p class="task-primary-text">Habitación ${safeNumber}</p>
        <div class="task-meta">
          <span>Limpieza pendiente • ${safeTime}</span>
        </div>
      </div>
    </div>
    <button
      type="button"
      class="btn-resolve"
      aria-label="Marcar habitación ${safeNumber} como limpia"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>Resolver</span>
    </button>
  `;

  const resolveBtn = li.querySelector('.btn-resolve');
  resolveBtn.addEventListener('click', () => resolveRoom(room.id, li));

  return li;
}

function createOrderElement(order) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.id = order.id;

  const safeText = escapeHTML(order.text);
  const safeTime = escapeHTML(order.createdAt);

  li.innerHTML = `
    <div class="task-info">
      <div class="order-icon-box" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <div class="task-text-group">
        <p class="task-primary-text">${safeText}</p>
        <div class="task-meta">
          <span>Solicitud activa • ${safeTime}</span>
        </div>
      </div>
    </div>
    <button
      type="button"
      class="btn-resolve"
      aria-label="Resolver pedido: ${safeText}"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>Resolver</span>
    </button>
  `;

  const resolveBtn = li.querySelector('.btn-resolve');
  resolveBtn.addEventListener('click', () => resolveOrder(order.id, li));

  return li;
}

function renderAll() {
  listRooms.innerHTML = '';
  state.rooms.forEach((room) => {
    listRooms.appendChild(createRoomElement(room));
  });

  listOrders.innerHTML = '';
  state.orders.forEach((order) => {
    listOrders.appendChild(createOrderElement(order));
  });

  updateCounters();
}

/* ==========================================================================
   Acciones: Añadir y Resolver (con Animación de Transición Suave)
   ========================================================================== */
function handleAddRoom(event) {
  event.preventDefault();
  const roomNumber = inputRoom.value.trim().toUpperCase();

  if (!roomNumber) {
    showFeedback(feedbackRooms, 'Por favor, ingresa un número de habitación.');
    return;
  }

  // Verificar si la habitación ya está en la lista de pendientes
  const alreadyExists = state.rooms.some(
    (r) => r.number.toUpperCase() === roomNumber
  );
  if (alreadyExists) {
    showFeedback(feedbackRooms, `La habitación ${roomNumber} ya figura como pendiente.`);
    inputRoom.select();
    return;
  }

  const newRoom = {
    id: `room-${Date.now()}`,
    number: roomNumber,
    createdAt: `Hoy, ${getCurrentTimeFormatted()}`
  };

  state.rooms.unshift(newRoom);
  saveState();

  const roomEl = createRoomElement(newRoom);
  listRooms.prepend(roomEl);
  updateCounters();

  inputRoom.value = '';
  inputRoom.focus();
  showToast(`Habitación ${roomNumber} añadida`);
}

function handleAddOrder(event) {
  event.preventDefault();
  const orderText = inputOrder.value.trim();

  if (!orderText) {
    showFeedback(feedbackOrders, 'Escribe el detalle del pedido del huésped.');
    return;
  }

  const newOrder = {
    id: `order-${Date.now()}`,
    text: orderText,
    createdAt: `Hoy, ${getCurrentTimeFormatted()}`
  };

  state.orders.unshift(newOrder);
  saveState();

  const orderEl = createOrderElement(newOrder);
  listOrders.prepend(orderEl);
  updateCounters();

  inputOrder.value = '';
  inputOrder.focus();
  showToast('Pedido registrado');
}

function resolveRoom(roomId, itemElement) {
  if (itemElement.classList.contains('resolving')) return;

  const targetRoom = state.rooms.find((r) => r.id === roomId);
  itemElement.classList.add('resolving');

  setTimeout(() => {
    state.rooms = state.rooms.filter((r) => r.id !== roomId);
    saveState();
    itemElement.remove();
    updateCounters();
    if (targetRoom) {
      showToast(`✓ Habitación ${targetRoom.number} lista`);
    }
  }, 350);
}

function resolveOrder(orderId, itemElement) {
  if (itemElement.classList.contains('resolving')) return;

  itemElement.classList.add('resolving');

  setTimeout(() => {
    state.orders = state.orders.filter((o) => o.id !== orderId);
    saveState();
    itemElement.remove();
    updateCounters();
    showToast('✓ Pedido completado');
  }, 350);
}

/* ==========================================================================
   Inicialización
   ========================================================================== */
function initApp() {
  setupTabs();
  renderAll();
  formRooms.addEventListener('submit', handleAddRoom);
  formOrders.addEventListener('submit', handleAddOrder);
}

document.addEventListener('DOMContentLoaded', initApp);
