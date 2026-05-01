import { useState, useEffect, useRef } from "react";

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

const CATEGORY_COLORS = {
  "Entrées": "#8B6F4E",
  "Plats": "#5C3D2E",
  "Desserts": "#A0522D",
  "Boissons": "#6B4C3B",
};

export default function RestaurantMenu() {
  const [activeTab, setActiveTab] = useState("Entrées");
  const [cart, setCart] = useState({});
  const [view, setView] = useState("menu");
  const [orderSent, setOrderSent] = useState(false);
  const [tableNum, setTableNum] = useState("5");
  const [qrUrl, setQrUrl] = useState("");
  const qrRef = useRef(null);

  const totalItems = Object.values(cart).reduce((s, v) => s + v, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = Object.values(MENU).flat().find(i => i.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const addItem = (item) => {
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };
  const removeItem = (item) => {
    setCart(prev => {
      const n = (prev[item.id] || 0) - 1;
      if (n <= 0) { const { [item.id]: _, ...rest } = prev; return rest; }
      return { ...prev, [item.id]: n };
    });
  };

  const allItems = Object.values(MENU).flat();
  const cartItems = Object.entries(cart).map(([id, qty]) => ({
    item: allItems.find(i => i.id === Number(id)),
    qty,
  })).filter(x => x.item);

  const handleOrder = () => {
    setOrderSent(true);
    setTimeout(() => { setOrderSent(false); setCart({}); setView("menu"); }, 3500);
  };

  useEffect(() => {
    const menuUrl = encodeURIComponent(`https://restaurant-demo.fr/menu?table=${tableNum}`);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${menuUrl}&bgcolor=FFF8F0&color=5C3D2E`);
  }, [tableNum]);

  const styles = {
    app: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "linear-gradient(135deg, #FFF8F0 0%, #FDF3E7 100%)",
      minHeight: "100vh",
      color: "#2C1810",
    },
    header: {
      background: "linear-gradient(180deg, #3D1F0D 0%, #5C3D2E 100%)",
      padding: "1.5rem 1rem 1rem",
      textAlign: "center",
      position: "relative",
    },
    logo: {
      fontSize: "11px",
      color: "#D4A96A",
      letterSpacing: "4px",
      textTransform: "uppercase",
      marginBottom: "4px",
      fontFamily: "Georgia, serif",
    },
    title: {
      fontSize: "28px",
      color: "#FFF8F0",
      margin: "0 0 4px",
      fontWeight: "normal",
      fontStyle: "italic",
    },
    subtitle: {
      fontSize: "12px",
      color: "#C4946A",
      letterSpacing: "2px",
    },
    cartBadge: {
      position: "absolute",
      top: "1rem",
      right: "1rem",
      background: "#D4A96A",
      color: "#3D1F0D",
      borderRadius: "50px",
      padding: "6px 14px",
      fontSize: "13px",
      fontFamily: "Georgia, serif",
      cursor: "pointer",
      fontWeight: "bold",
      border: "none",
      transition: "transform 0.15s",
    },
    qrBtn: {
      position: "absolute",
      top: "1rem",
      left: "1rem",
      background: "transparent",
      color: "#D4A96A",
      border: "1px solid #D4A96A",
      borderRadius: "8px",
      padding: "6px 12px",
      fontSize: "12px",
      cursor: "pointer",
      fontFamily: "Georgia, serif",
    },
    tabs: {
      display: "flex",
      background: "#3D1F0D",
      borderBottom: "2px solid #D4A96A",
      overflowX: "auto",
    },
    tab: (active, cat) => ({
      padding: "10px 20px",
      border: "none",
      background: active ? "#D4A96A" : "transparent",
      color: active ? "#3D1F0D" : "#C4946A",
      cursor: "pointer",
      fontSize: "13px",
      fontFamily: "Georgia, serif",
      letterSpacing: "1px",
      whiteSpace: "nowrap",
      fontWeight: active ? "bold" : "normal",
      transition: "all 0.2s",
      flexShrink: 0,
    }),
    menuGrid: {
      padding: "1.5rem 1rem",
      display: "grid",
      gap: "12px",
    },
    card: {
      background: "#FFFAF4",
      borderRadius: "12px",
      padding: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      border: "1px solid #E8D5B7",
      boxShadow: "0 2px 8px rgba(92,61,46,0.06)",
    },
    cardEmoji: {
      fontSize: "28px",
      width: "44px",
      textAlign: "center",
      flexShrink: 0,
    },
    cardBody: { flex: 1, minWidth: 0 },
    cardName: { fontSize: "15px", fontWeight: "bold", color: "#2C1810", margin: "0 0 2px" },
    cardDesc: { fontSize: "12px", color: "#8B6F4E", margin: 0, fontStyle: "italic" },
    cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 },
    price: { fontSize: "16px", fontWeight: "bold", color: "#5C3D2E" },
    qtyControl: { display: "flex", alignItems: "center", gap: "8px" },
    qtyBtn: {
      width: "28px", height: "28px", borderRadius: "50%",
      border: "1.5px solid #D4A96A", background: "transparent",
      color: "#5C3D2E", fontSize: "16px", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "bold", lineHeight: 1,
    },
    qtyNum: { fontSize: "14px", fontWeight: "bold", minWidth: "16px", textAlign: "center", color: "#2C1810" },
    addBtn: {
      background: "#D4A96A", color: "#3D1F0D", border: "none",
      borderRadius: "20px", padding: "6px 14px", fontSize: "12px",
      cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: "bold",
    },
    // Cart
    cartView: { padding: "1.5rem 1rem" },
    cartTitle: { fontSize: "20px", color: "#3D1F0D", margin: "0 0 1rem", fontStyle: "italic" },
    cartItem: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: "1px dashed #E8D5B7",
    },
    cartItemName: { fontSize: "14px", color: "#2C1810" },
    cartItemQty: { fontSize: "12px", color: "#8B6F4E", marginTop: "2px" },
    cartItemPrice: { fontSize: "15px", fontWeight: "bold", color: "#5C3D2E" },
    totalBar: {
      background: "#3D1F0D", borderRadius: "12px", padding: "1rem 1.25rem",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginTop: "1.25rem",
    },
    totalLabel: { color: "#D4A96A", fontSize: "14px", letterSpacing: "1px" },
    totalAmt: { color: "#FFF8F0", fontSize: "22px", fontWeight: "bold" },
    orderBtn: {
      width: "100%", background: "linear-gradient(135deg, #D4A96A, #BF8E52)",
      color: "#3D1F0D", border: "none", borderRadius: "10px", padding: "14px",
      fontSize: "16px", fontFamily: "Georgia, serif", fontWeight: "bold",
      cursor: "pointer", marginTop: "1rem", letterSpacing: "1px",
    },
    tableRow: {
      display: "flex", alignItems: "center", gap: "10px",
      marginTop: "1rem",
    },
    tableLabel: { fontSize: "13px", color: "#8B6F4E", fontStyle: "italic" },
    tableInput: {
      width: "60px", padding: "6px 8px", border: "1px solid #D4A96A",
      borderRadius: "8px", fontSize: "14px", textAlign: "center",
      background: "#FFF8F0", color: "#2C1810", fontFamily: "Georgia, serif",
    },
    // QR view
    qrView: { padding: "1.5rem 1rem", textAlign: "center" },
    qrCard: {
      background: "#FFFAF4", border: "2px solid #D4A96A", borderRadius: "16px",
      padding: "2rem", display: "inline-block", margin: "0 auto",
    },
    qrTitle: { fontSize: "18px", color: "#3D1F0D", marginBottom: "0.5rem", fontStyle: "italic" },
    qrSub: { fontSize: "12px", color: "#8B6F4E", marginBottom: "1.25rem", letterSpacing: "1px" },
    qrTableRow: {
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "10px", margin: "1rem 0",
    },
    success: {
      position: "fixed", top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      background: "#3D1F0D", color: "#D4A96A",
      borderRadius: "16px", padding: "2rem 2.5rem",
      textAlign: "center", zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    },
  };

  if (orderSent) return (
    <div style={styles.app}>
      <div style={styles.success}>
        <div style={{ fontSize: "48px", marginBottom: "0.5rem" }}>✓</div>
        <div style={{ fontSize: "20px", fontStyle: "italic", marginBottom: "8px" }}>Commande envoyée !</div>
        <div style={{ fontSize: "13px", color: "#C4946A" }}>La cuisine a été notifiée — merci !</div>
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.qrBtn} onClick={() => setView(view === "qr" ? "menu" : "qr")}>
          📱 QR Code
        </button>
        <div style={styles.logo}>✦ Brasserie ✦</div>
        <h1 style={styles.title}>Le Petit Bistrot</h1>
        <div style={styles.subtitle}>Cuisine française traditionnelle</div>
        {totalItems > 0 && (
          <button style={styles.cartBadge} onClick={() => setView(view === "cart" ? "menu" : "cart")}>
            🛒 {totalItems} · {totalPrice.toFixed(2)}€
          </button>
        )}
      </div>

      {/* QR Code View */}
      {view === "qr" && (
        <div style={styles.qrView}>
          <div style={styles.qrCard}>
            <div style={styles.qrTitle}>QR Code Menu</div>
            <div style={styles.qrSub}>SCANNEZ POUR COMMANDER</div>
            {qrUrl && <img src={qrUrl} alt="QR Code menu" width={200} height={200} style={{ borderRadius: "8px", border: "4px solid #FFF8F0" }} />}
            <div style={styles.qrTableRow}>
              <span style={styles.tableLabel}>Table n°</span>
              <input
                type="number" min="1" max="99"
                value={tableNum}
                onChange={e => setTableNum(e.target.value)}
                style={styles.tableInput}
              />
            </div>
            <div style={{ fontSize: "11px", color: "#A08060", marginTop: "0.5rem", letterSpacing: "0.5px" }}>
              restaurant-demo.fr/menu?table={tableNum}
            </div>
            <button style={{ ...styles.orderBtn, marginTop: "1.25rem", fontSize: "13px" }} onClick={() => setView("menu")}>
              ← Retour au menu
            </button>
          </div>
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#FFFAF4", borderRadius: "12px", border: "1px solid #E8D5B7", textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "#5C3D2E", fontWeight: "bold", marginBottom: "8px" }}>💡 Comment ça marche</div>
            <div style={{ fontSize: "12px", color: "#8B6F4E", lineHeight: "1.7" }}>
              1. Imprimez ce QR code et posez-le sur la table<br />
              2. Le client scanne avec son téléphone<br />
              3. Il consulte le menu et passe commande<br />
              4. La commande arrive directement en cuisine
            </div>
          </div>
        </div>
      )}

      {/* Cart View */}
      {view === "cart" && (
        <div style={styles.cartView}>
          <div style={styles.cartTitle}>🛒 Ma commande</div>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", color: "#8B6F4E", padding: "2rem", fontStyle: "italic" }}>
              Votre panier est vide
            </div>
          ) : (
            <>
              {cartItems.map(({ item, qty }) => (
                <div key={item.id} style={styles.cartItem}>
                  <div>
                    <div style={styles.cartItemName}>{item.emoji} {item.name}</div>
                    <div style={styles.cartItemQty}>× {qty}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.cartItemPrice}>{(item.price * qty).toFixed(2)} €</div>
                    <div style={styles.qtyControl}>
                      <button style={styles.qtyBtn} onClick={() => removeItem(item)}>−</button>
                      <span style={styles.qtyNum}>{qty}</span>
                      <button style={styles.qtyBtn} onClick={() => addItem(item)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
              <div style={styles.totalBar}>
                <span style={styles.totalLabel}>TOTAL</span>
                <span style={styles.totalAmt}>{totalPrice.toFixed(2)} €</span>
              </div>
              <div style={styles.tableRow}>
                <span style={styles.tableLabel}>Table n°</span>
                <input
                  type="number" min="1" max="99"
                  value={tableNum}
                  onChange={e => setTableNum(e.target.value)}
                  style={styles.tableInput}
                />
              </div>
              <button style={styles.orderBtn} onClick={handleOrder}>
                Envoyer la commande en cuisine ✓
              </button>
              <button onClick={() => setView("menu")} style={{ width: "100%", background: "transparent", border: "none", color: "#8B6F4E", cursor: "pointer", padding: "10px", fontSize: "13px", fontStyle: "italic" }}>
                ← Continuer à commander
              </button>
            </>
          )}
        </div>
      )}

      {/* Menu View */}
      {view === "menu" && (
        <>
          <div style={styles.tabs}>
            {Object.keys(MENU).map(cat => (
              <button key={cat} style={styles.tab(activeTab === cat, cat)} onClick={() => setActiveTab(cat)}>
                {cat}
              </button>
            ))}
          </div>
          <div style={styles.menuGrid}>
            {MENU[activeTab].map(item => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardEmoji}>{item.emoji}</div>
                <div style={styles.cardBody}>
                  <p style={styles.cardName}>{item.name}</p>
                  <p style={styles.cardDesc}>{item.desc}</p>
                </div>
                <div style={styles.cardRight}>
                  <span style={styles.price}>{item.price.toFixed(2)} €</span>
                  {cart[item.id] ? (
                    <div style={styles.qtyControl}>
                      <button style={styles.qtyBtn} onClick={() => removeItem(item)}>−</button>
                      <span style={styles.qtyNum}>{cart[item.id]}</span>
                      <button style={styles.qtyBtn} onClick={() => addItem(item)}>+</button>
                    </div>
                  ) : (
                    <button style={styles.addBtn} onClick={() => addItem(item)}>Ajouter</button>
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
