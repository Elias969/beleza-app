import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

/* ================= Tipos ================= */
export type Screen = "login" | "signup" | "home" | "detail" | "verifier" | "discover" | "community" | "profile";
type Cat = "Perfumes" | "Skincare" | "Cabelos" | "Maquiagem" | "Corpo";
export interface Product {
  id: string; name: string; price: number; oldPrice?: number; image: string; link: string;
  brand: string; category: Cat; description: string; rating: number; reviews: number;
}
interface Post { id: number; author: string; tag: "Alerta" | "Dica" | "Pergunta"; time: string; text: string; likes: number; liked: boolean; comments: string[] }
interface User { name: string; email: string }
interface BannerSlide { label: string; title: string; text: string; image: string }

/* ================= Dados =================
 * IMAGENS: troque o campo `image` pela foto oficial do produto
 *   (abra a página do produto > botão direito na foto > "Copiar endereço da imagem").
 * LINKS: `link` deve ser a URL da página do produto na loja oficial.
 */
const BUY = (q: string) => `https://www.boticario.com.br/search/?q=${encodeURIComponent(q)}`;
const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const off = (p: Product) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

const PRODUCTS: Product[] = [
  { id: "p1", name: "Lily Eau de Parfum 75ml", price: 294.9, oldPrice: 329.9, image: U("photo-1594035910387-fea47794261f"), link: "https://www.boticario.com.br/lily-eau-de-parfum-75ml/", brand: "O Boticário", category: "Perfumes", rating: 4.9, reviews: 2184, description: "Fragrância feminina romântica com a assinatura floral dos lírios. Alta fixação e muita sofisticação." },
  { id: "p2", name: "Sérum Botik Ácido Hialurônico 30ml", price: 138.9, oldPrice: 204.9, image: U("photo-1620916566398-39f1143ab7be"), link: "https://www.boticario.com.br/botik-serum-preenchedor-de-rugas-acido-hialuronico-30ml-v2/", brand: "O Boticário", category: "Skincare", rating: 4.8, reviews: 960, description: "Sérum de alta potência que ajuda a minimizar rugas e linhas de expressão, com ácido hialurônico." },
  { id: "p3", name: "Her Code Touch EDP 50ml", price: 254.9, image: U("photo-1592945403244-b3fbafd7f539"), link: "https://www.boticario.com.br/her-code-touch-eau-de-parfum-50ml/", brand: "O Boticário", category: "Perfumes", rating: 4.7, reviews: 540, description: "Fragrância amadeirada com baunilha absoluta, ylang ylang e sândalo." },
  { id: "t1", name: "Malbec Desodorante Colônia 100ml", price: 219.9, image: U("photo-1585386959984-a4155224a1ad"), link: "https://www.boticario.com.br/malbec-desodorante-colonia-100ml-v2/", brand: "O Boticário", category: "Perfumes", rating: 4.8, reviews: 5310, description: "Ícone masculino amadeirado, com álcool vínico envelhecido em barris de carvalho francês." },
  { id: "t2", name: "Floratta Blue Colônia 75ml", price: 174.9, image: U("photo-1595425970377-c9703c518815"), link: "https://www.boticario.com.br/floratta-blue-desodorante-colonia-75ml/", brand: "O Boticário", category: "Perfumes", rating: 4.6, reviews: 1207, description: "Aroma leve e confortável para quem vive com alegria. Um clássico." },
  { id: "t3", name: "Glamour Midnight Colônia 75ml", price: 199.9, image: U("photo-1615634260167-c8cd6f17c153"), link: "https://www.boticario.com.br/glamour-midnight-desodorante-colonia-75ml/", brand: "O Boticário", category: "Perfumes", rating: 4.7, reviews: 733, description: "Oriental gourmand inspirada no mistério da noite, com notas intensas e envolventes." },
  { id: "c1", name: "Shampoo Match Hidratação", price: 32.9, oldPrice: 39.9, image: U("photo-1535585209827-a15fcdbc4c2d"), link: BUY("Shampoo Match"), brand: "O Boticário", category: "Cabelos", rating: 4.5, reviews: 412, description: "Limpeza suave com hidratação para fios mais macios e brilhantes." },
  { id: "c2", name: "Máscara Capilar Pasta de Abacate", price: 44.9, image: U("photo-1556228720-195a672e8a03"), link: BUY("Máscara Capilar Abacate"), brand: "O Boticário", category: "Cabelos", rating: 4.6, reviews: 288, description: "Tratamento nutritivo para cabelos ressecados." },
  { id: "m1", name: "Batom Make B. Matte", price: 59.9, oldPrice: 74.9, image: U("photo-1586495777744-4413f21062fa"), link: BUY("Batom Make B"), brand: "O Boticário", category: "Maquiagem", rating: 4.7, reviews: 1630, description: "Acabamento matte confortável com cor intensa e longa duração." },
  { id: "m2", name: "Base Líquida Make B. Efeito Matte", price: 79.9, image: U("photo-1631214524020-7e18db9a8f92"), link: BUY("Base Make B"), brand: "O Boticário", category: "Maquiagem", rating: 4.4, reviews: 877, description: "Cobertura média a alta com toque seco e controle de oleosidade." },
  { id: "b1", name: "Loção Hidratante Cuide-se Bem 200ml", price: 55.9, image: U("photo-1608248543803-ba4f8c70ae0b"), link: BUY("Loção Hidratante Cuide-se Bem"), brand: "O Boticário", category: "Corpo", rating: 4.8, reviews: 2290, description: "Hidratação por 24h com perfume suave e toque macio." },
  { id: "b2", name: "Sabonete Líquido Nativa SPA", price: 28.9, image: U("photo-1600857062241-98e5dba7f214"), link: BUY("Sabonete Nativa SPA"), brand: "O Boticário", category: "Corpo", rating: 4.5, reviews: 356, description: "Limpeza delicada com aroma envolvente para o banho." },
];
const CATS: ("Todos" | Cat)[] = ["Todos", "Perfumes", "Skincare", "Cabelos", "Maquiagem", "Corpo"];
const CAT_EMOJI: Record<string, string> = { Todos: "✨", Perfumes: "🌸", Skincare: "💧", Cabelos: "💇", Maquiagem: "💄", Corpo: "🧴" };

const OFFICIAL = ["boticario.com.br", "oboticario.com.br", "eudora.com.br", "quemdisse.com.br", "natura.com.br", "avon.com.br", "belezanaweb.com.br", "sephora.com.br"];
const BAD_TLD = ["xyz", "top", "click", "shop", "site", "online", "tk", "cf", "ml", "gq", "icu", "buzz", "live"];
const SHORT = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rb.gy", "shorturl.at"];

const SEED_POSTS: Post[] = [
  { id: 1, author: "Marina Ramos", tag: "Alerta", time: "Há 2 horas", text: "Recebi no zap uma “promoção de perfume” e era golpe! Usei o verificador e o domínio não era oficial. Fiquem de olho!", likes: 42, liked: false, comments: ["Obrigada pelo aviso!", "Aconteceu comigo semana passada."] },
  { id: 2, author: "Camila Souza", tag: "Dica", time: "Ontem", text: "O sérum Botik com ácido hialurônico vale cada centavo. Pele bem mais hidratada na primeira semana.", likes: 128, liked: false, comments: ["Vou comprar!"] },
  { id: 3, author: "Rafael Lima", tag: "Pergunta", time: "2 dias", text: "Alguém sabe se o Malbec Gold dura bastante na pele? Quero presentear meu pai.", likes: 17, liked: false, comments: [] },
];

const HOME_SLIDES: BannerSlide[] = [
  { label: "BELEZA COM CONFIANÇA", title: "Seu próximo favorito, com segurança", text: "Confira a loja e o link antes de comprar.", image: U("photo-1594035910387-fea47794261f") },
  { label: "CUIDADO QUE VOCÊ MERECE", title: "Encontre seu ritual de skincare", text: "Descubra produtos e ofertas em um só lugar.", image: U("photo-1620916566398-39f1143ab7be") },
  { label: "ESCOLHAS SEGURAS", title: "Beleza boa é beleza protegida", text: "Salve seus achados e compre com mais tranquilidade.", image: U("photo-1608248543803-ba4f8c70ae0b") },
];

const COMMUNITY_SLIDES: BannerSlide[] = [
  { label: "COMUNIDADE BELEZA SEGURA", title: "Informação compartilhada protege todo mundo", text: "Conte sua experiência e ajude outras pessoas a comprar com atenção.", image: U("photo-1595425970377-c9703c518815") },
  { label: "DICA DA COMUNIDADE", title: "Confira o endereço antes de pagar", text: "Desconfie de promoções boas demais e de links encurtados.", image: U("photo-1592945403244-b3fbafd7f539") },
  { label: "JUNTAS CONTRA GOLPES", title: "Um alerta pode fazer a diferença", text: "Compartilhe dicas, dúvidas e sinais de atenção.", image: U("photo-1585386959984-a4155224a1ad") },
];

/* ================= Ícones (stroke + currentColor) ================= */
const I = (p: { d: string | string[]; fill?: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} fill={p.fill || "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {(Array.isArray(p.d) ? p.d : [p.d]).map((x, i) => <path key={i} d={x} />)}
  </svg>
);
const Icons = {
  Home: () => <I d={["M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"]} />,
  Verifier: () => <I d={["M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", "M8.5 12l2.5 2.5L16 9.5"]} />,
  Discover: () => <I d={["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M15.5 8.5l-2 5-5 2 2-5z"]} />,
  Community: () => <I d={["M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z", "M8.5 11h7", "M8.5 14h4"]} />,
  Profile: () => <I d={["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21c0-4 3.6-6 8-6s8 2 8 6"]} />,
  Heart: ({ filled }: { filled?: boolean }) => <I fill={filled ? "#ff4757" : "none"} d="M12 20.5C5 14.8 3 12 3 8.9A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 9 2.5c0 3.1-2 5.9-9 11.6z" />,
  Search: () => <I size={20} d={["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M21 21l-4.3-4.3"]} />,
  Back: () => <I d="M15 18l-6-6 6-6" />,
  Plus: () => <I d={["M12 5v14", "M5 12h14"]} />,
  Out: () => <I size={20} d={["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]} />,
  Ext: () => <I size={16} d={["M15 3h6v6", "M10 14L21 3", "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"]} />,
  Star: () => <I size={14} fill="#f6ad55" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  Check: () => <I size={18} d="M5 12.5l4.5 4.5L19 7.5" />,
};

/* ================= Utilitários ================= */
function load<T>(k: string, def: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : def; } catch { return def; } }
function save(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }

function Img({ src, alt, label }: { src: string; alt: string; label?: string }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  if (err) return <div className="img-fallback" role="img" aria-label={alt}><span>🧴</span><small>{label}</small></div>;
  return <img className={ok ? "img-ok" : "img-load"} src={src} alt={alt} loading="lazy" onLoad={() => setOk(true)} onError={() => setErr(true)} />;
}

function checkLink(raw: string) {
  const items: { s: "ok" | "warn" | "bad"; t: string; d: string }[] = [];
  let url: URL;
  try { url = new URL(/^[a-z]+:\/\//i.test(raw.trim()) ? raw.trim() : "https://" + raw.trim()); } catch { return null; }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const official = OFFICIAL.some((o) => host === o || host.endsWith("." + o));
  const tld = host.split(".").pop() || "";
  const brandFake = !official && /(boticario|oboticario|eudora|natura|avon)/.test(host.replace(/-/g, ""));
  items.push(url.protocol === "https:" ? { s: "ok", t: "Conexão criptografada (HTTPS)", d: "O endereço usa HTTPS." } : { s: "bad", t: "Sem HTTPS", d: "Nunca insira dados em sites sem cadeado." });
  items.push(official ? { s: "ok", t: "Domínio oficial reconhecido", d: `${host} está na lista de lojas verificadas.` } : brandFake ? { s: "bad", t: "Imita uma marca conhecida", d: "O nome da marca aparece em um domínio que não é o oficial." } : { s: "warn", t: "Domínio não verificado", d: "Não está na nossa lista de lojas oficiais." });
  items.push(BAD_TLD.includes(tld) ? { s: "bad", t: `Extensão suspeita (.${tld})`, d: "Muito usada em sites de golpe." } : { s: "ok", t: "Extensão comum", d: `.${tld} não é considerada de alto risco.` });
  const isShortLink = SHORT.includes(host);
  items.push(isShortLink ? { s: "bad", t: "Link encurtado", d: "Esconde o destino real. Evite." } : /^\d+\.\d+\.\d+\.\d+$/.test(host) || raw.includes("@") ? { s: "bad", t: "Endereço estranho", d: "IP direto ou caractere @ na URL." } : { s: "ok", t: "Estrutura do link normal", d: "Sem encurtadores ou truques." });
  const score = Math.max(5, 100 - items.reduce((a, i) => a + (i.s === "bad" ? 35 : i.s === "warn" ? 15 : 0), 0) - (isShortLink ? 15 : 0));
  return { host, score, items };
}

function getLinkStories(host: string, score: number) {
  const normalized = host.toLowerCase().replace(/^www\./, "");
  const official = OFFICIAL.some((domain) => normalized === domain || normalized.endsWith("." + domain));
  if (official && score >= 80) return [
    "Exemplo de relato: usei o endereço da loja oficial e meu pedido chegou certinho.",
    "Dica da comunidade: confira se o domínio termina exatamente no endereço oficial.",
  ];
  if (SHORT.includes(normalized)) return [
    "Alerta de demonstração: o link encurtado não mostra o destino. Peça o endereço original antes de clicar.",
    "Não é possível confirmar compras ou entregas usando apenas um link encurtado.",
  ];
  return [
    "Exemplo de alerta: a oferta parecia boa demais e o endereço não era o site oficial.",
    "Dica de segurança: não informe dados nem faça Pix antes de confirmar a loja por um canal oficial.",
  ];
}

/* ================= Componentes ================= */
type Go = (s: Screen, p?: Product) => void;
interface Ctx { favs: string[]; toggleFav: (id: string) => void; go: Go; toast: (m: string) => void }

function BottomNav({ active, go }: { active: Screen; go: Go }) {
  const items: { id: Screen; Icon: () => React.ReactElement; label: string }[] = [
    { id: "home", Icon: Icons.Home, label: "Início" },
    { id: "verifier", Icon: Icons.Verifier, label: "Verificar" },
    { id: "discover", Icon: Icons.Discover, label: "Descobrir" },
    { id: "community", Icon: Icons.Community, label: "Comunidade" },
    { id: "profile", Icon: Icons.Profile, label: "Perfil" },
  ];
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map(({ id, Icon, label }) => (
        <button key={id} className={active === id ? "active" : ""} onClick={() => go(id)} aria-current={active === id ? "page" : undefined}>
          <span className="nav-ico"><Icon /></span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

function ProductCard({ p, c, wide }: { p: Product; c: Ctx; wide?: boolean }) {
  const fav = c.favs.includes(p.id);
  return (
    <article className={"product-card" + (wide ? " wide" : "")}>
      <div className="pimg" onClick={() => c.go("detail", p)}>
        <Img src={p.image} alt={p.name} label={p.brand} />
        {off(p) > 0 && <span className="badge">{off(p)}% OFF</span>}
        <button className={"heart-btn" + (fav ? " pop" : "")} aria-label="Favoritar" onClick={(e) => { e.stopPropagation(); c.toggleFav(p.id); }}><Icons.Heart filled={fav} /></button>
      </div>
      <div className="pinfo">
        <span className="brand-tag">{p.category}</span>
        <h3 onClick={() => c.go("detail", p)}>{p.name}</h3>
        <div className="rate"><Icons.Star /> {p.rating} <small>({p.reviews})</small></div>
        <div className="price-row"><strong>{brl(p.price)}</strong>{p.oldPrice && <s>{brl(p.oldPrice)}</s>}</div>
        <a className="btn-primary buy-btn" href={p.link} target="_blank" rel="noopener noreferrer">Comprar <Icons.Ext /></a>
      </div>
    </article>
  );
}

function ImageCarousel({ slides, variant }: { slides: BannerSlide[]; variant: "home" | "community" }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const slide = slides[active];
  const move = (direction: number) => setActive((current) => (current + direction + slides.length) % slides.length);
  return (
    <section className={`image-carousel ${variant}`} aria-roledescription="carrossel" aria-label={variant === "home" ? "Destaques da página inicial" : "Destaques da comunidade"}>
      <img key={slide.image} className="carousel-image" src={slide.image} alt="" />
      <div className="carousel-overlay" />
      <div className="carousel-copy" aria-live="polite">
        <span>{slide.label}</span><h2>{slide.title}</h2><p>{slide.text}</p>
      </div>
      <button className="carousel-arrow prev" onClick={() => move(-1)} aria-label="Banner anterior">‹</button>
      <button className="carousel-arrow next" onClick={() => move(1)} aria-label="Próximo banner">›</button>
      <div className="carousel-dots" role="tablist" aria-label="Selecionar banner">
        {slides.map((item, index) => <button key={item.title} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Banner ${index + 1}`} aria-selected={index === active} role="tab" />)}
      </div>
    </section>
  );
}

function Home({ c }: { c: Ctx }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"Todos" | Cat>("Todos");
  const list = useMemo(() => PRODUCTS.filter((p) => (cat === "Todos" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())), [q, cat]);
  const promos = PRODUCTS.filter((p) => off(p) > 0);
  return (
    <>
      <header className="hero">
        <p>Olá! 👋</p>
        <h1>Beleza Segura</h1>
        <span>Compre com confiança em links oficiais.</span>
      </header>
      <div className="search-bar"><Icons.Search /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busque produtos verificados..." aria-label="Buscar" /></div>
      <ImageCarousel slides={HOME_SLIDES} variant="home" />
      <div className="chips">{CATS.map((k) => <button key={k} className={cat === k ? "chip on" : "chip"} onClick={() => setCat(k)}>{CAT_EMOJI[k]} {k}</button>)}</div>
      {!q && cat === "Todos" && (
        <section className="block">
          <h2>🔥 Promoções verificadas</h2>
          <div className="hscroll">{promos.map((p) => <ProductCard key={p.id} p={p} c={c} />)}</div>
        </section>
      )}
      <section className="block">
        <h2>{q || cat !== "Todos" ? `Resultados (${list.length})` : "Tendências seguras"}</h2>
        {list.length === 0 ? <p className="empty">Nada encontrado 😕<br />Tente outra busca.</p> : (
          <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} c={c} wide />)}</div>
        )}
      </section>
    </>
  );
}

function Discover({ c }: { c: Ctx }) {
  const [sort, setSort] = useState<"rating" | "low" | "high" | "off">("rating");
  const list = useMemo(() => [...PRODUCTS].sort((a, b) => sort === "rating" ? b.rating - a.rating : sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : off(b) - off(a)), [sort]);
  return (
    <>
      <header className="page-header"><span>EXPLORE</span><h1>Descobrir</h1><p>Os melhores achados da loja oficial.</p></header>
      <div className="chips">{([["rating", "⭐ Mais bem avaliados"], ["off", "🏷️ Maior desconto"], ["low", "↓ Menor preço"], ["high", "↑ Maior preço"]] as const).map(([k, l]) => <button key={k} className={sort === k ? "chip on" : "chip"} onClick={() => setSort(k)}>{l}</button>)}</div>
      <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} c={c} wide />)}</div>
    </>
  );
}

function Detail({ p, c }: { p: Product; c: Ctx }) {
  const fav = c.favs.includes(p.id);
  const host = new URL(p.link).hostname.replace("www.", "");
  return (
    <main className="detail">
      <div className="dimg">
        <button className="icon-btn back" onClick={() => c.go("home")} aria-label="Voltar"><Icons.Back /></button>
        <Img src={p.image} alt={p.name} label={p.brand} />
        <button className="heart-btn large" onClick={() => c.toggleFav(p.id)} aria-label="Favoritar"><Icons.Heart filled={fav} /></button>
      </div>
      <div className="dcontent">
        <div className="tag-safe">✓ Loja oficial: {host}</div>
        <h1>{p.name}</h1>
        <span className="muted">{p.brand} • {p.category}</span>
        <div className="rate big"><Icons.Star /> {p.rating} <small>({p.reviews} avaliações)</small></div>
        <div className="dprice"><h2>{brl(p.price)}</h2>{p.oldPrice && <s>{brl(p.oldPrice)}</s>}{off(p) > 0 && <span className="discount">{off(p)}% OFF</span>}</div>
        <p className="ddesc">{p.description}</p>
        <div className="security"><strong>🔒 Por que é seguro?</strong><p>O botão abaixo abre o endereço oficial da loja, em outra aba, sem intermediários. Confira sempre o cadeado e o domínio antes de pagar.</p></div>
        <h3 className="sub">Você também pode gostar</h3>
        <div className="hscroll flush">{PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4).map((x) => <ProductCard key={x.id} p={x} c={c} />)}</div>
      </div>
      <div className="buy-bar"><a className="btn-primary w-full" href={p.link} target="_blank" rel="noopener noreferrer">Comprar no site oficial <Icons.Ext /></a></div>
    </main>
  );
}

function Verifier({ c }: { c: Ctx }) {
  const [link, setLink] = useState("");
  const [res, setRes] = useState<ReturnType<typeof checkLink> | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const run = () => {
    if (!link.trim()) return c.toast("Cole um link primeiro");
    setBusy(true); setRes(undefined);
    setTimeout(() => { const r = checkLink(link); setBusy(false); if (!r) c.toast("Link inválido"); setRes(r); }, 900);
  };
  const tone = res ? (res.score >= 80 ? "good" : res.score >= 50 ? "mid" : "bad") : "";
  const verdict = res ? (res.score >= 80 ? "Parece seguro" : res.score >= 50 ? "Atenção" : "Alto risco") : "";
  return (
    <>
      <header className="page-header"><span>CENTRAL DE CONFIANÇA</span><h1>Verificador de Links</h1><p>Cole o link antes de comprar.</p></header>
      <div className="card">
        <input className="input" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder="https://loja.com.br/produto" aria-label="Link" />
        <button className="btn-primary w-full" disabled={busy} onClick={run}>{busy ? "Analisando..." : "Verificar link"}</button>
        <div className="try"><small>Testar:</small>{["https://www.oboticario.com.br/", "http://boticario-ofertas.xyz/perfume", "https://bit.ly/promo123"].map((x) => <button key={x} onClick={() => setLink(x)}>{x.replace(/^https?:\/\//, "").slice(0, 22)}</button>)}</div>
      </div>
      {busy && <div className="card center"><div className="spinner" /></div>}
      {res && (
        <div className="card slide-up verifier-result">
          <div className="score-head"><div className={"score " + tone}>{res.score}</div><div><h3>{verdict}</h3><p className="muted">{res.host}</p></div></div>
          <div className={`beauty-score ${tone}`}>
            <div className="beauty-score-label"><span>Beleza Segura Score</span><strong>{res.score}<small>/100</small></strong></div>
            <div className="beauty-score-track" role="progressbar" aria-label="Beleza Segura Score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={res.score}><span style={{ width: `${res.score}%` }} /></div>
            <p>{res.score >= 80 ? "Ótimo nível de confiança — confira o domínio antes de finalizar." : res.score >= 50 ? "Atenção: confira os sinais abaixo antes de continuar." : "Risco elevado — evite informar dados ou fazer pagamentos."}</p>
          </div>
          {res.items.map((it, i) => (
            <div key={i} className="check" style={{ animationDelay: i * 90 + "ms" }}>
              <span className={"ci " + it.s}>{it.s === "ok" ? "✓" : it.s === "warn" ? "!" : "✕"}</span>
              <div><strong>{it.t}</strong><p>{it.d}</p></div>
            </div>
          ))}
          <p className="disc">Análise automática baseada no endereço. Não substitui seu bom senso.</p>
          <section className="link-community" aria-label="Comentários demonstrativos da comunidade">
            <div className="link-community-heading"><span>COMUNIDADE</span><h3>O que as pessoas comentam</h3></div>
            <p className="demo-note">Exemplos ilustrativos para demonstração; não são avaliações reais nem confirmação de compras deste endereço.</p>
            {getLinkStories(res.host, res.score).map((story, index) => <article className="link-story" key={index}><span className="story-avatar">{index === 0 ? "BS" : "D"}</span><p>{story}</p></article>)}
          </section>
        </div>
      )}
    </>
  );
}

function CommunityScreen({ c }: { c: Ctx }) {
  const [posts, setPosts] = useState<Post[]>(() => load("bs_posts", SEED_POSTS));
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [tag, setTag] = useState<Post["tag"]>("Dica");
  const [cm, setCm] = useState<Record<number, string>>({});
  const [shown, setShown] = useState<number | null>(null);
  useEffect(() => save("bs_posts", posts), [posts]);
  const like = (id: number) => setPosts((ps) => ps.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
  const publish = () => {
    if (text.trim().length < 5) return c.toast("Escreva um pouco mais");
    setPosts((ps) => [{ id: Date.now(), author: "Você", tag, time: "Agora", text: text.trim(), likes: 0, liked: false, comments: [] }, ...ps]);
    setText(""); setOpen(false); c.toast("Publicado!");
  };
  const comment = (id: number) => {
    const t = (cm[id] || "").trim(); if (!t) return;
    setPosts((ps) => ps.map((p) => p.id === id ? { ...p, comments: [...p.comments, t] } : p)); setCm({ ...cm, [id]: "" });
  };
  return (
    <>
      <header className="page-header"><span>FÓRUM SEGURO</span><h1>Comunidade</h1><p>Dicas e alertas de outros consumidores.</p></header>
      <ImageCarousel slides={COMMUNITY_SLIDES} variant="community" />
      {posts.map((p) => (
        <div key={p.id} className="card post slide-up">
          <div className="phead"><div className="avatar">{p.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div><div><strong>{p.author}</strong><span>{p.time}</span></div><em className={"tagp " + p.tag}>{p.tag}</em></div>
          <p>{p.text}</p>
          <div className="pact">
            <button className={p.liked ? "on" : ""} onClick={() => like(p.id)}><Icons.Heart filled={p.liked} /> {p.likes}</button>
            <button onClick={() => setShown(shown === p.id ? null : p.id)}><Icons.Community /> {p.comments.length}</button>
          </div>
          {shown === p.id && (
            <div className="comments">
              {p.comments.map((t, i) => <div key={i} className="cmt">{t}</div>)}
              <div className="crow"><input className="input" value={cm[p.id] || ""} onChange={(e) => setCm({ ...cm, [p.id]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && comment(p.id)} placeholder="Comentar..." /><button className="btn-primary" onClick={() => comment(p.id)}>Enviar</button></div>
            </div>
          )}
        </div>
      ))}
      <button className="fab" onClick={() => setOpen(true)} aria-label="Nova publicação"><Icons.Plus /></button>
      {open && (
        <div className="modal" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Nova publicação</h3>
            <div className="chips flush">{(["Dica", "Alerta", "Pergunta"] as const).map((t) => <button key={t} className={tag === t ? "chip on" : "chip"} onClick={() => setTag(t)}>{t}</button>)}</div>
            <textarea className="input" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Compartilhe com a comunidade..." />
            <button className="btn-primary w-full" onClick={publish}>Publicar</button>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileScreen({ c, user, logout }: { c: Ctx; user: User; logout: () => void }) {
  const favs = PRODUCTS.filter((p) => c.favs.includes(p.id));
  return (
    <>
      <header className="page-header prof"><div className="avatar big">{user.name[0]?.toUpperCase()}</div><h1>{user.name}</h1><p>{user.email}</p></header>
      <div className="stats"><div><b>{favs.length}</b><span>Favoritos</span></div><div><b>{PRODUCTS.length}</b><span>Produtos</span></div><div><b>100%</b><span>Links oficiais</span></div></div>
      <section className="block"><h2>❤️ Meus favoritos</h2>
        {favs.length === 0 ? <p className="empty">Toque no coração dos produtos para salvar aqui.</p> : <div className="grid">{favs.map((p) => <ProductCard key={p.id} p={p} c={c} wide />)}</div>}
      </section>
      <button className="btn-out" onClick={logout}><Icons.Out /> Sair da conta</button>
    </>
  );
}

function Auth({ mode, setMode, onAuth }: { mode: "login" | "signup"; setMode: (m: "login" | "signup") => void; onAuth: (u: User) => void }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const submit = () => {
    if (mode === "signup" && name.trim().length < 2) return setErr("Informe seu nome.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("E-mail inválido.");
    if (pw.length < 6) return setErr("A senha precisa de 6+ caracteres.");
    onAuth({ name: mode === "signup" ? name.trim() : email.split("@")[0], email });
  };
  return (
    <main className="auth">
      <div className="login-decoration login-decoration-left" aria-hidden="true">
        <svg viewBox="0 0 180 150"><path d="M8 24C43 1 78 4 111 18 83 42 48 54 8 24Z"/><path d="M20 35c20 18 44 34 76 49"/><path d="M12 80c30-15 57-10 81 7-27 18-55 16-81-7Z"/><path d="M22 84c21 3 40 9 61 22"/></svg>
      </div>
      <div className="login-decoration login-decoration-right" aria-hidden="true">
        <svg viewBox="0 0 180 170"><path d="M170 25c-37-20-75-15-108 0 29 25 66 35 108 0Z"/><path d="M158 35c-20 20-45 37-78 52"/><path d="M174 83c-32-15-60-9-84 10 29 17 58 14 84-10Z"/><path d="M162 88c-23 3-44 10-65 25"/></svg>
      </div>
      <div className="auth-top"><h1>Beleza Segura</h1><p>{mode === "login" ? "Bem-vinda de volta!" : "Crie sua conta"}</p></div>
      <div className="auth-sheet slide-up">
        {mode === "signup" && <input className="input" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />}
        <input className="input" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Senha" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn-primary w-full" onClick={submit}>{mode === "login" ? "Entrar" : "Cadastrar"}</button>
        <p className="switch">{mode === "login" ? "Não tem conta? " : "Já tem conta? "}<button onClick={() => { setErr(""); setMode(mode === "login" ? "signup" : "login"); }}>{mode === "login" ? "Cadastre-se" : "Entrar"}</button></p>
      </div>
    </main>
  );
}

/* ================= App ================= */
export default function App() {
  const [user, setUser] = useState<User | null>(() => load<User | null>("bs_user", null));
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [screen, setScreen] = useState<Screen>("home");
  const [product, setProduct] = useState<Product | null>(null);
  const [favs, setFavs] = useState<string[]>(() => load("bs_favs", []));
  const [msg, setMsg] = useState("");
  useEffect(() => save("bs_favs", favs), [favs]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 1800); return () => clearTimeout(t); }, [msg]);

  const go: Go = (s, p) => { if (p) setProduct(p); setScreen(s); document.getElementById("scroller")?.scrollTo({ top: 0 }); };
  const toggleFav = (id: string) => setFavs((f) => { const has = f.includes(id); setMsg(has ? "Removido dos favoritos" : "Salvo nos favoritos ❤️"); return has ? f.filter((x) => x !== id) : [...f, id]; });
  const c: Ctx = { favs, toggleFav, go, toast: setMsg };
  const auth = (u: User) => { save("bs_user", u); setUser(u); setScreen("home"); };
  const logout = () => { save("bs_user", null); setUser(null); };

  let body: React.ReactNode;
  if (screen === "detail" && product) body = <Detail p={product} c={c} />;
  else if (screen === "verifier") body = <Verifier c={c} />;
  else if (screen === "discover") body = <Discover c={c} />;
  else if (screen === "community") body = <CommunityScreen c={c} />;
  else if (screen === "profile" && user) body = <ProfileScreen c={c} user={user} logout={logout} />;
  else body = <Home c={c} />;

  return (
    <div className="app-wrapper">
      <div className="mobile-container">
        {!user ? <Auth mode={authMode} setMode={setAuthMode} onAuth={auth} /> : (
          <>
            <div id="scroller" className="scroller"><div key={screen} className="screen fade-in">{body}</div></div>
            {screen !== "detail" && <BottomNav active={screen} go={go} />}
          </>
        )}
        {msg && <div className="toast" role="status">{msg}</div>}
      </div>
    </div>
  );
}


/* ================= Estilos ================= */
function GlobalStyles() {
  return (
    <style>{`
:root{--primary:#d53f8c;--primary-dark:#9b2c86;--bg:#f6f3f5;--surface:#fff;--text:#1a202c;--muted:#718096;--border:#e8e2e6;--ok:#38a169;--warn:#dd8b1c;--bad:#e53e3e}
*{box-sizing:border-box;margin:0;padding:0;font-family:Inter,system-ui,-apple-system,sans-serif}
html,body,#root{height:100%}
body{background:#2d2430}
button{cursor:pointer;font:inherit}
a{text-decoration:none}
.app-wrapper{width:100%;height:100dvh;display:flex;justify-content:center;background:linear-gradient(160deg,#3b2a40,#1f1824)}
.mobile-container{width:100%;max-width:430px;height:100%;background:var(--bg);position:relative;overflow:hidden;box-shadow:0 0 50px rgba(0,0,0,.45)}
.scroller{height:100%;overflow-y:auto;overflow-x:hidden;padding-bottom:104px;scroll-behavior:smooth}
.fade-in{animation:fadeIn .45s cubic-bezier(.16,1,.3,1) both}
.slide-up{animation:slideUp .45s ease-out both}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-300px 0}100%{background-position:300px 0}}

.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;border:0;padding:13px 20px;border-radius:14px;font-weight:600;font-size:15px;transition:transform .2s,box-shadow .2s,opacity .2s}
.btn-primary:hover{box-shadow:0 8px 18px rgba(213,63,140,.35)}
.btn-primary:active{transform:scale(.97)}
.btn-primary:disabled{opacity:.6}
.w-full{width:100%}
.input{width:100%;padding:14px;border:1.5px solid var(--border);border-radius:12px;margin-bottom:12px;font-size:15px;outline:0;background:#fff;color:var(--text);transition:border .2s,box-shadow .2s;resize:none}
.input:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(213,63,140,.12)}
.muted{color:var(--muted);font-size:13px}

.hero{padding:34px 22px 22px;color:#fff;background:linear-gradient(135deg,#d53f8c,#6b2c91);border-radius:0 0 32px 32px}
.hero p{opacity:.85;font-size:14px}.hero h1{font-size:30px;margin:2px 0 6px}.hero span{font-size:14px;opacity:.9}
.page-header{padding:30px 22px 22px;background:var(--surface);border-bottom:1px solid var(--border);border-radius:0 0 24px 24px}
.page-header span{font-size:11px;font-weight:700;color:var(--primary);letter-spacing:1.2px}
.page-header h1{font-size:26px;margin:4px 0 6px;color:var(--text)}.page-header p{font-size:14px;color:var(--muted)}
.page-header.prof{text-align:center}.avatar.big{width:76px;height:76px;font-size:30px;margin:0 auto 10px}

.search-bar{display:flex;align-items:center;gap:10px;background:#fff;margin:-22px 20px 8px;padding:13px 16px;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.1);color:var(--muted);position:relative}
.search-bar input{border:0;outline:0;width:100%;font-size:15px;color:var(--text)}
.chips{display:flex;gap:8px;overflow-x:auto;padding:14px 20px 4px;scrollbar-width:none}.chips::-webkit-scrollbar{display:none}.chips.flush{padding:0 0 14px}
.chip{white-space:nowrap;border:1.5px solid var(--border);background:#fff;color:var(--text);padding:8px 14px;border-radius:30px;font-size:13px;font-weight:600;transition:all .25s}
.chip.on{background:var(--primary);border-color:var(--primary);color:#fff;transform:scale(1.04)}
.block{margin-top:22px}.block h2{font-size:18px;margin:0 20px 12px}
.sub{font-size:16px;margin:26px 0 10px}
.empty{text-align:center;color:var(--muted);padding:30px 20px;line-height:1.6}

.hscroll{display:flex;gap:14px;overflow-x:auto;padding:4px 20px 18px;scroll-snap-type:x mandatory;scrollbar-width:none}.hscroll::-webkit-scrollbar{display:none}.hscroll.flush{padding-left:0;padding-right:0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:4px 20px 10px}
.product-card{min-width:178px;max-width:178px;background:#fff;border-radius:18px;box-shadow:0 4px 16px rgba(0,0,0,.06);scroll-snap-align:start;overflow:hidden;transition:transform .3s,box-shadow .3s}
.product-card.wide{min-width:0;max-width:none}
.product-card:hover{transform:translateY(-5px);box-shadow:0 12px 26px rgba(0,0,0,.12)}
.pimg{position:relative;height:160px;cursor:pointer;background:#f1ecef;overflow:hidden}
.pimg img{width:100%;height:100%;object-fit:cover;transition:transform .5s}.product-card:hover .pimg img{transform:scale(1.08)}
.img-load{opacity:0;background:linear-gradient(90deg,#eee 0,#f8f8f8 50%,#eee 100%);background-size:600px}
.img-ok{opacity:1;animation:fadeIn .5s both}
.img-fallback{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#fbe3ee,#e6d7f5);font-size:44px}
.img-fallback small{font-size:11px;color:var(--primary-dark);font-weight:600;margin-top:4px}
.badge{position:absolute;top:10px;left:10px;background:var(--primary);color:#fff;font-size:11px;font-weight:700;padding:4px 8px;border-radius:8px}
.heart-btn{position:absolute;top:10px;right:10px;background:rgba(255,255,255,.95);border:0;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;color:#555;box-shadow:0 2px 8px rgba(0,0,0,.15);transition:transform .2s}
.heart-btn.pop svg{animation:pop .4s}.heart-btn:active{transform:scale(.88)}
.heart-btn.large{width:48px;height:48px;right:20px;bottom:-24px;top:auto;z-index:5}
.pinfo{padding:12px;display:flex;flex-direction:column;gap:5px}
.brand-tag{font-size:10px;color:var(--primary);text-transform:uppercase;font-weight:700;letter-spacing:.6px}
.pinfo h3{font-size:13px;font-weight:600;line-height:1.3;height:34px;overflow:hidden;cursor:pointer;color:var(--text)}
.rate{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--text)}.rate small{color:var(--muted);font-weight:400}.rate.big{margin-top:10px;font-size:14px}
.price-row{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}.price-row strong{font-size:16px}.price-row s{font-size:12px;color:var(--muted)}
.buy-btn{margin-top:6px;padding:9px;font-size:13px;border-radius:10px}

.bottom-nav{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-around;padding:10px 8px calc(14px + env(safe-area-inset-bottom,0px));background:rgba(255,255,255,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--border);z-index:50}
.bottom-nav button{background:none;border:0;flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;color:#8a8190;position:relative;padding:4px 0;transition:color .25s}
.bottom-nav .nav-ico{display:flex;width:44px;height:30px;align-items:center;justify-content:center;border-radius:15px;transition:background .3s,transform .3s}
.bottom-nav .nav-ico svg{display:block;width:24px;height:24px;stroke:currentColor;opacity:1;visibility:visible}
.bottom-nav .nav-label{font-size:10.5px;font-weight:600}
.bottom-nav button.active{color:var(--primary)}
.bottom-nav button.active .nav-ico{background:rgba(213,63,140,.14);transform:translateY(-2px)}
.bottom-nav button:active .nav-ico{transform:scale(.9)}

.card{background:#fff;margin:16px 20px;padding:20px;border-radius:18px;box-shadow:0 4px 16px rgba(0,0,0,.05)}.card.center{display:flex;justify-content:center}
.spinner{width:34px;height:34px;border:4px solid #f3d3e4;border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite}
.try{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:12px}.try small{color:var(--muted)}
.try button{border:0;background:#f4eef2;color:var(--primary-dark);padding:5px 10px;border-radius:20px;font-size:11px;font-weight:600}
.score-head{display:flex;align-items:center;gap:16px;margin-bottom:18px}
.score{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:800;border:5px solid rgba(0,0,0,.1)}
.score.good{background:var(--ok)}.score.mid{background:var(--warn)}.score.bad{background:var(--bad)}
.check{display:flex;gap:12px;margin-bottom:14px;animation:slideUp .4s both}
.check strong{display:block;font-size:14px}.check p{font-size:13px;color:var(--muted);margin-top:2px}
.ci{width:24px;height:24px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700}
.ci.ok{background:var(--ok)}.ci.warn{background:var(--warn)}.ci.bad{background:var(--bad)}
.disc{font-size:11px;color:var(--muted);margin-top:8px;border-top:1px solid var(--border);padding-top:10px}

.detail{position:relative}
.dimg{height:340px;position:relative;background:#f1ecef}.dimg>img,.dimg>.img-fallback{width:100%;height:100%;object-fit:cover}
.icon-btn{position:absolute;top:18px;left:18px;z-index:6;width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.9);color:var(--text);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.2)}
.dcontent{padding:34px 20px 120px;background:#fff;border-radius:26px 26px 0 0;margin-top:-24px;position:relative}
.tag-safe{display:inline-block;background:#e6fffa;color:#234e52;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:12px}
.dcontent h1{font-size:23px;line-height:1.25;margin-bottom:4px}
.dprice{display:flex;align-items:center;gap:12px;margin:18px 0}.dprice h2{font-size:30px;color:var(--primary)}.dprice s{color:var(--muted)}
.discount{background:#feebc8;color:#c05621;padding:4px 8px;border-radius:8px;font-size:12px;font-weight:700}
.ddesc{font-size:15px;line-height:1.65;color:#4a5568;margin-bottom:22px}
.security{background:#f0f4f8;border-left:4px solid #3182ce;padding:16px;border-radius:0 14px 14px 0}.security strong{color:#2c5282;font-size:14px}.security p{font-size:13px;color:#4a5568;margin-top:4px;line-height:1.5}
.buy-bar{position:fixed;bottom:0;width:100%;max-width:430px;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);padding:14px 20px calc(20px + env(safe-area-inset-bottom,0px));box-shadow:0 -6px 20px rgba(0,0,0,.08);z-index:60}

.post{display:flex;flex-direction:column;gap:12px}
.phead{display:flex;align-items:center;gap:12px}.phead strong{display:block;font-size:14px}.phead span{font-size:12px;color:var(--muted)}
.avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#f6ad55,#d53f8c);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex:none}
.tagp{margin-left:auto;font-style:normal;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px}
.tagp.Alerta{background:#fed7d7;color:#9b2c2c}.tagp.Dica{background:#c6f6d5;color:#22543d}.tagp.Pergunta{background:#bee3f8;color:#2a4365}
.post p{font-size:14px;line-height:1.55}
.pact{display:flex;gap:18px;padding-top:12px;border-top:1px solid var(--border)}
.pact button{background:none;border:0;display:flex;align-items:center;gap:6px;color:var(--muted);font-size:13px;font-weight:600}.pact button svg{width:20px;height:20px}.pact button.on{color:#ff4757}
.comments{display:flex;flex-direction:column;gap:8px;animation:fadeIn .3s both}.cmt{background:#f6f3f5;padding:10px 12px;border-radius:12px;font-size:13px}
.crow{display:flex;gap:8px}.crow .input{margin:0}.crow .btn-primary{padding:0 14px}
.fab{position:absolute;bottom:100px;right:20px;width:56px;height:56px;border-radius:50%;border:0;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;box-shadow:0 8px 20px rgba(213,63,140,.45);display:flex;align-items:center;justify-content:center;z-index:40;transition:transform .2s}.fab:hover{transform:rotate(90deg) scale(1.08)}
.modal{position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:flex-end;animation:fadeIn .25s both}
.sheet{background:#fff;width:100%;padding:22px 20px 30px;border-radius:26px 26px 0 0;animation:slideUp .35s both}.sheet h3{margin-bottom:14px}

.stats{display:flex;gap:10px;padding:16px 20px 0}.stats div{flex:1;background:#fff;border-radius:16px;padding:14px;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.05)}.stats b{display:block;font-size:20px;color:var(--primary)}.stats span{font-size:11px;color:var(--muted)}
.btn-out{display:flex;align-items:center;justify-content:center;gap:8px;margin:20px;width:calc(100% - 40px);padding:13px;border-radius:14px;border:1.5px solid var(--border);background:#fff;color:var(--bad);font-weight:600}

.auth{height:100%;background:linear-gradient(160deg,#6b2c91,#d53f8c);display:flex;flex-direction:column}
.auth-top{padding:90px 28px 30px;color:#fff}.auth-top h1{font-size:38px}.auth-top p{font-size:18px;opacity:.9;margin-top:4px}
.auth-sheet{flex:1;background:#fff;border-radius:36px 36px 0 0;padding:32px 26px}
.err{color:var(--bad);font-size:13px;margin:-4px 0 12px}
.switch{text-align:center;margin-top:18px;font-size:14px;color:var(--muted)}.switch button{background:none;border:0;color:var(--primary);font-weight:700}
.toast{position:absolute;left:50%;bottom:104px;transform:translateX(-50%);background:#1a202c;color:#fff;padding:11px 18px;border-radius:30px;font-size:13px;font-weight:600;z-index:200;animation:slideUp .3s both;white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,.3)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

/* ================= Identidade visual do projeto ================= */
@font-face{font-family:"Inter:Medium";src:url("https://static.figma.com/font/Inter_1") format("woff2");font-style:normal;font-weight:500;font-display:swap}
@font-face{font-family:"Inter:Regular";src:url("https://static.figma.com/font/Inter_1") format("woff2");font-style:normal;font-weight:400;font-display:swap}
@font-face{font-family:"Poppins:Light";src:url("https://static.figma.com/font/Poppins-Light_6") format("woff2");font-style:normal;font-weight:300;font-display:swap}
@font-face{font-family:"Poppins:Medium";src:url("https://static.figma.com/font/Poppins-Medium_6") format("woff2");font-style:normal;font-weight:500;font-display:swap}
@font-face{font-family:"Poppins:Regular";src:url("https://static.figma.com/font/Poppins-Regular_6") format("woff2");font-style:normal;font-weight:400;font-display:swap}
@font-face{font-family:"Poppins:SemiBold";src:url("https://static.figma.com/font/Poppins-SemiBold_6") format("woff2");font-style:normal;font-weight:600;font-display:swap}
:root{--primary:#a84f60;--primary-dark:#532b33;--bg:#eae0df;--surface:#fff;--text:#2e2528;--muted:#73686c;--border:#ead2d2;--ok:#6d895f;--warn:#c57d1d;--bad:#b85062;color:#2e2528;background:#eae0df;font-family:"Poppins:Regular",Poppins,Inter,system-ui,sans-serif}
*{font-family:"Poppins:Regular",Poppins,Inter,system-ui,sans-serif}
html,body,#root{min-height:100%;height:100%}
body{background:#532b33}
.app-wrapper{background:linear-gradient(160deg,#532b33,#321b22)}
.mobile-container{background:linear-gradient(180deg,#f8f3f2 0%,#eae0df 100%);box-shadow:0 0 50px rgba(36,15,21,.36)}
.scroller{scrollbar-width:thin;scrollbar-color:#c89ca2 transparent}
.btn-primary{background:linear-gradient(135deg,#bd6071,#a84f60);border-radius:40px;font-family:"Poppins:SemiBold",Poppins,sans-serif;box-shadow:0 6px 16px rgba(168,79,96,.17)}
.btn-primary:hover{box-shadow:0 9px 22px rgba(168,79,96,.28)}
.input{border-color:#ead2d2;border-radius:16px;background:#fff;color:#2e2528;font-family:"Inter:Regular",Inter,sans-serif}
.input:focus{border-color:#a84f60;box-shadow:0 0 0 4px rgba(168,79,96,.12)}
.muted{color:#73686c}
.hero{padding:30px 22px 24px;color:#fff;background:linear-gradient(135deg,#532b33,#a84f60);border-radius:0 0 30px 30px}
.hero p,.hero span{font-family:"Inter:Regular",Inter,sans-serif}
.hero h1{font-family:"Poppins:Medium",Poppins,sans-serif;font-size:31px;letter-spacing:-.7px}
.page-header{padding:30px 22px 22px;background:rgba(255,255,255,.8);border-bottom:1px solid #ead2d2;border-radius:0 0 25px 25px}
.page-header span{color:#5f806f;font-family:"Poppins:SemiBold",Poppins,sans-serif;letter-spacing:1.4px}
.page-header h1{color:#2e2528;font-family:"Poppins:Medium",Poppins,sans-serif;letter-spacing:-.7px}
.page-header p{color:#73686c;font-family:"Inter:Regular",Inter,sans-serif}
.search-bar{margin:-20px 20px 8px;border:1px solid rgba(234,210,210,.8);border-radius:20px;box-shadow:0 8px 24px rgba(83,43,51,.1)}
.search-bar input{font-family:"Inter:Regular",Inter,sans-serif}
.chips{gap:8px;padding-top:14px}
.chip{border:1px solid #dfcccc;background:rgba(255,255,255,.8);color:#73686c;font-family:"Poppins:Medium",Poppins,sans-serif;border-radius:24px}
.chip.on{background:#a84f60;border-color:#a84f60;color:#fff;box-shadow:0 5px 13px rgba(168,79,96,.2)}
.block h2,.sub{color:#2e2528;font-family:"Poppins:Medium",Poppins,sans-serif}
.empty{color:#73686c;font-family:"Inter:Regular",Inter,sans-serif}
.hscroll{gap:12px;scroll-padding-left:20px}
.grid{gap:12px}
.product-card{min-width:0;max-width:none;border:1px solid rgba(234,210,210,.72);border-radius:19px;background:rgba(255,255,255,.92);box-shadow:0 8px 22px rgba(83,43,51,.08)}
.product-card:hover{box-shadow:0 13px 27px rgba(83,43,51,.13)}
.pimg{background:#f5eeee}
.img-fallback{background:linear-gradient(135deg,#f9e9eb,#eadfde)}
.img-fallback small,.brand-tag{color:#a84f60}
.badge{background:#6d945b;border-radius:25px;font-family:"Poppins:SemiBold",Poppins,sans-serif}
.heart-btn{color:#a84f60;box-shadow:0 3px 10px rgba(83,43,51,.13)}
.pinfo h3{font-family:"Poppins:Medium",Poppins,sans-serif}
.price-row strong{color:#532b33;font-family:"Poppins:Medium",Poppins,sans-serif}
.price-row s{color:#73686c}
.rate{font-family:"Inter:Medium",Inter,sans-serif}
.bottom-nav{position:fixed;left:50%;right:auto;bottom:max(10px,env(safe-area-inset-bottom));width:min(calc(100% - 40px),390px);padding:4px 8px;height:66px;justify-content:space-around;transform:translateX(-50%);border:1px solid rgba(234,210,210,.72);border-radius:65px;background:rgba(255,255,255,.96);box-shadow:0 5px 20px rgba(83,43,51,.14);z-index:50}
.bottom-nav button{color:#73686c;gap:2px;padding:2px 0}
.bottom-nav .nav-ico{width:42px;height:31px;border-radius:18px;color:#532b33}
.bottom-nav .nav-ico svg{width:22px;height:22px}
.bottom-nav .nav-label{font-family:"Poppins:Medium",Poppins,sans-serif;font-size:9px}
.bottom-nav button.active{color:#a84f60}
.bottom-nav button.active .nav-ico{background:#a84f60;color:#fff;transform:translateY(-1px)}
.card{border:1px solid rgba(234,210,210,.72);border-radius:22px;background:rgba(255,255,255,.84);box-shadow:0 12px 30px rgba(83,43,51,.07)}
.spinner{border-color:#f3dfe1;border-top-color:#a84f60}
.try button{background:#fcecef;color:#a84f60;border-radius:24px;font-family:"Inter:Medium",Inter,sans-serif}
.score{border-color:rgba(83,43,51,.1)}
.check strong,.score-head h3{font-family:"Poppins:SemiBold",Poppins,sans-serif}
.check p,.disc{font-family:"Inter:Regular",Inter,sans-serif}
.dimg{background:#f1e8e8}
.icon-btn{color:#532b33;box-shadow:0 3px 10px rgba(83,43,51,.16)}
.dcontent{background:#fdfafa;border:1px solid rgba(234,210,210,.6);border-radius:27px 27px 0 0}
.tag-safe{background:#eaf1e7;color:#47613f;font-family:"Poppins:SemiBold",Poppins,sans-serif}
.dcontent h1{font-family:"Poppins:Medium",Poppins,sans-serif;color:#2e2528}
.dprice h2{color:#532b33;font-family:"Poppins:Medium",Poppins,sans-serif}
.ddesc,.security p{font-family:"Inter:Regular",Inter,sans-serif}
.discount{background:#fff1d1;color:#8a5810;border-radius:25px}
.security{background:#f2f3ed;border-left-color:#6d895f}
.security strong{color:#47613f;font-family:"Poppins:SemiBold",Poppins,sans-serif}
.buy-bar{left:50%;transform:translateX(-50%);background:rgba(255,255,255,.96);box-shadow:0 -6px 20px rgba(83,43,51,.1)}
.post{border-color:rgba(234,210,210,.7)}
.avatar{background:linear-gradient(135deg,#bd7d78,#532b33);font-family:"Poppins:SemiBold",Poppins,sans-serif}
.post p{font-family:"Inter:Regular",Inter,sans-serif}
.tagp.Alerta{background:#fce4e5;color:#963f4b}.tagp.Dica{background:#e7efe2;color:#47613f}.tagp.Pergunta{background:#f7eddd;color:#8a5810}
.pact{border-color:#eee0e0}
.comments .cmt{background:#f8f1f1;font-family:"Inter:Regular",Inter,sans-serif}
.fab{background:linear-gradient(135deg,#bd6071,#a84f60);box-shadow:0 8px 20px rgba(168,79,96,.35)}
.sheet{background:#e3d2cf;border:1px solid rgba(255,255,255,.65)}
.sheet h3{color:#532b33;font-family:"Poppins:Medium",Poppins,sans-serif}
.stats div{border:1px solid rgba(234,210,210,.7);background:rgba(255,255,255,.8);box-shadow:0 8px 20px rgba(83,43,51,.07)}
.stats b{color:#532b33;font-family:"Poppins:Medium",Poppins,sans-serif}
.btn-out{border-color:#ead2d2;border-radius:24px;color:#b85062;font-family:"Poppins:Medium",Poppins,sans-serif}
.auth{background:linear-gradient(160deg,#532b33,#a84f60)}
.auth-top{padding:84px 28px 30px;color:#e3d2cf}
.auth-top h1{font-family:"Poppins:Medium",Poppins,sans-serif;font-size:36px;letter-spacing:-1px}
.auth-top p{font-family:"Poppins:Medium",Poppins,sans-serif}
.auth-sheet{background:#e3d2cf;border-radius:40px 40px 0 0;padding:32px 26px}
.auth-sheet .input{border:0;border-radius:40px;padding:16px 20px;background:#fff}
.auth-sheet .input:focus{box-shadow:0 0 0 3px rgba(168,79,96,.16)}
.auth-sheet .btn-primary{max-width:280px;margin:10px auto 0;padding:15px 24px}
.switch{font-family:"Inter:Regular",Inter,sans-serif;color:#73686c}
.switch button{color:#a84f60;font-family:"Poppins:SemiBold",Poppins,sans-serif}
.err{font-family:"Inter:Regular",Inter,sans-serif}
.toast{background:#532b33;box-shadow:0 8px 20px rgba(36,15,21,.25);font-family:"Inter:Medium",Inter,sans-serif}
@media(max-width:360px){.bottom-nav{left:12px;width:calc(100% - 24px);transform:none}.bottom-nav .nav-label{font-size:8px}.grid{gap:9px;padding-left:14px;padding-right:14px}.pinfo{padding:10px}}
@media(min-width:720px){.bottom-nav{left:50%;width:390px;transform:translateX(-50%)}.buy-bar{width:min(100%,430px)}}
    `}</style>
  );
}
