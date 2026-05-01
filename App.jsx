import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtdKwSUKLfYnIIWwlRmChQELC7HVYKWbc",
  authDomain: "restaurant-menu-9849c.firebaseapp.com",
  projectId: "restaurant-menu-9849c",
  storageBucket: "restaurant-menu-9849c.firebasestorage.app",
  messagingSenderId: "193803419035",
  appId: "1:193803419035:web:592eb78d245451f18bb53e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MENU = {
  "Entrées": [
    { id: 1, name: "Soupe à l'oignon", desc: "Gratinée, croûtons, comté", price: 9.50, emoji: "🧅" },
    { id: 2, name: "Tartare de saumon", desc: "Avocat, citron vert, sésame", price: 13.00, emoji: "🐟" },
    { id: 3, name: "Salade César", desc: "Poulet grillé, parmesan, anchois", price: 11.50, emoji: "🥗" },
    { id: 4, name: "Foie gras maison", desc: "Toast brioché, confiture figue", price: 16.00, emoji: "🍞" },
  ],
  "Plats": [
    { id: 5, name: "Magret de canard", desc: "Sauce aux cerises, purée truffe", price: 24.00, emoji: "🦆" },
    { id: 6, name: "Entrecôte (250g)", desc: "Beurre maître d'hôtel, frites", price: 28.00, emoji: "🥩" },
    { id: 7, name: "Filet de bar", desc: "Risotto citronné, légumes de saison", price: 22.00, emoji: "🐠" },
    { id: 8, name: "Gnocchi végétariens", desc: "Pesto basilic, tomates confites", price: 17.50, emoji: "🌿" },
    { id: 9, name: "Côte d'agneau", desc: "Gratin dauphinois, jus thym", price: 26.00, emoji: "🍖" },
  ],
  "Desserts": [
    { id: 10, name: "Crème brûlée", desc: "Vanille bourbon, caramel croustillant", price: 8.50, emoji: "🍮" },
    { id: 11, name: "Tarte Tatin", desc: "Pommes caramélisées, crème fraîche", price: 9.00, emoji: "🍎" },
    { id: 12, name: "Fondant chocolat", desc: "Cœur coulant, glace vanille", price: 9.50, emoji: "🍫" },
    { id: 13, name: "Île flottante", desc: "Pralin, caramel, amandes grillées", price: 7.50, emoji: "☁️" },
  ],
  "Boissons": [
    { id: 14, name: "Vin rouge (verre)", desc: "Bordeaux AOC", price: 7.00, emoji: "🍷" },
    { id: 15, name: "Vin blanc (verre)", desc: "Sancerre Loire", price: 7.50, emoji: "🥂" },
    { id: 16, name: "Eau minérale (50cl)", desc: "Evian ou Perrier", price: 4.00, emoji: "💧" },
    { id: 17, name: "Café / Espresso", desc: "Blend maison torréfié", price: 2.80, emoji: "☕" },
    { id: 18, name: "Cocktail maison", desc: "Kir royal, mojito ou spritz", price: 10.00, emoji: "🍹" },
  ],
};

// ─── ÉCRAN CUISINE ───────────────────────────────────────────────────────────
function KitchenScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "commandes"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const markDone = async (id) => {
    await updateDoc(doc(db, "commandes", id), { status: "done" });
  };

  const exportCSV = () => {
    const rows = [["Date", "Heure", "Table", "Plat", "Quantité", "Prix unitaire", "Sous-total", "Total commande", "Statut"]];
    orders.forEach(order => {
      const date = order.createdAt?.toDate();
      const dateStr = date ? date.toLocaleDateString("fr-FR") : "";
      const timeStr = date ? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
      order.items?.forEach((item, i) => {
        rows.push([
          dateStr,
          timeStr,
          `Table ${order.table}`,
          item.name,
          item.qty,
          item.price?.toFixed(2),
          (item.price * item.qty).toFixed(2),
          i === 0 ? order.total?.toFixed(2) : "",
          order.status === "done" ? "Servie" : "En attente",
        ]);
      });
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pending = orders.filter(o => o.status !== "done");
  const done = orders.filter(o => o.status === "done");

  const s = {
    page: { fontFamily: "Georgia, serif", background: "#1A0F0A", minHeight: "100vh", padding: "1.5rem 1rem", color: "#FFF8F0" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
    title: { fontSize: "22px", color: "#D4A96A", fontStyle: "italic", margin: 0 },
    badge: { background: "#D4A96A", color: "#1A0F0A", borderRadius: "20px", padding: "4px 14px", fontSize: "13px", fontWeight: "bold" },
    grid: { display: "grid", gap: "12px" },
    card: (done) => ({
      background: done ? "#0F2A1A" : "#2C1810",
      border: `1px solid ${done ? "#1D6B3A" : "#D4A96A"}`,
      borderRadius: "12px", padding: "1rem",
      opacity: done ? 0.6 : 1,
    }),
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
    table: { fontSize: "18px", fontWeight: "bold", color: "#D4A96A" },
    time: { fontSize: "11px", color: "#8B6F4E" },
    items: { fontSize: "13px", color: "#C4946A", lineHeight: "1.8", margin: "8px 0" },
    total: { fontSize: "15px", fontWeight: "bold", color: "#FFF8F0", margin: "8px 0 10px" },
    btn: { background: "#1D6B3A", color: "#FFF8F0", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif", width: "100%" },
    doneTag: { background: "#1D6B3A", color: "#5DCAA5", borderRadius: "6px", padding: "4px 10px", fontSize: "12px" },
    sectionTitle: { fontSize: "12px", color: "#8B6F4E", letterSpacing: "2px", margin: "1.5rem 0 0.5rem", textTransform: "uppercase" },
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>🍳 Écran Cuisine</h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {pending.length > 0 && <span style={s.badge}>{pending.length} en attente</span>}
          <button onClick={exportCSV} style={{ background: "#1D4A2A", color: "#5DCAA5", border: "1px solid #1D6B3A", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {pending.length === 0 && (
        <div style={{ textAlign: "center", color: "#8B6F4E", padding: "3rem", fontStyle: "italic" }}>
          Aucune commande en attente ✓
        </div>
      )}

      <div style={s.grid}>
        {pending.map(order => (
          <div key={order.id} style={s.card(false)}>
            <div style={s.cardHeader}>
              <span style={s.table}>Table {order.table}</span>
              <span style={s.time}>{formatTime(order.createdAt)}</span>
            </div>
            <div style={s.items}>
              {order.items?.map((item, i) => (
                <div key={i}>× {item.qty} &nbsp; {item.emoji} {item.name}</div>
              ))}
            </div>
            <div style={s.total}>Total : {order.total?.toFixed(2)} €</div>
            <button style={s.btn} onClick={() => markDone(order.id)}>
              ✓ Commande prête
            </button>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <>
          <div style={s.sectionTitle}>Servies aujourd'hui</div>
          <div style={s.grid}>
            {done.slice(0, 5).map(order => (
              <div key={order.id} style={s.card(true)}>
                <div style={s.cardHeader}>
                  <span style={{ ...s.table, fontSize: "15px" }}>Table {order.table}</span>
                  <span style={s.doneTag}>✓ Servie</span>
                </div>
                <div style={{ ...s.items, fontSize: "12px" }}>
                  {order.items?.map((item, i) => <span key={i}>{item.emoji} {item.name} &nbsp;</span>)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function App() {
  const isKitchen = window.location.hash === "#cuisine";
  if (isKitchen) return <KitchenScreen />;
  return <MenuApp />;
}

// ─── MENU CLIENT ─────────────────────────────────────────────────────────────
function MenuApp() {
  const [activeTab, setActiveTab] = useState("Entrées");
  const [cart, setCart] = useState({});
  const [view, setView] = useState("menu");
  const [orderSent, setOrderSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [tableNum, setTableNum] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("table") || "1";
  });

  const totalItems = Object.values(cart).reduce((s, v) => s + v, 0);
  const allItems = Object.values(MENU).flat();
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = allItems.find(i => i.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const addItem = (item) => setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  const removeItem = (item) => setCart(prev => {
    const n = (prev[item.id] || 0) - 1;
    if (n <= 0) { const { [item.id]: _, ...rest } = prev; return rest; }
    return { ...prev, [item.id]: n };
  });

  const cartItems = Object.entries(cart).map(([id, qty]) => ({
    item: allItems.find(i => i.id === Number(id)), qty,
  })).filter(x => x.item);

  const handleOrder = async () => {
    setSending(true);
    try {
      await addDoc(collection(db, "commandes"), {
        table: tableNum,
        items: cartItems.map(({ item, qty }) => ({
          id: item.id, name: item.name, emoji: item.emoji, qty, price: item.price,
        })),
        total: totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setOrderSent(true);
      setCart({});
      setTimeout(() => { setOrderSent(false); setView("menu"); }, 3500);
    } catch (e) {
      alert("Erreur envoi commande. Réessayez.");
    }
    setSending(false);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://restaurant-menu-beryl-two.vercel.app?table=${tableNum}`)}&bgcolor=FFF8F0&color=5C3D2E`;

  const st = {
    app: { fontFamily: "Georgia, serif", background: "linear-gradient(135deg,#FFF8F0,#FDF3E7)", minHeight: "100vh", color: "#2C1810" },
    header: { background: "linear-gradient(180deg,#3D1F0D,#5C3D2E)", padding: "1.5rem 1rem 1rem", textAlign: "center", position: "relative" },
    logo: { fontSize: "11px", color: "#D4A96A", letterSpacing: "4px", marginBottom: "4px" },
    title: { fontSize: "28px", color: "#FFF8F0", margin: "0 0 4px", fontWeight: "normal", fontStyle: "italic" },
    subtitle: { fontSize: "12px", color: "#C4946A", letterSpacing: "2px" },
    cartBadge: { position: "absolute", top: "1rem", right: "1rem", background: "#D4A96A", color: "#3D1F0D", borderRadius: "50px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", fontWeight: "bold", border: "none" },
    qrBtn: { position: "absolute", top: "1rem", left: "1rem", background: "transparent", color: "#D4A96A", border: "1px solid #D4A96A", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", cursor: "pointer", fontFamily: "Georgia, serif" },
    tabs: { display: "flex", background: "#3D1F0D", borderBottom: "2px solid #D4A96A", overflowX: "auto" },
    tab: (active) => ({ padding: "10px 20px", border: "none", background: active ? "#D4A96A" : "transparent", color: active ? "#3D1F0D" : "#C4946A", cursor: "pointer", fontSize: "13px", fontFamily: "Georgia, serif", letterSpacing: "1px", whiteSpace: "nowrap", fontWeight: active ? "bold" : "normal", flexShrink: 0 }),
    menuGrid: { padding: "1.5rem 1rem", display: "grid", gap: "12px" },
    card: { background: "#FFFAF4", borderRadius: "12px", padding: "1rem", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #E8D5B7" },
    cardEmoji: { fontSize: "28px", width: "44px", textAlign: "center", flexShrink: 0 },
    cardBody: { flex: 1, minWidth: 0 },
    cardName: { fontSize: "15px", fontWeight: "bold", color: "#2C1810", margin: "0 0 2px" },
    cardDesc: { fontSize: "12px", color: "#8B6F4E", margin: 0, fontStyle: "italic" },
    cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 },
    price: { fontSize: "16px", fontWeight: "bold", color: "#5C3D2E" },
    qtyControl: { display: "flex", alignItems: "center", gap: "8px" },
    qtyBtn: { width: "28px", height: "28px", borderRadius: "50%", border: "1.5px solid #D4A96A", background: "transparent", color: "#5C3D2E", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
    qtyNum: { fontSize: "14px", fontWeight: "bold", minWidth: "16px", textAlign: "center" },
    addBtn: { background: "#D4A96A", color: "#3D1F0D", border: "none", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: "bold" },
    orderBtn: (disabled) => ({ width: "100%", background: disabled ? "#C4946A" : "linear-gradient(135deg,#D4A96A,#BF8E52)", color: "#3D1F0D", border: "none", borderRadius: "10px", padding: "14px", fontSize: "16px", fontFamily: "Georgia, serif", fontWeight: "bold", cursor: disabled ? "not-allowed" : "pointer", marginTop: "1rem" }),
    success: { textAlign: "center", padding: "3rem 1rem" },
  };

  if (orderSent) return (
    <div style={st.app}>
      <div style={st.success}>
        <div style={{ fontSize: "60px", marginBottom: "1rem" }}>✓</div>
        <div style={{ fontSize: "22px", fontStyle: "italic", color: "#3D1F0D", marginBottom: "8px" }}>Commande envoyée !</div>
        <div style={{ fontSize: "14px", color: "#8B6F4E" }}>La cuisine a été notifiée — merci !</div>
      </div>
    </div>
  );

  return (
    <div style={st.app}>
      <div style={st.header}>
        <button style={st.qrBtn} onClick={() => setView(view === "qr" ? "menu" : "qr")}>📱 QR</button>
        <div style={st.logo}>✦ Brasserie ✦</div>
        <h1 style={st.title}>Le Petit Bistrot</h1>
        <div style={st.subtitle}>Cuisine française traditionnelle</div>
        {totalItems > 0 && (
          <button style={st.cartBadge} onClick={() => setView(view === "cart" ? "menu" : "cart")}>
            🛒 {totalItems} · {totalPrice.toFixed(2)}€
          </button>
        )}
      </div>

      {view === "qr" && (
        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <div style={{ background: "#FFFAF4", border: "2px solid #D4A96A", borderRadius: "16px", padding: "2rem", display: "inline-block" }}>
            <div style={{ fontSize: "18px", fontStyle: "italic", color: "#3D1F0D", marginBottom: "8px" }}>QR Code — Table</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "0.75rem 0 1rem" }}>
              <span style={{ fontSize: "13px", color: "#8B6F4E" }}>n°</span>
              <input type="number" min="1" max="99" value={tableNum} onChange={e => setTableNum(e.target.value)}
                style={{ width: "60px", padding: "6px 8px", border: "1px solid #D4A96A", borderRadius: "8px", fontSize: "14px", textAlign: "center", background: "#FFF8F0", fontFamily: "Georgia, serif" }} />
            </div>
            <img src={qrUrl} alt="QR Code" width={200} height={200} style={{ borderRadius: "8px" }} />
            <div style={{ fontSize: "11px", color: "#A08060", marginTop: "0.5rem" }}>restaurant-menu-beryl-two.vercel.app?table={tableNum}</div>
          </div>
          <div style={{ marginTop: "1rem", padding: "1rem", background: "#FFFAF4", borderRadius: "12px", border: "1px solid #E8D5B7", textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "#5C3D2E", fontWeight: "bold", marginBottom: "6px" }}>🍳 Accès écran cuisine</div>
            <a href="#cuisine" onClick={() => window.location.hash = "cuisine"} style={{ fontSize: "13px", color: "#D4A96A" }}>
              Ouvrez votre-site.vercel.app#cuisine sur la tablette en cuisine
            </a>
          </div>
          <button onClick={() => setView("menu")} style={{ marginTop: "1rem", background: "transparent", border: "none", color: "#8B6F4E", cursor: "pointer", fontStyle: "italic", fontSize: "13px" }}>← Retour</button>
        </div>
      )}

      {view === "cart" && (
        <div style={{ padding: "1.5rem 1rem" }}>
          <div style={{ fontSize: "20px", color: "#3D1F0D", margin: "0 0 1rem", fontStyle: "italic" }}>🛒 Ma commande</div>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", color: "#8B6F4E", padding: "2rem", fontStyle: "italic" }}>Panier vide</div>
          ) : (
            <>
              {cartItems.map(({ item, qty }) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed #E8D5B7" }}>
                  <div>
                    <div style={{ fontSize: "14px" }}>{item.emoji} {item.name}</div>
                    <div style={{ fontSize: "12px", color: "#8B6F4E" }}>× {qty}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "15px", fontWeight: "bold", color: "#5C3D2E" }}>{(item.price * qty).toFixed(2)} €</div>
                    <div style={st.qtyControl}>
                      <button style={st.qtyBtn} onClick={() => removeItem(item)}>−</button>
                      <span style={st.qtyNum}>{qty}</span>
                      <button style={st.qtyBtn} onClick={() => addItem(item)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ background: "#3D1F0D", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", marginTop: "1.25rem" }}>
                <span style={{ color: "#D4A96A", fontSize: "14px" }}>TOTAL</span>
                <span style={{ color: "#FFF8F0", fontSize: "22px", fontWeight: "bold" }}>{totalPrice.toFixed(2)} €</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "1rem" }}>
                <span style={{ fontSize: "13px", color: "#8B6F4E", fontStyle: "italic" }}>Table n°</span>
                <input type="number" min="1" max="99" value={tableNum} onChange={e => setTableNum(e.target.value)}
                  style={{ width: "60px", padding: "6px 8px", border: "1px solid #D4A96A", borderRadius: "8px", fontSize: "14px", textAlign: "center", background: "#FFF8F0", fontFamily: "Georgia, serif" }} />
              </div>
              <button style={st.orderBtn(sending)} onClick={handleOrder} disabled={sending}>
                {sending ? "Envoi en cours..." : "Envoyer la commande en cuisine ✓"}
              </button>
              <button onClick={() => setView("menu")} style={{ width: "100%", background: "transparent", border: "none", color: "#8B6F4E", cursor: "pointer", padding: "10px", fontSize: "13px", fontStyle: "italic" }}>
                ← Continuer à commander
              </button>
            </>
          )}
        </div>
      )}

      {view === "menu" && (
        <>
          <div style={st.tabs}>
            {Object.keys(MENU).map(cat => (
              <button key={cat} style={st.tab(activeTab === cat)} onClick={() => setActiveTab(cat)}>{cat}</button>
            ))}
          </div>
          <div style={st.menuGrid}>
            {MENU[activeTab].map(item => (
              <div key={item.id} style={st.card}>
                <div style={st.cardEmoji}>{item.emoji}</div>
                <div style={st.cardBody}>
                  <p style={st.cardName}>{item.name}</p>
                  <p style={st.cardDesc}>{item.desc}</p>
                </div>
                <div style={st.cardRight}>
                  <span style={st.price}>{item.price.toFixed(2)} €</span>
                  {cart[item.id] ? (
                    <div style={st.qtyControl}>
                      <button style={st.qtyBtn} onClick={() => removeItem(item)}>−</button>
                      <span style={st.qtyNum}>{cart[item.id]}</span>
                      <button style={st.qtyBtn} onClick={() => addItem(item)}>+</button>
                    </div>
                  ) : (
                    <button style={st.addBtn} onClick={() => addItem(item)}>Ajouter</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
