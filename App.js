import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, TextInput, Pressable,
  ScrollView, SafeAreaView, StatusBar, useWindowDimensions,
} from 'react-native';

const C = {
  primary: '#0F766E', dark: '#115E59', accent: '#F59E0B',
  bg: '#F1F5F9', card: '#FFFFFF', text: '#0F172A',
  muted: '#64748B', border: '#CBD5E1', danger: '#DC2626',
  ok: '#16A34A', info: '#0284C7',
};

const CATEGORIES = ['Todas', 'Tecnología', 'Hogar', 'Mascotas', 'Deporte'];
const BRANDS = ['Todas', 'SabanaTech', 'HogarVivo', 'PetSabana', 'FitZone'];

// Tarifas ficticias HU26
const SHIPPING_RATES = {
  Mosquera: { Estandar: 6000, Expres: 10000 },
  Funza: { Estandar: 8000, Expres: 12000 },
  Madrid: { Estandar: 10000, Expres: 14000 },
};

// Catálogo inicial con variantes (HU21: mínimo 3 productos con variantes; stock global = suma de variantes)
const INITIAL_PRODUCTS = [
  {
    id: 'PROD-001', nombre: 'Audífonos Inalámbricos Pro', categoria: 'Tecnología', marca: 'SabanaTech',
    precioBase: 85000, stock: 8, descripcion: 'Audífonos Bluetooth con estuche de carga rápida y cancelación pasiva.',
    variantes: [
      { id: 'VAR-001-N', etiqueta: 'Color Negro', precioFinal: 85000, stock: 5 },
      { id: 'VAR-001-B', etiqueta: 'Color Blanco', precioFinal: 89000, stock: 3 },
      { id: 'VAR-001-A', etiqueta: 'Color Azul (Agotado)', precioFinal: 85000, stock: 0 },
    ],
  },
  {
    id: 'PROD-002', nombre: 'Teclado Mecánico Compacto', categoria: 'Tecnología', marca: 'SabanaTech',
    precioBase: 145000, stock: 5, descripcion: 'Teclado retroiluminado ideal para programación y estudio.',
    variantes: [
      { id: 'VAR-002-R', etiqueta: 'Switch Rojo', precioFinal: 145000, stock: 3 },
      { id: 'VAR-002-A', etiqueta: 'Switch Azul', precioFinal: 150000, stock: 2 },
    ],
  },
  {
    id: 'PROD-003', nombre: 'Soporte Ergonómico Laptop', categoria: 'Tecnología', marca: 'SabanaTech',
    precioBase: 42000, stock: 10, descripcion: 'Base plegable de aluminio ajustable en 6 niveles.', variantes: [],
  },
  {
    id: 'PROD-004', nombre: 'Cafetera Prensa Francesa 600ml', categoria: 'Hogar', marca: 'HogarVivo',
    precioBase: 58000, stock: 6, descripcion: 'Prensa de vidrio resistente con filtro de acero inoxidable.', variantes: [],
  },
  {
    id: 'PROD-005', nombre: 'Lámpara LED de Escritorio', categoria: 'Hogar', marca: 'HogarVivo',
    precioBase: 36000, stock: 0, descripcion: 'Lámpara táctil de bajo consumo con 3 tonos de luz.', variantes: [],
  },
  {
    id: 'PROD-006', nombre: 'Set Organizadores Cocina x4', categoria: 'Hogar', marca: 'HogarVivo',
    precioBase: 49000, stock: 9, descripcion: 'Recipientes herméticos apilables para alimentos secos.', variantes: [],
  },
  {
    id: 'PROD-007', nombre: 'Cama Acolchada Mascota', categoria: 'Mascotas', marca: 'PetSabana',
    precioBase: 65000, stock: 6, descripcion: 'Cama suave, lavable y antideslizante para perros o gatos.',
    variantes: [
      { id: 'VAR-007-S', etiqueta: 'Talla S', precioFinal: 65000, stock: 4 },
      { id: 'VAR-007-M', etiqueta: 'Talla M', precioFinal: 78000, stock: 2 },
      { id: 'VAR-007-L', etiqueta: 'Talla L (Agotada)', precioFinal: 92000, stock: 0 },
    ],
  },
  {
    id: 'PROD-008', nombre: 'Bebedero Portátil Paseo', categoria: 'Mascotas', marca: 'PetSabana',
    precioBase: 25000, stock: 12, descripcion: 'Botella dispensadora antiderrames de 500ml.', variantes: [],
  },
  {
    id: 'PROD-009', nombre: 'Rascador Torre para Gatos', categoria: 'Mascotas', marca: 'PetSabana',
    precioBase: 110000, stock: 3, descripcion: 'Poste recubierto en fique natural con base de descanso.', variantes: [],
  },
  {
    id: 'PROD-010', nombre: 'Colchoneta Yoga Antideslizante', categoria: 'Deporte', marca: 'FitZone',
    precioBase: 54000, stock: 7, descripcion: 'Tapete acolchado de 6mm con correa incluida.',
    variantes: [
      { id: 'VAR-010-V', etiqueta: 'Verde Esmeralda', precioFinal: 54000, stock: 4 },
      { id: 'VAR-010-M', etiqueta: 'Morado', precioFinal: 54000, stock: 3 },
    ],
  },
  {
    id: 'PROD-011', nombre: 'Set Bandas Elásticas x5', categoria: 'Deporte', marca: 'FitZone',
    precioBase: 38000, stock: 11, descripcion: 'Bandas de resistencia progresiva para entrenamiento.', variantes: [],
  },
  {
    id: 'PROD-012', nombre: 'Termo Deportivo Acero 1L', categoria: 'Deporte', marca: 'FitZone',
    precioBase: 46000, stock: 8, descripcion: 'Termo térmico que conserva bebidas frías por 12 horas.', variantes: [],
  },
];

// Pedido inicial de prueba para verificar seguimiento (HU27)
const INITIAL_ORDERS = [
  {
    code: 'SM-10001',
    date: '22/11/2026 10:30',
    addressText: 'Casa Mosquera · Calle 10 # 5-20, Mosquera',
    shippingMode: 'Estandar',
    items: [{ key: 'PROD-003', nombre: 'Soporte Ergonómico Laptop', variante: 'Única', precio: 42000, qty: 1, lineTotal: 42000 }],
    subtotal: 42000,
    shipping: 6000,
    total: 48000,
    status: 'Confirmado',
    timeline: [{ status: 'Confirmado', time: '22/11/2026 10:30' }],
    restocked: false,
  },
];

const INITIAL_ADDRESSES = [
  { id: 'DIR-1', alias: 'Casa Mosquera', municipio: 'Mosquera', descripcion: 'Calle 10 # 5-20 Barrio Centro', principal: true },
  { id: 'DIR-2', alias: 'Oficina Funza', municipio: 'Funza', descripcion: 'Carrera 9 # 14-30 Local 2', principal: false },
];

const INITIAL_QUESTIONS = [
  {
    id: 'Q-1', productId: 'PROD-001', pregunta: '¿Incluye cable de carga USB-C en la caja?',
    respuesta: 'Respuesta simulada: Sí, incluye cable USB-C corto y almohadillas de repuesto.',
    estado: 'Respondida', fecha: '22/11/2026',
  },
];

const cop = (n) => '$' + Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const ini = (t) => t.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');

// Fuente única de stock: si tiene variantes, suma sus stocks; si no, usa el stock base
const getProductStock = (prod) =>
  prod.variantes && prod.variantes.length > 0
    ? prod.variantes.reduce((sum, v) => sum + v.stock, 0)
    : prod.stock;

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // Ajuste automático para pantalla completa en PC vs Celular

  // Estados base
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]); // [{ key, productId, variantId, variantLabel, precio, qty }]
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Navegación
  const [tab, setTab] = useState('catalogo'); // catalogo | comparar | favoritos | carrito | pedidos | avisos | ayuda
  const [detailId, setDetailId] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [orderDetailCode, setOrderDetailCode] = useState(null);
  const [msg, setMsg] = useState(null);

  // HU04, HU05, HU06, HU23: Búsqueda y filtros combinados
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [brandFilter, setBrandFilter] = useState('Todas');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('none');

  // HU22: Comparador (2 a 3 productos)
  const [compareIds, setCompareIds] = useState(['PROD-001', 'PROD-002']);

  // HU24: Preguntas frecuentes
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [qInput, setQInput] = useState('');

  // HU25 y HU26: Direcciones y envío
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState('DIR-1');
  const [shippingMode, setShippingMode] = useState('Estandar'); // Estandar | Expres
  const [editAddrId, setEditAddrId] = useState(null);
  const [addrAlias, setAddrAlias] = useState('');
  const [addrMuni, setAddrMuni] = useState('Mosquera');
  const [addrDesc, setAddrDesc] = useState('');

  // HU29 y HU30: Notificaciones internas y avisos de reposición
  const [notifications, setNotifications] = useState([
    { id: 'NOT-1', tipo: 'Pedido', mensaje: 'Pedido SM-10001 confirmado correctamente.', fecha: '22/11/2026', leida: false },
  ]);
  const [restockSubs, setRestockSubs] = useState([]); // ['PROD-005', 'VAR-001-A', ...]

  // HU32: Centro de ayuda y soporte
  const [tickets, setTickets] = useState([]);
  const [ticketOrderCode, setTicketOrderCode] = useState('SM-10001');
  const [ticketReason, setTicketReason] = useState('Entrega');
  const [ticketDesc, setTicketDesc] = useState('');

  const notify = (text, err = false) => {
    setMsg({ text, err });
    setTimeout(() => setMsg((p) => (p?.text === text ? null : p)), 3500);
  };

  const pushInternalNotif = (tipo, mensaje, refKey) => {
    setNotifications((prev) => {
      // Evita duplicar exactamente el mismo evento consecutivo (HU29 CA04)
      if (refKey && prev.some((n) => n.refKey === refKey)) return prev;
      return [
        { id: `NOT-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, tipo, mensaje, fecha: new Date().toLocaleTimeString('es-CO'), leida: false, refKey },
        ...prev,
      ];
    });
  };

  // --- HU23: FILTROS COMBINADOS + BÚSQUEDA + ORDENAMIENTO ---
  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice.trim() ? Number(minPrice) : null;
    const max = maxPrice.trim() ? Number(maxPrice) : null;

    const list = products.filter((p) => {
      const totalStk = getProductStock(p);
      if (category !== 'Todas' && p.categoria !== category) return false;
      if (brandFilter !== 'Todas' && p.marca !== brandFilter) return false;
      if (onlyAvailable && totalStk <= 0) return false;
      if (q && !p.nombre.toLowerCase().includes(q) && !p.marca.toLowerCase().includes(q)) return false;
      if (min !== null && !isNaN(min) && p.precioBase < min) return false;
      if (max !== null && !isNaN(max) && p.precioBase > max) return false;
      return true;
    });

    if (sort === 'asc') return [...list].sort((a, b) => a.precioBase - b.precioBase);
    if (sort === 'desc') return [...list].sort((a, b) => b.precioBase - a.precioBase);
    return list;
  }, [products, search, category, brandFilter, onlyAvailable, minPrice, maxPrice, sort]);

  const applyPriceFilterCheck = () => {
    const min = minPrice.trim() ? Number(minPrice) : null;
    const max = maxPrice.trim() ? Number(maxPrice) : null;
    if (min !== null && max !== null && min > max) {
      notify('Error: El precio mínimo no puede ser mayor que el precio máximo.', true);
      setMinPrice('');
      setMaxPrice('');
    } else {
      notify('Filtros aplicados al catálogo.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('Todas');
    setBrandFilter('Todas');
    setOnlyAvailable(false);
    setMinPrice('');
    setMaxPrice('');
    setSort('none');
    notify('Filtros restablecidos.');
  };

  // --- HU22: COMPARADOR ---
  const toggleCompare = (prodId) => {
    if (compareIds.includes(prodId)) {
      setCompareIds((prev) => prev.filter((id) => id !== prodId));
      notify('Producto retirado del comparador.');
    } else {
      if (compareIds.length >= 3) {
        return notify('Límite alcanzado: solo puedes comparar hasta 3 productos.', true);
      }
      setCompareIds((prev) => [...prev, prodId]);
      notify('Añadido al comparador.');
    }
  };

  // --- HU08: FAVORITOS ---
  const toggleFav = (id) => {
    const exists = favorites.includes(id);
    setFavorites((prev) => (exists ? prev.filter((x) => x !== id) : [...prev, id]));
    notify(exists ? 'Quitado de favoritos.' : 'Guardado en favoritos.');
  };

  // --- HU21 & HU09: AGREGAR AL CARRITO CON VARIANTES ---
  const handleAddToCart = (prod, variantObj = null) => {
    const hasVariants = prod.variantes && prod.variantes.length > 0;
    if (hasVariants && !variantObj) {
      return notify('Por favor selecciona una variante (talla o color) antes de agregar.', true);
    }

    const availStock = hasVariants ? variantObj.stock : prod.stock;
    if (availStock <= 0) {
      return notify('Esta opción está agotada y no puede agregarse.', true);
    }

    const itemKey = hasVariants ? `${prod.id}::${variantObj.id}` : prod.id;
    const unitPrice = hasVariants ? variantObj.precioFinal : prod.precioBase;
    const varLabel = hasVariants ? variantObj.etiqueta : 'Única';

    const existing = cart.find((c) => c.key === itemKey);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty + 1 > availStock) {
      return notify(`Stock máximo permitido: ${availStock} unidad(es).`, true);
    }

    setCart((prev) =>
      existing
        ? prev.map((c) => (c.key === itemKey ? { ...c, qty: c.qty + 1 } : c))
        : [...prev, { key: itemKey, productId: prod.id, variantId: variantObj?.id || null, variantLabel: varLabel, nombre: prod.nombre, precio: unitPrice, qty: 1 }]
    );
    notify(`Agregado: ${prod.nombre} (${varLabel})`);
  };

  const changeCartQty = (key, delta) => {
    const item = cart.find((c) => c.key === key);
    if (!item) return;
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return;

    const maxStock = item.variantId
      ? prod.variantes.find((v) => v.id === item.variantId)?.stock || 0
      : prod.stock;

    if (item.qty + delta > maxStock) {
      return notify(`Stock máximo disponible: ${maxStock} uds.`, true);
    }
    if (item.qty + delta <= 0) {
      setCart((prev) => prev.filter((c) => c.key !== key));
      return notify('Artículo eliminado del carrito.');
    }
    setCart((prev) => prev.map((c) => (c.key === key ? { ...c, qty: c.qty + delta } : c)));
  };

  // --- HU25: LIBRETA DE DIRECCIONES ---
  const handleSaveAddress = () => {
    if (!addrAlias.trim() || !addrDesc.trim()) {
      return notify('Completa alias y referencia de dirección.', true);
    }
    if (editAddrId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editAddrId ? { ...a, alias: addrAlias.trim(), municipio: addrMuni, descripcion: addrDesc.trim() } : a))
      );
      setEditAddrId(null);
      notify('Dirección actualizada sin duplicar.');
    } else {
      const newId = `DIR-${Date.now().toString().slice(-4)}`;
      setAddresses((prev) => [
        ...prev,
        { id: newId, alias: addrAlias.trim(), municipio: addrMuni, descripcion: addrDesc.trim(), principal: prev.length === 0 },
      ]);
      setSelectedAddressId(newId);
      notify('Nueva dirección agregada.');
    }
    setAddrAlias('');
    setAddrDesc('');
  };

  const setPrincipalAddress = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, principal: a.id === id })));
    setSelectedAddressId(id);
    notify('Dirección principal actualizada.');
  };

  // --- HU26: ESTIMADOR DE ENVÍO ---
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const subtotal = cart.reduce((s, i) => s + i.precio * i.qty, 0);

  const shippingInfo = useMemo(() => {
    if (cart.length === 0) return { cost: 0, eta: 'Sin artículos', valid: false };
    if (!selectedAddress || !shippingMode) return { cost: 0, eta: 'Selecciona dirección y modalidad', valid: false };
    const muniRates = SHIPPING_RATES[selectedAddress.municipio];
    if (!muniRates) return { cost: 0, eta: 'Municipio fuera de cobertura', valid: false };
    return {
      cost: muniRates[shippingMode],
      eta: '1 a 2 días hábiles (Simulado)',
      valid: true,
    };
  }, [cart.length, selectedAddress, shippingMode]);

  const totalOrderAmount = subtotal + shippingInfo.cost;

  // --- HU13, HU14, HU27: CONFIRMAR COMPRA Y DESCONTAR STOCK ---
  const handleConfirmPurchase = () => {
    if (cart.length === 0) return notify('El carrito está vacío.', true);
    if (!selectedAddress) return notify('Debes seleccionar una dirección de entrega antes de confirmar.', true);
    if (!shippingInfo.valid) return notify('Selecciona una modalidad de envío válida.', true);

    // Verificar inventario por variante
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.productId);
      const avail = item.variantId
        ? prod?.variantes.find((v) => v.id === item.variantId)?.stock || 0
        : prod?.stock || 0;
      if (item.qty > avail) {
        return notify(`Inventario insuficiente para ${item.nombre} (${item.variantLabel}).`, true);
      }
    }

    // Descontar unidades en la fuente única de stock
    setProducts((prev) =>
      prev.map((p) => {
        const boughtItems = cart.filter((c) => c.productId === p.id);
        if (boughtItems.length === 0) return p;

        if (p.variantes && p.variantes.length > 0) {
          const updatedVars = p.variantes.map((v) => {
            const match = boughtItems.find((b) => b.variantId === v.id);
            return match ? { ...v, stock: Math.max(0, v.stock - match.qty) } : v;
          });
          return { ...p, variantes: updatedVars, stock: updatedVars.reduce((s, v) => s + v.stock, 0) };
        } else {
          const totalBought = boughtItems.reduce((s, b) => s + b.qty, 0);
          return { ...p, stock: Math.max(0, p.stock - totalBought) };
        }
      })
    );

    const code = `SM-${Date.now().toString().slice(-5)}`;
    const now = new Date().toLocaleString('es-CO');
    const newOrder = {
      code,
      date: now,
      addressText: `${selectedAddress.alias} · ${selectedAddress.descripcion}, ${selectedAddress.municipio}`,
      shippingMode,
      items: cart.map((c) => ({ ...c, lineTotal: c.precio * c.qty })),
      subtotal,
      shipping: shippingInfo.cost,
      total: totalOrderAmount,
      status: 'Confirmado',
      timeline: [{ status: 'Confirmado', time: now }],
      restocked: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    pushInternalNotif('Pedido', `Pedido ${code} confirmado por ${cop(totalOrderAmount)}.`, `${code}-Confirmado`);
    notify(`¡Compra simulada confirmada! Código: ${code}`);
    setTab('pedidos');
    setOrderDetailCode(code);
  };

  // --- HU27: SIMULAR AVANCE DE ENTREGA ---
  const simulateAdvanceOrder = (code) => {
    const flow = ['Confirmado', 'Preparando', 'En camino', 'Entregado'];
    setOrders((prev) =>
      prev.map((o) => {
        if (o.code !== code) return o;
        if (o.status === 'Entregado' || o.status === 'Cancelado') return o;
        const nextStatus = flow[flow.indexOf(o.status) + 1];
        if (!nextStatus) return o;
        const time = new Date().toLocaleTimeString('es-CO');
        pushInternalNotif('Seguimiento', `Tu pedido ${o.code} cambió a estado: ${nextStatus}.`, `${o.code}-${nextStatus}`);
        notify(`Estado actualizado a: ${nextStatus}`);
        return { ...o, status: nextStatus, timeline: [...o.timeline, { status: nextStatus, time }] };
      })
    );
  };

  // --- HU28: CANCELACIÓN Y REINTEGRO ÚNICO DE STOCK ---
  const cancelOrder = (code) => {
    const order = orders.find((o) => o.code === code);
    if (!order) return;
    if (order.status === 'Cancelado') return notify('Este pedido ya está cancelado.', true);
    if (order.status !== 'Confirmado' && order.status !== 'Preparando') {
      return notify(`No se puede cancelar un pedido en estado "${order.status}".`, true);
    }

    // Restituir inventario exactamente una vez
    if (!order.restocked) {
      setProducts((prev) =>
        prev.map((p) => {
          const orderItems = order.items.filter((i) => i.productId === p.id);
          if (orderItems.length === 0) return p;

          if (p.variantes && p.variantes.length > 0) {
            const updatedVars = p.variantes.map((v) => {
              const match = orderItems.find((i) => i.variantId === v.id);
              return match ? { ...v, stock: v.stock + match.qty } : v;
            });
            return { ...p, variantes: updatedVars, stock: updatedVars.reduce((s, v) => s + v.stock, 0) };
          } else {
            const qtyBack = orderItems.reduce((s, i) => s + i.qty, 0);
            return { ...p, stock: p.stock + qtyBack };
          }
        })
      );
    }

    const time = new Date().toLocaleTimeString('es-CO');
    setOrders((prev) =>
      prev.map((o) =>
        o.code === code
          ? { ...o, status: 'Cancelado', restocked: true, timeline: [...o.timeline, { status: 'Cancelado (Stock reintegrado)', time }] }
          : o
      )
    );
    pushInternalNotif('Cancelación', `Pedido ${code} cancelado y stock restituido.`, `${code}-Cancelado`);
    notify(`Pedido ${code} cancelado y unidades devueltas al inventario.`);
  };

  // --- HU30: AVISOS Y SIMULACIÓN DE REPOSICIÓN ---
  const toggleRestockSub = (targetKey, label) => {
    const exists = restockSubs.includes(targetKey);
    if (exists) {
      setRestockSubs((prev) => prev.filter((k) => k !== targetKey));
      notify(`Suscripción de aviso cancelada para ${label}.`);
    } else {
      setRestockSubs((prev) => [...prev, targetKey]);
      notify(`Te avisaremos en Notificaciones cuando haya stock de ${label}.`);
    }
  };

  const simulateRestock = (prodId, variantId = null) => {
    const targetKey = variantId ? `${prodId}::${variantId}` : prodId;
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        if (variantId) {
          const updatedVars = p.variantes.map((v) => (v.id === variantId ? { ...v, stock: v.stock + 5 } : v));
          return { ...p, variantes: updatedVars, stock: updatedVars.reduce((s, v) => s + v.stock, 0) };
        }
        return { ...p, stock: p.stock + 5 };
      })
    );

    if (restockSubs.includes(targetKey)) {
      pushInternalNotif('Reposición', `¡Ya hay nuevas unidades disponibles de ${prod.nombre}!`, `restock-${targetKey}-${Date.now()}`);
      setRestockSubs((prev) => prev.filter((k) => k !== targetKey));
    }
    notify(`Simulación: Se agregaron 5 unidades de reposición a ${prod.nombre}.`);
  };

  // --- HU24: PREGUNTAS FRECUENTES ---
  const sendQuestion = (prodId) => {
    if (qInput.trim().length < 10) {
      return notify('La pregunta debe tener al menos 10 caracteres.', true);
    }
    const newQ = {
      id: `Q-${Date.now()}`,
      productId: prodId,
      pregunta: qInput.trim(),
      respuesta: '',
      estado: 'Pendiente',
      fecha: new Date().toLocaleDateString('es-CO'),
    };
    setQuestions((prev) => [newQ, ...prev]);
    setQInput('');
    notify('Pregunta enviada (estado: Pendiente).');
  };

  const simulateAnswerQuestion = (qId) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              estado: 'Respondida',
              respuesta: 'Respuesta simulada de demostración: Este producto cuenta con garantía local de 30 días en Sabana Occidente.',
            }
          : q
      )
    );
    notify('Respuesta simulada generada.');
  };

  // --- HU32: CENTRO DE AYUDA ---
  const createSupportTicket = () => {
    if (!ticketOrderCode) return notify('Selecciona un pedido asociado.', true);
    if (ticketDesc.trim().length < 15) return notify('Describe el inconveniente con al menos 15 caracteres.', true);
    const id = `SUP-${Date.now().toString().slice(-4)}`;
    setTickets((prev) => [
      { id, orderCode: ticketOrderCode, reason: ticketReason, desc: ticketDesc.trim(), status: 'Abierto', reply: '' },
      ...prev,
    ]);
    setTicketDesc('');
    notify(`Solicitud de soporte ${id} creada (Estado: Abierto).`);
  };

  const simulateSupportReply = (id) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'Respondido', reply: 'Respuesta simulada de soporte: Hemos revisado tu caso y gestionamos la novedad con el comercio local.' }
          : t
      )
    );
    notify(`Caso ${id} respondido en modo demostración.`);
  };

  const unreadNotifs = notifications.filter((n) => !n.leida).length;
  const cartTotalUnits = cart.reduce((a, b) => a + b.qty, 0);

  // --- RENDER DETALLE DE PRODUCTO (HU07, HU21, HU24, HU30, HU31) ---
  const detailProd = products.find((p) => p.id === detailId);

  const renderDetailView = () => {
    if (!detailProd) return null;
    const hasVariants = detailProd.variantes && detailProd.variantes.length > 0;
    const activeVariant = hasVariants ? detailProd.variantes.find((v) => v.id === selectedVariantId) : null;
    const displayPrice = activeVariant ? activeVariant.precioFinal : detailProd.precioBase;
    const displayStock = hasVariants
      ? activeVariant
        ? activeVariant.stock
        : getProductStock(detailProd)
      : detailProd.stock;

    const restockKey = hasVariants && activeVariant ? `${detailProd.id}::${activeVariant.id}` : detailProd.id;
    const isSubscribed = restockSubs.includes(restockKey);
    const prodQuestions = questions.filter((q) => q.productId === detailProd.id);

    // HU31: Recomendaciones relacionadas (misma categoría, diferente producto, con stock > 0, máx 4)
    const relatedProducts = products
      .filter((p) => p.categoria === detailProd.categoria && p.id !== detailProd.id && getProductStock(p) > 0)
      .slice(0, 4);

    return (
      <ScrollView contentContainerStyle={s.contentPad}>
        <Pressable onPress={() => { setDetailId(null); setSelectedVariantId(null); }}>
          <Text style={s.link}>← Volver al catálogo</Text>
        </Pressable>

        <View style={[s.cardCol, { marginTop: 10 }]}>
          <View style={s.rowBetween}>
            <Text style={s.badge}>{detailProd.categoria} · {detailProd.marca}</Text>
            <Pressable onPress={() => toggleFav(detailProd.id)}>
              <Text style={{ fontWeight: '700', color: favorites.includes(detailProd.id) ? C.danger : C.muted }}>
                {favorites.includes(detailProd.id) ? '♥ Favorito' : '♡ Guardar'}
              </Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 21, fontWeight: '800', marginTop: 6 }}>{detailProd.nombre}</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: C.primary, marginVertical: 4 }}>{cop(displayPrice)}</Text>
          <Text style={s.muted}>{detailProd.descripcion}</Text>

          {/* HU21: Selector de Variantes */}
          {hasVariants ? (
            <View style={{ marginTop: 12 }}>
              <Text style={s.subTitle}>Elige una variante (obligatorio):</Text>
              <View style={s.rowWrap}>
                {detailProd.variantes.map((v) => (
                  <Pressable
                    key={v.id}
                    style={[s.chip, selectedVariantId === v.id && s.chipOn, v.stock === 0 && { borderColor: C.danger }]}
                    onPress={() => setSelectedVariantId(v.id)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: selectedVariantId === v.id ? '#FFF' : C.text }}>
                      {v.etiqueta} ({v.stock} uds)
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <Text style={{ marginTop: 10, fontWeight: '700', color: displayStock > 0 ? C.ok : C.danger }}>
            {hasVariants && !activeVariant
              ? `Stock total disponible: ${displayStock} uds (selecciona una opción)`
              : displayStock > 0
              ? `Disponibilidad: ${displayStock} unidades`
              : 'AGOTADO (0 unidades)'}
          </Text>

          <Pressable
            style={[s.btn, (hasVariants ? activeVariant && activeVariant.stock <= 0 : detailProd.stock <= 0) && s.disabled]}
            onPress={() => handleAddToCart(detailProd, activeVariant)}
          >
            <Text style={s.btnTxt}>+ Agregar al carrito</Text>
          </Pressable>

          {/* HU30: Aviso de reposición cuando está agotado */}
          {((!hasVariants && detailProd.stock === 0) || (hasVariants && activeVariant && activeVariant.stock === 0)) && (
            <View style={{ marginTop: 10, padding: 10, backgroundColor: '#FEF3C7', borderRadius: 8, gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '700' }}>Artículo agotado. ¿Deseas recibir aviso cuando vuelva?</Text>
              <View style={s.rowWrap}>
                <Pressable style={s.btnAccent} onPress={() => toggleRestockSub(restockKey, detailProd.nombre)}>
                  <Text style={s.btnAccentTxt}>{isSubscribed ? 'Cancelar aviso de stock' : 'Avisarme cuando haya stock'}</Text>
                </Pressable>
                <Pressable style={s.btnOutline} onPress={() => simulateRestock(detailProd.id, activeVariant?.id || null)}>
                  <Text style={s.link}>Simular reposición (+5 uds)</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* HU24: Preguntas frecuentes del producto */}
        <View style={s.cardCol}>
          <Text style={s.subTitle}>Preguntas sobre este producto (HU24)</Text>
          <View style={s.rowWrap}>
            <TextInput
              style={[s.input, { flex: 1, minWidth: 200 }]}
              placeholder="Escribe tu duda (mín. 10 caracteres)..."
              value={qInput}
              onChangeText={setQInput}
            />
            <Pressable style={s.btnSm} onPress={() => sendQuestion(detailProd.id)}>
              <Text style={s.btnTxt}>Enviar pregunta</Text>
            </Pressable>
          </View>
          {prodQuestions.map((q) => (
            <View key={q.id} style={s.subBox}>
              <Text style={{ fontWeight: '700', fontSize: 13 }}>P: {q.pregunta} ({q.fecha})</Text>
              <Text style={{ fontSize: 12, color: q.estado === 'Respondida' ? C.ok : C.accent, fontWeight: '700' }}>
                Estado: {q.estado}
              </Text>
              {q.respuesta ? (
                <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{q.respuesta}</Text>
              ) : (
                <Pressable style={[s.btnOutline, { marginTop: 6, alignSelf: 'flex-start' }]} onPress={() => simulateAnswerQuestion(q.id)}>
                  <Text style={s.link}>Simular respuesta</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* HU31: Recomendaciones relacionadas */}
        <View style={s.cardCol}>
          <Text style={s.subTitle}>Productos relacionados en {detailProd.categoria} (HU31)</Text>
          {relatedProducts.length === 0 ? (
            <Text style={s.muted}>No hay otros productos disponibles en esta categoría por ahora.</Text>
          ) : (
            <View style={s.grid}>
              {relatedProducts.map((rel) => (
                <Pressable
                  key={rel.id}
                  style={[s.relCard, isWide && { width: '48%' }]}
                  onPress={() => { setDetailId(rel.id); setSelectedVariantId(null); }}
                >
                  <Text style={{ fontWeight: '700' }}>{rel.nombre}</Text>
                  <Text style={s.price}>{cop(rel.precioBase)}</Text>
                  <Text style={s.muted}>Stock disponible: {getProductStock(rel)} uds</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  // --- RENDER CATÁLOGO (HU03, HU04, HU05, HU06, HU22, HU23) ---
  const renderCatalogView = () => (
    <ScrollView contentContainerStyle={s.contentPad}>
      <View style={s.cardCol}>
        <TextInput
          style={s.input}
          placeholder="Buscar por nombre o marca..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Categorías */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
          {CATEGORIES.map((cat) => (
            <Pressable key={cat} style={[s.chip, category === cat && s.chipOn]} onPress={() => setCategory(cat)}>
              <Text style={{ fontSize: 12, color: category === cat ? '#FFF' : C.text }}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* HU23: Filtros combinados (Marca, Precio min/max, Disponibilidad) */}
        <View style={s.rowWrap}>
          <Text style={s.muted}>Marca:</Text>
          {BRANDS.map((b) => (
            <Pressable key={b} style={[s.miniChip, brandFilter === b && s.chipOn]} onPress={() => setBrandFilter(b)}>
              <Text style={{ fontSize: 11, color: brandFilter === b ? '#FFF' : C.text }}>{b}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[s.rowWrap, { marginTop: 8 }]}>
          <TextInput
            style={[s.input, { width: 110 }]}
            placeholder="Precio mín."
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
          />
          <TextInput
            style={[s.input, { width: 110 }]}
            placeholder="Precio máx."
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
          <Pressable style={s.btnSm} onPress={applyPriceFilterCheck}>
            <Text style={s.btnTxt}>Filtrar precio</Text>
          </Pressable>
          <Pressable
            style={[s.miniChip, onlyAvailable && { backgroundColor: C.ok }]}
            onPress={() => setOnlyAvailable(!onlyAvailable)}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: onlyAvailable ? '#FFF' : C.text }}>
              {onlyAvailable ? '✓ Solo con stock' : 'Solo con stock'}
            </Text>
          </Pressable>
          <Pressable style={s.btnOutline} onPress={resetFilters}>
            <Text style={s.link}>Restablecer</Text>
          </Pressable>
        </View>

        <View style={[s.rowWrap, { marginTop: 8 }]}>
          <Text style={s.muted}>Ordenar precio:</Text>
          {[['none', 'Normal'], ['asc', 'Menor a mayor'], ['desc', 'Mayor a menor']].map(([k, l]) => (
            <Pressable key={k} style={[s.miniChip, sort === k && { backgroundColor: C.accent }]} onPress={() => setSort(k)}>
              <Text style={{ fontSize: 11, fontWeight: '700' }}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {visibleProducts.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={{ fontSize: 16, fontWeight: '800' }}>No encontramos productos con esos filtros</Text>
          <Pressable style={s.btn} onPress={resetFilters}><Text style={s.btnTxt}>Restablecer filtros</Text></Pressable>
        </View>
      ) : (
        <View style={s.grid}>
          {visibleProducts.map((item) => {
            const totalStk = getProductStock(item);
            const isFav = favorites.includes(item.id);
            const isComp = compareIds.includes(item.id);
            return (
              <View key={item.id} style={[s.prodCard, isWide && { width: '49%' }]}>
                <Pressable style={{ flex: 1, flexDirection: 'row', gap: 10 }} onPress={() => { setDetailId(item.id); setSelectedVariantId(null); }}>
                  <View style={s.avatar}><Text style={s.avatarTxt}>{ini(item.nombre)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.muted}>{item.categoria} · {item.marca}</Text>
                    <Text style={{ fontWeight: '700', fontSize: 14 }}>{item.nombre}</Text>
                    <Text style={s.price}>Desde {cop(item.precioBase)}</Text>
                    <Text style={[s.muted, totalStk === 0 && { color: C.danger, fontWeight: '700' }]}>
                      {totalStk === 0 ? 'Agotado' : `Stock: ${totalStk} uds`} {item.variantes.length > 0 ? `(${item.variantes.length} opciones)` : ''}
                    </Text>
                  </View>
                </Pressable>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable onPress={() => toggleCompare(item.id)}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isComp ? C.info : C.muted }}>
                        {isComp ? '✓ Comparando' : '+ Comparar'}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => toggleFav(item.id)}>
                      <Text style={{ fontSize: 16, color: isFav ? C.danger : C.muted }}>{isFav ? '♥' : '♡'}</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    style={[s.btnSm, totalStk === 0 && s.disabled]}
                    onPress={() =>
                      item.variantes.length > 0
                        ? (setDetailId(item.id), notify('Elige talla o color en el detalle.'))
                        : handleAddToCart(item)
                    }
                  >
                    <Text style={s.btnTxt}>{item.variantes.length > 0 ? 'Elegir opción' : totalStk === 0 ? 'Agotado' : '+ Agregar'}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );

  // --- HU22: COMPARADOR DE PRODUCTOS ---
  const renderCompareView = () => {
    const selectedProds = products.filter((p) => compareIds.includes(p.id));
    return (
      <ScrollView contentContainerStyle={s.contentPad}>
        <Text style={s.sectionTitle}>Comparador de Productos ({selectedProds.length}/3)</Text>
        {selectedProds.length < 2 ? (
          <View style={s.emptyBox}>
            <Text style={{ fontWeight: '700' }}>Selecciona entre 2 y 3 productos desde el catálogo para compararlos.</Text>
            <Pressable style={s.btn} onPress={() => setTab('catalogo')}><Text style={s.btnTxt}>Ir al catálogo</Text></Pressable>
          </View>
        ) : (
          <View style={s.grid}>
            {selectedProds.map((p) => (
              <View key={p.id} style={[s.cardCol, isWide ? { width: '32%' } : { width: '100%' }]}>
                <Text style={s.badge}>{p.categoria}</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', marginTop: 4 }}>{p.nombre}</Text>
                <Text style={s.muted}>Marca: {p.marca}</Text>
                <Text style={[s.price, { fontSize: 17, marginVertical: 4 }]}>{cop(p.precioBase)}</Text>
                <Text style={{ fontWeight: '700', color: getProductStock(p) > 0 ? C.ok : C.danger }}>
                  Disponibilidad: {getProductStock(p)} uds
                </Text>
                <Text style={[s.muted, { marginVertical: 6 }]}>{p.descripcion}</Text>
                <Pressable style={s.btnOutline} onPress={() => toggleCompare(p.id)}>
                  <Text style={{ color: C.danger, fontWeight: '700' }}>Quitar del comparador</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // --- CARRITO + DIRECCIONES (HU25) + ESTIMADOR ENVÍO (HU26) ---
  const renderCartView = () => (
    <ScrollView contentContainerStyle={s.contentPad}>
      <Text style={s.sectionTitle}>Tu Carrito de Compras</Text>
      {cart.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={{ fontWeight: '700' }}>Tu carrito está vacío</Text>
          <Pressable style={s.btn} onPress={() => setTab('catalogo')}><Text style={s.btnTxt}>Explorar productos</Text></Pressable>
        </View>
      ) : (
        <View style={isWide ? { flexDirection: 'row', gap: 14, alignItems: 'flex-start' } : {}}>
          {/* Lista de artículos */}
          <View style={isWide ? { flex: 1.2 } : {}}>
            {cart.map((item) => (
              <View key={item.key} style={s.prodCard}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700' }}>{item.nombre}</Text>
                  <Text style={s.muted}>Variante: {item.variantLabel} · {cop(item.precio)} c/u</Text>
                  <Text style={s.price}>{cop(item.precio * item.qty)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable style={s.qtyBtn} onPress={() => changeCartQty(item.key, -1)}><Text>-</Text></Pressable>
                  <Text style={{ fontWeight: '800' }}>{item.qty}</Text>
                  <Pressable style={s.qtyBtn} onPress={() => changeCartQty(item.key, 1)}><Text>+</Text></Pressable>
                </View>
              </View>
            ))}
          </View>

          {/* Direcciones, envío y resumen */}
          <View style={[s.cardCol, isWide ? { flex: 1 } : {}]}>
            <Text style={s.subTitle}>1. Libreta de Direcciones (HU25)</Text>
            {addresses.map((a) => (
              <Pressable
                key={a.id}
                style={[s.subBox, selectedAddressId === a.id && { borderColor: C.primary, borderWidth: 2 }]}
                onPress={() => setSelectedAddressId(a.id)}
              >
                <View style={s.rowBetween}>
                  <Text style={{ fontWeight: '800' }}>{a.alias} ({a.municipio}) {a.principal ? '★ Principal' : ''}</Text>
                  <Pressable onPress={() => setPrincipalAddress(a.id)}>
                    <Text style={s.link}>Hacer principal</Text>
                  </Pressable>
                </View>
                <Text style={s.muted}>{a.descripcion}</Text>
                <Pressable onPress={() => { setEditAddrId(a.id); setAddrAlias(a.alias); setAddrMuni(a.municipio); setAddrDesc(a.descripcion); }}>
                  <Text style={{ fontSize: 11, color: C.info, fontWeight: '700', marginTop: 2 }}>Editar dirección</Text>
                </Pressable>
              </Pressable>
            ))}

            {/* Formulario agregar/editar dirección */}
            <View style={{ marginTop: 6, gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '700' }}>{editAddrId ? 'Editando dirección:' : 'Agregar nueva dirección ficticia:'}</Text>
              <TextInput style={s.input} placeholder="Alias (ej. Casa, Trabajo)" value={addrAlias} onChangeText={setAddrAlias} />
              <View style={s.rowWrap}>
                {['Mosquera', 'Funza', 'Madrid', 'Otro'].map((m) => (
                  <Pressable key={m} style={[s.miniChip, addrMuni === m && s.chipOn]} onPress={() => setAddrMuni(m)}>
                    <Text style={{ fontSize: 11, color: addrMuni === m ? '#FFF' : C.text }}>{m}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput style={s.input} placeholder="Dirección / referencia de entrega" value={addrDesc} onChangeText={setAddrDesc} />
              <Pressable style={s.btnOutline} onPress={handleSaveAddress}>
                <Text style={s.link}>{editAddrId ? 'Guardar cambios' : '+ Guardar dirección'}</Text>
              </Pressable>
            </View>

            {/* HU26: Modalidad de envío */}
            <Text style={[s.subTitle, { marginTop: 12 }]}>2. Modalidad de Envío (HU26)</Text>
            <View style={s.rowWrap}>
              {['Estandar', 'Expres'].map((mode) => (
                <Pressable key={mode} style={[s.chip, shippingMode === mode && s.chipOn]} onPress={() => setShippingMode(mode)}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: shippingMode === mode ? '#FFF' : C.text }}>
                    Envío {mode}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.muted}>Plazo estimado: {shippingInfo.eta}</Text>

            {/* Resumen */}
            <View style={{ borderTopWidth: 1, borderColor: C.border, marginTop: 10, paddingTop: 8 }}>
              <Text>Subtotal: {cop(subtotal)}</Text>
              <Text>Costo de envío ({selectedAddress?.municipio || 'Sin elegir'}): {cop(shippingInfo.cost)}</Text>
              <Text style={[s.price, { fontSize: 18, marginTop: 4 }]}>Total: {cop(totalOrderAmount)}</Text>
              <Pressable style={[s.btn, { marginTop: 10 }]} onPress={handleConfirmPurchase}>
                <Text style={s.btnTxt}>Confirmar compra simulada</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  // --- HU27 & HU28: SEGUIMIENTO Y CANCELACIÓN DE PEDIDOS ---
  const renderOrdersView = () => {
    const activeOrd = orders.find((o) => o.code === orderDetailCode);
    if (activeOrd) {
      const canAdvance = activeOrd.status !== 'Entregado' && activeOrd.status !== 'Cancelado';
      const canCancel = activeOrd.status === 'Confirmado' || activeOrd.status === 'Preparando';

      return (
        <ScrollView contentContainerStyle={s.contentPad}>
          <Pressable onPress={() => setOrderDetailCode(null)}><Text style={s.link}>← Volver a Mis Pedidos</Text></Pressable>
          <View style={[s.cardCol, { marginTop: 10 }]}>
            <View style={s.rowBetween}>
              <Text style={{ fontSize: 18, fontWeight: '800' }}>Pedido #{activeOrd.code}</Text>
              <Text style={[s.badge, { backgroundColor: activeOrd.status === 'Cancelado' ? '#FEE2E2' : '#CCFBF1' }]}>
                {activeOrd.status}
              </Text>
            </View>
            <Text style={s.muted}>Fecha: {activeOrd.date}</Text>
            <Text style={s.muted}>Destino: {activeOrd.addressText} ({activeOrd.shippingMode})</Text>

            <Text style={[s.subTitle, { marginTop: 10 }]}>Productos comprados (Histórico inmutable):</Text>
            {activeOrd.items.map((it, i) => (
              <Text key={i}>• {it.qty}x {it.nombre} ({it.variantLabel || it.variante}) — {cop(it.lineTotal)}</Text>
            ))}
            <Text style={[s.price, { marginTop: 6 }]}>Envío: {cop(activeOrd.shipping)} | Total: {cop(activeOrd.total)}</Text>

            {/* Cronología de estados */}
            <Text style={[s.subTitle, { marginTop: 12 }]}>Seguimiento cronológico (HU27):</Text>
            {activeOrd.timeline.map((ev, i) => (
              <Text key={i} style={{ fontSize: 12, color: C.text }}>✓ {ev.status} — {ev.time}</Text>
            ))}

            <View style={[s.rowWrap, { marginTop: 12 }]}>
              <Pressable
                style={[s.btnSm, !canAdvance && s.disabled]}
                onPress={() =>
                  canAdvance
                    ? simulateAdvanceOrder(activeOrd.code)
                    : notify(`No se puede avanzar desde estado "${activeOrd.status}".`, true)
                }
              >
                <Text style={s.btnTxt}>Simular avance de entrega</Text>
              </Pressable>

              <Pressable
                style={[s.btnSm, { backgroundColor: canCancel ? C.danger : '#94A3B8' }]}
                onPress={() => cancelOrder(activeOrd.code)}
              >
                <Text style={s.btnTxt}>Cancelar pedido</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={s.contentPad}>
        <Text style={s.sectionTitle}>Mis Pedidos y Seguimiento</Text>
        {orders.map((o) => (
          <Pressable key={o.code} style={s.prodCard} onPress={() => setOrderDetailCode(o.code)}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800' }}>Pedido #{o.code} · {o.status}</Text>
              <Text style={s.muted}>{o.date} · {o.addressText}</Text>
              <Text style={s.price}>Total: {cop(o.total)}</Text>
            </View>
            <Text style={s.link}>Seguir / Gestionar →</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  };

  // --- HU29: CENTRO DE NOTIFICACIONES INTERNO ---
  const renderNotificationsView = () => (
    <ScrollView contentContainerStyle={s.contentPad}>
      <Text style={s.sectionTitle}>Centro de Notificaciones Interno (Simulación)</Text>
      {notifications.length === 0 ? (
        <View style={s.emptyBox}><Text>No tienes notificaciones pendientes.</Text></View>
      ) : (
        notifications.map((n) => (
          <Pressable
            key={n.id}
            style={[s.cardCol, !n.leida && { borderColor: C.accent, borderWidth: 2 }]}
            onPress={() => setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)))}
          >
            <View style={s.rowBetween}>
              <Text style={s.badge}>{n.tipo}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: n.leida ? C.muted : C.accent }}>
                {n.leida ? 'Leída' : '● Nueva (toca para marcar leída)'}
              </Text>
            </View>
            <Text style={{ fontWeight: '700', marginTop: 4 }}>{n.mensaje}</Text>
            <Text style={s.muted}>{n.fecha}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );

  // --- HU32: CENTRO DE AYUDA Y SOPORTE ---
  const renderHelpView = () => (
    <ScrollView contentContainerStyle={s.contentPad}>
      <Text style={s.sectionTitle}>Centro de Ayuda y Solicitudes (HU32)</Text>
      <View style={s.cardCol}>
        <Text style={s.subTitle}>1. Selecciona el pedido asociado:</Text>
        <View style={s.rowWrap}>
          {orders.map((o) => (
            <Pressable key={o.code} style={[s.chip, ticketOrderCode === o.code && s.chipOn]} onPress={() => setTicketOrderCode(o.code)}>
              <Text style={{ fontSize: 12, color: ticketOrderCode === o.code ? '#FFF' : C.text }}>#{o.code}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[s.subTitle, { marginTop: 8 }]}>2. Motivo:</Text>
        <View style={s.rowWrap}>
          {['Entrega', 'Producto', 'Otro'].map((r) => (
            <Pressable key={r} style={[s.chip, ticketReason === r && s.chipOn]} onPress={() => setTicketReason(r)}>
              <Text style={{ fontSize: 12, color: ticketReason === r ? '#FFF' : C.text }}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={[s.input, { marginTop: 8 }]}
          placeholder="Describe tu solicitud (mínimo 15 caracteres)..."
          value={ticketDesc}
          onChangeText={setTicketDesc}
        />
        <Pressable style={s.btn} onPress={createSupportTicket}>
          <Text style={s.btnTxt}>Enviar solicitud de soporte</Text>
        </Pressable>
      </View>

      {tickets.map((t) => (
        <View key={t.id} style={s.cardCol}>
          <View style={s.rowBetween}>
            <Text style={{ fontWeight: '800' }}>Caso {t.id} · Pedido #{t.orderCode}</Text>
            <Text style={s.badge}>{t.status}</Text>
          </View>
          <Text style={s.muted}>Motivo: {t.reason}</Text>
          <Text style={{ marginVertical: 4 }}>{t.desc}</Text>
          {t.reply ? (
            <Text style={{ color: C.ok, fontWeight: '700', fontSize: 12 }}>{t.reply}</Text>
          ) : (
            <Pressable style={[s.btnOutline, { alignSelf: 'flex-start' }]} onPress={() => simulateSupportReply(t.id)}>
              <Text style={s.link}>Simular respuesta</Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar backgroundColor={C.dark} barStyle="light-content" />
      <View style={s.fullApp}>
        {/* Encabezado heredado del Taller 4 */}
        <View style={s.header}>
          <View style={s.logo}><Text style={s.logoTxt}>SM</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.brand}>SabanaMarket 2.0</Text>
            <Text style={s.slogan}>Lo mejor de la Sabana, directo a tus manos.</Text>
          </View>
        </View>

        {/* Barra de navegación adaptable */}
        <View style={s.navWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.nav}>
            {[
              ['catalogo', 'Catálogo'],
              ['comparar', `Comparar (${compareIds.length})`],
              ['favoritos', `Favs (${favorites.length})`],
              ['carrito', `Carrito (${cartTotalUnits})`],
              ['pedidos', `Pedidos (${orders.length})`],
              ['avisos', `Avisos (${unreadNotifs})`],
              ['ayuda', 'Ayuda'],
            ].map(([id, label]) => (
              <Pressable
                key={id}
                style={[s.tab, tab === id && s.tabOn]}
                onPress={() => { setDetailId(null); setOrderDetailCode(null); setTab(id); }}
              >
                <Text style={[s.tabTxt, tab === id && s.tabTxtOn]}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {msg && (
          <View style={[s.banner, { backgroundColor: msg.err ? '#FEE2E2' : '#DCFCE7' }]}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: C.text }}>{msg.text}</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          {detailProd
            ? renderDetailView()
            : tab === 'catalogo'
            ? renderCatalogView()
            : tab === 'comparar'
            ? renderCompareView()
            : tab === 'favoritos'
            ? (
              <ScrollView contentContainerStyle={s.contentPad}>
                <Text style={s.sectionTitle}>Tus Favoritos</Text>
                {favorites.length === 0 ? (
                  <View style={s.emptyBox}><Text>No tienes favoritos guardados.</Text></View>
                ) : (
                  products.filter((p) => favorites.includes(p.id)).map((p) => (
                    <Pressable key={p.id} style={s.prodCard} onPress={() => setDetailId(p.id)}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700' }}>{p.nombre}</Text>
                        <Text style={s.price}>{cop(p.precioBase)}</Text>
                      </View>
                      <Pressable onPress={() => toggleFav(p.id)}><Text style={{ color: C.danger }}>Quitar</Text></Pressable>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            )
            : tab === 'carrito'
            ? renderCartView()
            : tab === 'pedidos'
            ? renderOrdersView()
            : tab === 'avisos'
            ? renderNotificationsView()
            : renderHelpView()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, width: '100%' },
  fullApp: { flex: 1, width: '100%', backgroundColor: C.bg },
  header: { backgroundColor: C.primary, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 42, height: 42, borderRadius: 10, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },
  logoTxt: { fontWeight: '900', fontSize: 16, color: C.text },
  brand: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  slogan: { color: '#CCFBF1', fontSize: 12 },
  navWrapper: { backgroundColor: C.card, borderBottomWidth: 1, borderColor: C.border },
  nav: { flexDirection: 'row', paddingHorizontal: 8 },
  tab: { paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  tabOn: { borderBottomWidth: 3, borderColor: C.primary },
  tabTxt: { fontSize: 13, color: C.muted, fontWeight: '600' },
  tabTxtOn: { color: C.primary, fontWeight: '800' },
  banner: { padding: 10, alignItems: 'center' },
  contentPad: { padding: 14, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: C.text },
  subTitle: { fontSize: 14, fontWeight: '800', marginBottom: 6, color: C.text },
  cardCol: { backgroundColor: C.card, borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  prodCard: { backgroundColor: C.card, borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border, width: '100%' },
  relCard: { backgroundColor: C.bg, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: C.border, width: '100%' },
  avatar: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontWeight: '800', color: C.dark },
  price: { fontSize: 15, fontWeight: '800', color: C.primary },
  muted: { fontSize: 12, color: C.muted },
  badge: { backgroundColor: '#CCFBF1', color: C.dark, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 11, fontWeight: '700', alignSelf: 'flex-start' },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 9, fontSize: 13 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  miniChip: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  chipOn: { backgroundColor: C.primary, borderColor: C.primary },
  btn: { backgroundColor: C.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnSm: { backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnTxt: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  btnAccent: { backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6 },
  btnAccentTxt: { color: C.text, fontWeight: '700', fontSize: 12 },
  btnOutline: { borderWidth: 1, borderColor: C.primary, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6 },
  disabled: { backgroundColor: '#94A3B8' },
  link: { color: C.primary, fontWeight: '700', fontSize: 13 },
  subBox: { backgroundColor: C.bg, padding: 10, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: C.border },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  emptyBox: { backgroundColor: C.card, padding: 24, borderRadius: 10, alignItems: 'center', gap: 10 },
});