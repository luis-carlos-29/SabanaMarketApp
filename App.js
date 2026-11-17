import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, TextInput, Pressable,
  FlatList, ScrollView, SafeAreaView, Platform,
} from 'react-native';

const C = {
  primary: '#0F766E', dark: '#115E59', accent: '#F59E0B',
  bg: '#F1F5F9', card: '#FFFFFF', text: '#0F172A',
  muted: '#64748B', border: '#CBD5E1', danger: '#DC2626', ok: '#16A34A',
};

const CATEGORIES = ['Todas', 'Tecnología', 'Hogar', 'Mascotas', 'Deporte'];

const INITIAL_PRODUCTS = [
  { id: 'PROD-001', nombre: 'Audífonos Inalámbricos Pro', categoria: 'Tecnología', precio: 85000, stock: 8, descripcion: 'Audífonos Bluetooth con estuche de carga rápida y buen sonido.' },
  { id: 'PROD-002', nombre: 'Teclado Mecánico Compacto', categoria: 'Tecnología', precio: 145000, stock: 5, descripcion: 'Teclado retroiluminado ideal para estudiar o trabajar en casa.' },
  { id: 'PROD-003', nombre: 'Soporte Ergonómico Laptop', categoria: 'Tecnología', precio: 42000, stock: 12, descripcion: 'Base plegable de aluminio ajustable en 6 niveles.' },
  { id: 'PROD-004', nombre: 'Cafetera Prensa Francesa 600ml', categoria: 'Hogar', precio: 58000, stock: 6, descripcion: 'Prensa de vidrio resistente con filtro de acero inoxidable.' },
  { id: 'PROD-005', nombre: 'Lámpara LED de Escritorio', categoria: 'Hogar', precio: 36000, stock: 0, descripcion: 'Lámpara táctil de bajo consumo con 3 tonos de luz.' },
  { id: 'PROD-006', nombre: 'Set Organizadores Cocina x4', categoria: 'Hogar', precio: 49000, stock: 10, descripcion: 'Recipientes herméticos apilables para alimentos secos.' },
  { id: 'PROD-007', nombre: 'Cama Acolchada Mascota M', categoria: 'Mascotas', precio: 72000, stock: 4, descripcion: 'Cama suave, lavable y antideslizante para perros o gatos.' },
  { id: 'PROD-008', nombre: 'Bebedero Portátil Paseo', categoria: 'Mascotas', precio: 25000, stock: 15, descripcion: 'Botella dispensadora antiderrames de 500ml para paseos.' },
  { id: 'PROD-009', nombre: 'Rascador Torre para Gatos', categoria: 'Mascotas', precio: 110000, stock: 3, descripcion: 'Poste recubierto en fique natural con base de descanso.' },
  { id: 'PROD-010', nombre: 'Colchoneta Yoga Antideslizante', categoria: 'Deporte', precio: 54000, stock: 9, descripcion: 'Tapete acolchado de 6mm con correa de transporte incluida.' },
  { id: 'PROD-011', nombre: 'Set Bandas Elásticas x5', categoria: 'Deporte', precio: 38000, stock: 11, descripcion: 'Bandas de resistencia progresiva para entrenar en casa.' },
  { id: 'PROD-012', nombre: 'Termo Deportivo Acero 1L', categoria: 'Deporte', precio: 46000, stock: 7, descripcion: 'Termo térmico que conserva bebidas frías por 12 horas.' },
];

const cop = (n) => '$' + Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const ini = (t) => t.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);

  const [tab, setTab] = useState('catalogo');
  const [detailId, setDetailId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [sort, setSort] = useState('none');
  const [msg, setMsg] = useState(null);

  const [checkout, setCheckout] = useState(false);
  const [buyer, setBuyer] = useState({ name: '', phone: '', city: '', address: '' });
  const [receipt, setReceipt] = useState(null);

  const notify = (text, err = false) => {
    setMsg({ text, err });
    setTimeout(() => setMsg((p) => (p?.text === text ? null : p)), 3000);
  };

  // HU04, HU05, HU06: Buscar, filtrar y ordenar
  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter(
      (p) => (category === 'Todas' || p.categoria === category) && p.nombre.toLowerCase().includes(q)
    );
    if (sort === 'asc') return [...list].sort((a, b) => a.precio - b.precio);
    if (sort === 'desc') return [...list].sort((a, b) => b.precio - a.precio);
    return list;
  }, [products, search, category, sort]);

  // HU08: Favoritos
  const toggleFav = (id) => {
    const exists = favorites.includes(id);
    setFavorites((prev) => (exists ? prev.filter((x) => x !== id) : [...prev, id]));
    notify(exists ? 'Quitado de favoritos.' : 'Guardado en favoritos.');
  };

  // HU09 y HU10: Carrito
  const addToCart = (prod) => {
    if (prod.stock <= 0) return notify('Producto agotado.', true);
    const found = cart.find((c) => c.id === prod.id);
    if ((found?.qty || 0) + 1 > prod.stock) return notify(`Stock máximo (${prod.stock} uds).`, true);
    setCart((prev) =>
      found ? prev.map((c) => (c.id === prod.id ? { ...c, qty: c.qty + 1 } : c)) : [...prev, { id: prod.id, qty: 1 }]
    );
    notify(`Agregado: ${prod.nombre}`);
  };

  const changeQty = (id, delta) => {
    const prod = products.find((p) => p.id === id);
    const item = cart.find((c) => c.id === id);
    if (!prod || !item) return;
    if (item.qty + delta > prod.stock) return notify(`Stock máximo (${prod.stock} uds).`, true);
    if (item.qty + delta <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
      return notify('Producto eliminado del carrito.');
    }
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c)));
  };

  // HU11: Cálculos de compra
  const cartItems = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      return p ? { ...p, qty: c.qty, lineTotal: p.precio * c.qty } : null;
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce((s, i) => s + i.lineTotal, 0);
  const shipping = cartItems.length === 0 ? 0 : subtotal >= 150000 ? 0 : 8000;
  const total = subtotal + shipping;

  // HU12, HU13, HU14, HU15: Confirmar compra y descontar stock
  const confirmOrder = () => {
    if (!buyer.name.trim() || !buyer.phone.trim() || !buyer.city.trim() || !buyer.address.trim()) {
      return notify('Completa todos los campos obligatorios de entrega.', true);
    }
    for (const item of cartItems) {
      if (item.qty > item.stock) return notify(`Sin stock suficiente para ${item.nombre}.`, true);
    }
    setProducts((prev) =>
      prev.map((p) => {
        const bought = cartItems.find((c) => c.id === p.id);
        return bought ? { ...p, stock: Math.max(0, p.stock - bought.qty) } : p;
      })
    );
    const newOrder = {
      code: `SM-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleString('es-CO'),
      buyer: { ...buyer },
      items: cartItems,
      subtotal,
      shipping,
      total,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setCheckout(false);
    setReceipt(newOrder);
    notify(`Pedido ${newOrder.code} confirmado.`);
  };

  const renderCard = ({ item }) => {
    const isFav = favorites.includes(item.id);
    const out = item.stock <= 0;
    return (
      <View style={s.card}>
        <Pressable style={{ flex: 1, flexDirection: 'row', gap: 10, alignItems: 'center' }} onPress={() => setDetailId(item.id)}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{ini(item.nombre)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.muted}>{item.categoria}</Text>
            <Text style={s.title}>{item.nombre}</Text>
            <Text style={s.price}>{cop(item.precio)}</Text>
            <Text style={[s.muted, out && { color: C.danger, fontWeight: '700' }]}>
              {out ? 'Agotado' : `Disponible: ${item.stock} uds`}
            </Text>
          </View>
        </Pressable>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Pressable onPress={() => toggleFav(item.id)}>
            <Text style={{ fontSize: 18, color: isFav ? C.danger : C.muted }}>{isFav ? '♥' : '♡'}</Text>
          </Pressable>
          <Pressable style={[s.btnSm, out && s.disabled]} disabled={out} onPress={() => addToCart(item)}>
            <Text style={s.btnTxt}>{out ? 'Sin stock' : '+ Agregar'}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const detailProd = products.find((p) => p.id === detailId);

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.shell}>
        {/* HU01: Identidad de marca */}
        <View style={s.header}>
          <View style={s.logo}><Text style={s.logoTxt}>SM</Text></View>
          <View>
            <Text style={s.brand}>SabanaMarket</Text>
            <Text style={s.slogan}>Lo mejor de la Sabana, directo a tus manos.</Text>
          </View>
        </View>

        {/* HU02: Navegación */}
        <View style={s.nav}>
          {[
            ['catalogo', 'Catálogo'],
            ['favoritos', `Favoritos (${favorites.length})`],
            ['carrito', `Carrito (${cart.reduce((a, b) => a + b.qty, 0)})`],
            ['historial', `Historial (${orders.length})`],
          ].map(([id, label]) => (
            <Pressable key={id} style={[s.tab, tab === id && s.tabOn]} onPress={() => { setDetailId(null); setOrderDetail(null); setTab(id); }}>
              <Text style={[s.tabTxt, tab === id && s.tabTxtOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* HU16: Retroalimentación */}
        {msg && (
          <View style={[s.banner, { backgroundColor: msg.err ? '#FEE2E2' : '#DCFCE7' }]}>
            <Text style={{ fontWeight: '700', fontSize: 12 }}>{msg.text}</Text>
          </View>
        )}

        {/* HU07: Detalle del producto */}
        {detailProd ? (
          <ScrollView style={s.pad}>
            <Pressable onPress={() => setDetailId(null)}><Text style={s.link}>← Volver</Text></Pressable>
            <View style={[s.card, { flexDirection: 'column', alignItems: 'stretch', marginTop: 10 }]}>
              <View style={s.hero}><Text style={s.heroTxt}>{ini(detailProd.nombre)}</Text></View>
              <Text style={s.muted}>{detailProd.categoria}</Text>
              <Text style={{ fontSize: 19, fontWeight: '800', marginVertical: 4 }}>{detailProd.nombre}</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: C.primary }}>{cop(detailProd.precio)}</Text>
              <Text style={{ marginVertical: 6, fontWeight: '700', color: detailProd.stock > 0 ? C.ok : C.danger }}>
                {detailProd.stock > 0 ? `Stock disponible: ${detailProd.stock}` : 'AGOTADO'}
              </Text>
              <Text style={{ color: C.muted, marginBottom: 14 }}>{detailProd.descripcion}</Text>
              <Pressable style={[s.btn, detailProd.stock <= 0 && s.disabled]} disabled={detailProd.stock <= 0} onPress={() => addToCart(detailProd)}>
                <Text style={s.btnTxt}>{detailProd.stock <= 0 ? 'Producto Agotado' : '+ Agregar al carrito'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : tab === 'catalogo' ? (
          <View style={{ flex: 1 }}>
            <View style={s.filters}>
              <TextInput style={s.input} placeholder="Buscar producto..." value={search} onChangeText={setSearch} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                {CATEGORIES.map((cat) => (
                  <Pressable key={cat} style={[s.chip, category === cat && s.chipOn]} onPress={() => setCategory(cat)}>
                    <Text style={{ fontSize: 12, color: category === cat ? '#FFF' : C.text }}>{cat}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text style={s.muted}>Ordenar:</Text>
                {[['none', 'Normal'], ['asc', 'Menor a mayor'], ['desc', 'Mayor a menor']].map(([k, l]) => (
                  <Pressable key={k} style={[s.sortBtn, sort === k && { backgroundColor: C.accent }]} onPress={() => setSort(k)}>
                    <Text style={{ fontSize: 11, fontWeight: '600' }}>{l}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {visibleProducts.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.title}>No encontramos productos</Text>
                <Pressable style={s.btn} onPress={() => { setSearch(''); setCategory('Todas'); }}>
                  <Text style={s.btnTxt}>Ver todos</Text>
                </Pressable>
              </View>
            ) : (
              <FlatList data={visibleProducts} keyExtractor={(i) => i.id} renderItem={renderCard} contentContainerStyle={s.pad} />
            )}
          </View>
        ) : tab === 'favoritos' ? (
          favorites.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.title}>No tienes favoritos guardados</Text>
              <Pressable style={s.btn} onPress={() => setTab('catalogo')}><Text style={s.btnTxt}>Ir al catálogo</Text></Pressable>
            </View>
          ) : (
            <FlatList data={products.filter((p) => favorites.includes(p.id))} keyExtractor={(i) => i.id} renderItem={renderCard} contentContainerStyle={s.pad} />
          )
        ) : tab === 'carrito' ? (
          receipt ? (
            <ScrollView style={s.pad}>
              <View style={[s.card, { flexDirection: 'column', alignItems: 'stretch', borderColor: C.ok, borderWidth: 2 }]}>
                <Text style={{ color: C.primary, fontWeight: '800', fontSize: 11 }}>SIMULACIÓN ACADÉMICA · SIN COBRO REAL</Text>
                <Text style={{ fontSize: 19, fontWeight: '900', color: C.ok, marginVertical: 4 }}>¡Pedido Confirmado!</Text>
                <Text style={s.title}>Código: {receipt.code}</Text>
                <Text style={s.muted}>Cliente: {receipt.buyer.name} · {receipt.buyer.city}</Text>
                <Text style={[s.price, { marginTop: 8 }]}>Total pagado: {cop(receipt.total)}</Text>
                <Pressable style={[s.btn, { marginTop: 12 }]} onPress={() => { setReceipt(null); setTab('historial'); }}>
                  <Text style={s.btnTxt}>Ver en Historial</Text>
                </Pressable>
              </View>
            </ScrollView>
          ) : cartItems.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.title}>Tu carrito está vacío</Text>
              <Text style={s.muted}>Subtotal: $0 · Envío: $0 · Total: $0</Text>
              <Pressable style={s.btn} onPress={() => setTab('catalogo')}><Text style={s.btnTxt}>Explorar catálogo</Text></Pressable>
            </View>
          ) : (
            <ScrollView style={s.pad}>
              {cartItems.map((it) => (
                <View key={it.id} style={s.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.title}>{it.nombre}</Text>
                    <Text style={s.muted}>{cop(it.precio)} c/u</Text>
                    <Text style={s.price}>{cop(it.lineTotal)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable style={s.qtyBtn} onPress={() => changeQty(it.id, -1)}><Text>-</Text></Pressable>
                    <Text style={{ fontWeight: '800' }}>{it.qty}</Text>
                    <Pressable style={s.qtyBtn} onPress={() => changeQty(it.id, 1)}><Text>+</Text></Pressable>
                  </View>
                  <Pressable onPress={() => setCart((p) => p.filter((c) => c.id !== it.id))}>
                    <Text style={{ color: C.danger, fontSize: 12, fontWeight: '700' }}>Eliminar</Text>
                  </Pressable>
                </View>
              ))}
              <View style={[s.card, { flexDirection: 'column', alignItems: 'stretch' }]}>
                <Text style={s.title}>Resumen de compra</Text>
                <Text style={s.muted}>Subtotal: {cop(subtotal)}</Text>
                <Text style={s.muted}>Envío: {shipping === 0 ? 'GRATIS (≥ $150.000)' : cop(shipping)}</Text>
                <Text style={[s.price, { fontSize: 16, marginTop: 4 }]}>Total: {cop(total)}</Text>
                {!checkout ? (
                  <Pressable style={[s.btn, { marginTop: 10 }]} onPress={() => setCheckout(true)}>
                    <Text style={s.btnTxt}>Continuar compra</Text>
                  </Pressable>
                ) : (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    <Text style={{ fontSize: 11, color: C.danger }}>Simulación: No ingreses tarjetas ni datos bancarios.</Text>
                    <TextInput style={s.input} placeholder="Nombre completo *" value={buyer.name} onChangeText={(v) => setBuyer({ ...buyer, name: v })} />
                    <TextInput style={s.input} placeholder="Teléfono *" value={buyer.phone} onChangeText={(v) => setBuyer({ ...buyer, phone: v })} />
                    <TextInput style={s.input} placeholder="Municipio (Mosquera, Madrid, Funza) *" value={buyer.city} onChangeText={(v) => setBuyer({ ...buyer, city: v })} />
                    <TextInput style={s.input} placeholder="Dirección *" value={buyer.address} onChangeText={(v) => setBuyer({ ...buyer, address: v })} />
                    <Pressable style={s.btn} onPress={confirmOrder}><Text style={s.btnTxt}>Confirmar compra</Text></Pressable>
                  </View>
                )}
              </View>
            </ScrollView>
          )
        ) : orderDetail ? (
          <ScrollView style={s.pad}>
            <Pressable onPress={() => setOrderDetail(null)}><Text style={s.link}>← Volver al historial</Text></Pressable>
            <View style={[s.card, { flexDirection: 'column', alignItems: 'stretch', marginTop: 10 }]}>
              <Text style={s.title}>Pedido {orderDetail.code}</Text>
              <Text style={s.muted}>{orderDetail.date} · {orderDetail.buyer.name}</Text>
              <Text style={s.muted}>Entrega: {orderDetail.buyer.address}, {orderDetail.buyer.city}</Text>
              {orderDetail.items.map((x, i) => (
                <Text key={i} style={{ marginTop: 4 }}>{x.qty}x {x.nombre} — {cop(x.lineTotal)}</Text>
              ))}
              <Text style={[s.price, { marginTop: 8 }]}>Envío: {cop(orderDetail.shipping)} | Total: {cop(orderDetail.total)}</Text>
            </View>
          </ScrollView>
        ) : orders.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.title}>No hay pedidos registrados</Text>
            <Pressable style={s.btn} onPress={() => setTab('catalogo')}><Text style={s.btnTxt}>Ir al catálogo</Text></Pressable>
          </View>
        ) : (
          <ScrollView style={s.pad}>
            {orders.map((o) => (
              <Pressable key={o.code} style={s.card} onPress={() => setOrderDetail(o)}>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>Pedido #{o.code}</Text>
                  <Text style={s.muted}>{o.date}</Text>
                  <Text style={s.price}>Total: {cop(o.total)}</Text>
                </View>
                <Text style={s.link}>Detalle →</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E2E8F0', alignItems: 'center' },
  shell: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 450 : '100%', backgroundColor: C.bg },
  header: { backgroundColor: C.primary, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 38, height: 38, borderRadius: 8, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },
  logoTxt: { fontWeight: '900', color: C.text },
  brand: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  slogan: { color: '#CCFBF1', fontSize: 11 },
  nav: { flexDirection: 'row', backgroundColor: C.card, borderBottomWidth: 1, borderColor: C.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabOn: { borderBottomWidth: 3, borderColor: C.primary },
  tabTxt: { fontSize: 11, color: C.muted, fontWeight: '600' },
  tabTxtOn: { color: C.primary, fontWeight: '800' },
  banner: { padding: 8, alignItems: 'center' },
  filters: { backgroundColor: C.card, padding: 10, borderBottomWidth: 1, borderColor: C.border },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: C.bg, marginRight: 6 },
  chipOn: { backgroundColor: C.primary },
  sortBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: C.bg },
  pad: { padding: 12 },
  card: { backgroundColor: C.card, borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  avatar: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontWeight: '800', color: C.dark },
  title: { fontSize: 14, fontWeight: '700', color: C.text },
  price: { fontSize: 14, fontWeight: '800', color: C.primary },
  muted: { fontSize: 11, color: C.muted },
  btnSm: { backgroundColor: C.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btn: { backgroundColor: C.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  btnTxt: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  disabled: { backgroundColor: '#94A3B8' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  link: { color: C.primary, fontWeight: '700', fontSize: 13 },
  hero: { height: 90, backgroundColor: '#CCFBF1', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  heroTxt: { fontSize: 28, fontWeight: '900', color: C.dark },
  qtyBtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
});