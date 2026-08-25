import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  category: string;
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  reviews: Review[];
  store: string;
  url: string;
  inStock: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

// ─── Mock product data ────────────────────────────────────────────────────────

const DEMO_PRODUCT_A: Product = {
  id: "p1",
  name: 'Smart TV QLED 55"',
  brand: "Samsung",
  price: 2799.99,
  currency: "R$",
  originalPrice: 3499.99,
  rating: 4.6,
  reviewCount: 1284,
  description:
    "TV QLED com Quantum Processor, 4K UHD, HDR10+, Alexa integrada e design sem bordas. Ideal para cinema em casa com cores vibrantes e contraste impecável.",
  image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=400&fit=crop&auto=format",
  category: "Eletrônicos",
  specs: {
    Resolução: "4K Ultra HD (3840×2160)",
    Tela: '55" QLED',
    "Taxa de atualização": "120Hz",
    HDR: "HDR10+, HLG",
    "Smart TV": "Tizen OS",
    Conectividade: "Wi-Fi 5, Bluetooth 5.2",
    Portas: "4x HDMI 2.1, 3x USB",
    Consumo: "120W",
  },
  pros: [
    "Cores excepcionais com tecnologia Quantum Dot",
    "Gaming Mode com 120Hz e VRR",
    "Interface Tizen fluida e intuitiva",
    "Suporte a múltiplos assistentes de voz",
  ],
  cons: [
    "Preço elevado em relação a concorrentes",
    "Sem suporte Dolby Vision",
    "Brilho poderia ser maior para ambientes claros",
  ],
  reviews: [
    { author: "Lucas M.", rating: 5, text: "Imagem incrível, cores perfeitas. Valeu cada centavo.", date: "12 ago 2026" },
    { author: "Ana P.", rating: 4, text: "Excelente TV, mas a configuração inicial é um pouco complicada.", date: "5 ago 2026" },
    { author: "Rafael S.", rating: 5, text: "Gaming mode fantástico, zero input lag. Recomendo muito!", date: "1 ago 2026" },
  ],
  store: "Amazon Brasil",
  url: "https://amazon.com.br/samsung-qled-55",
  inStock: true,
};

const DEMO_PRODUCT_B: Product = {
  id: "p2",
  name: 'OLED TV 55"',
  brand: "LG",
  price: 3199.99,
  currency: "R$",
  originalPrice: 3999.99,
  rating: 4.8,
  reviewCount: 892,
  description:
    "TV OLED com pixels auto-iluminados, pretos absolutos e ângulos de visão perfeitos. Dolby Vision IQ, Dolby Atmos e webOS com suporte a todos os streamings.",
  image: "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=600&h=400&fit=crop&auto=format",
  category: "Eletrônicos",
  specs: {
    Resolução: "4K Ultra HD (3840×2160)",
    Tela: '55" OLED evo',
    "Taxa de atualização": "120Hz",
    HDR: "Dolby Vision IQ, HDR10, HLG",
    "Smart TV": "webOS 24",
    Conectividade: "Wi-Fi 6, Bluetooth 5.0",
    Portas: "4x HDMI 2.1, 3x USB",
    Consumo: "100W",
  },
  pros: [
    "Pretos absolutos com tecnologia OLED",
    "Suporte a Dolby Vision IQ e Dolby Atmos",
    "Ângulos de visão perfeitos em 180°",
    "Menor consumo de energia que QLED",
  ],
  cons: [
    "Risco de burn-in com uso prolongado",
    "Preço mais alto que a concorrente",
    "Brilho máximo inferior ao QLED em ambientes claros",
  ],
  reviews: [
    { author: "Mariana C.", rating: 5, text: "Os pretos são absurdos. Nunca vi uma imagem tão bonita.", date: "15 ago 2026" },
    { author: "Pedro H.", rating: 5, text: "webOS é o melhor sistema de smart TV do mercado.", date: "8 ago 2026" },
    { author: "Beatriz L.", rating: 4, text: "Ótima TV, apenas me preocupo um pouco com o burn-in.", date: "3 ago 2026" },
  ],
  store: "Shopee",
  url: "https://shopee.com.br/lg-oled-55",
  inStock: true,
};

// ─── AI chat responses ────────────────────────────────────────────────────────

const getAIResponse = (message: string, products: (Product | null)[]): string => {
  const hasTwo = products[0] && products[1];
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("melhor") || lowerMsg.includes("qual") || lowerMsg.includes("recomenda")) {
    if (hasTwo) {
      return `Com base nos dois produtos analisados:\n\n**${products[0]!.brand} ${products[0]!.name}** é melhor para quem usa a TV em **ambientes claros** e quer a **melhor experiência de jogos** com HDR10+ e 120Hz.\n\n**${products[1]!.brand} ${products[1]!.name}** é superior para **cinéfilos** e quem assiste em **ambientes escuros**, com pretos absolutos e suporte a Dolby Vision IQ.\n\n💡 **Minha recomendação:** Se você assiste filmes e séries à noite, o OLED vale os R$ 400 a mais. Se você joga muito ou a sala tem bastante luz natural, o QLED é a escolha mais inteligente.`;
    }
    return "Adicione um segundo produto para eu poder comparar e recomendar a melhor opção para você!";
  }

  if (lowerMsg.includes("preço") || lowerMsg.includes("barato") || lowerMsg.includes("caro")) {
    if (hasTwo) {
      const diff = Math.abs(products[0]!.price - products[1]!.price).toFixed(2);
      const cheaper = products[0]!.price < products[1]!.price ? products[0]! : products[1]!;
      return `A **${cheaper.brand} ${cheaper.name}** é R$ ${diff} mais barata (${cheaper.currency} ${cheaper.price.toFixed(2)}).\n\nConsiderando o custo-benefício, a diferença de preço justifica as funcionalidades extras do modelo mais caro? Depende do seu uso! Se precisar, posso buscar outras opções na rede dentro do seu orçamento. 🔍`;
    }
    return "Cole o link de um produto no campo acima e depois adicione um segundo para comparar preços!";
  }

  if (lowerMsg.includes("avaliação") || lowerMsg.includes("review") || lowerMsg.includes("qualidade")) {
    if (hasTwo) {
      return `**Avaliações:**\n- ${products[0]!.brand}: ⭐ ${products[0]!.rating}/5 (${products[0]!.reviewCount} avaliações)\n- ${products[1]!.brand}: ⭐ ${products[1]!.rating}/5 (${products[1]!.reviewCount} avaliações)\n\nO **${products[1]!.brand}** tem avaliação ligeiramente superior, mas ambos são produtos excelentes com clientes satisfeitos. O volume maior de avaliações do ${products[0]!.brand} pode indicar mais tempo no mercado.`;
    }
    return "Adicione produtos usando os links para eu analisar as avaliações em detalhes!";
  }

  if (lowerMsg.includes("buscar") || lowerMsg.includes("alternativa") || lowerMsg.includes("opção")) {
    return `🔍 **Buscando alternativas na web...**\n\nEncontrei algumas opções interessantes:\n\n• **Sony X90L 55"** — R$ 2.499,99 | ⭐ 4.5 | Mini LED, Google TV\n• **Philips OLED 55"** — R$ 2.899,99 | ⭐ 4.4 | Ambilight, Android TV\n• **TCL C835 55"** — R$ 1.899,99 | ⭐ 4.3 | Mini LED, Google TV\n\nQuer que eu adicione alguma dessas opções à comparação?`;
  }

  if (lowerMsg.includes("burn") || lowerMsg.includes("durabilidade")) {
    return `Boa pergunta! O burn-in em TVs OLED é um risco real mas **muito exagerado** na prática.\n\nPara uso típico (filmes, séries, jogos variados), estudos mostram que levaria **mais de 10 anos** de uso intenso para causar burn-in visível. O LG também tem proteção automática contra isso.\n\nSe você deixa TV em canais com logo fixo por muitas horas/dia, prefira o QLED. Para uso normal, OLED é seguro. ✅`;
  }

  if (hasTwo) {
    return `Entendi! Com os dois produtos comparados, posso ajudar com:\n\n• 💰 Análise de custo-benefício\n• ⭐ Comparação de avaliações\n• 🔍 Buscar mais alternativas\n• 🎯 Recomendar com base no seu perfil de uso\n\nO que você prefere saber?`;
  }

  return `Olá! Sou o assistente de comparação de produtos. Posso ajudar com:\n\n• 🔍 Analisar produtos pelo link\n• ⚖️ Comparar dois produtos lado a lado\n• 💡 Recomendar a melhor escolha\n• 🌐 Buscar alternativas na web\n\nCole o link de um produto acima para começar!`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const half = !filled && i < rating;
    return { filled, half };
  });
  const sz = size === "sm" ? "text-sm" : "text-base";
  return (
    <span className={`inline-flex gap-0.5 ${sz}`}>
      {stars.map((s, i) => (
        <span key={i} className={s.filled ? "text-amber-400" : s.half ? "text-amber-300" : "text-[#2a3140]"}>
          ★
        </span>
      ))}
    </span>
  );
}

function Badge({ children, color = "default" }: { children: React.ReactNode; color?: "default" | "green" | "red" | "accent" }) {
  const colors = {
    default: "bg-[#1e242d] text-[#6b7585] border-[#2a3140]",
    green: "bg-green-950/50 text-green-400 border-green-800/40",
    red: "bg-red-950/50 text-red-400 border-red-800/40",
    accent: "bg-blue-950/50 text-[#4f8ef7] border-blue-800/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border ${colors[color]}`}>
      {children}
    </span>
  );
}

function ProductCard({
  product,
  onRemove,
  isWinner,
  compareProduct,
}: {
  product: Product;
  onRemove: () => void;
  isWinner?: boolean;
  compareProduct?: Product | null;
}) {
  const [tab, setTab] = useState<"overview" | "specs" | "reviews">("overview");

  const priceDiff =
    compareProduct ? ((product.price - compareProduct.price) / compareProduct.price) * 100 : 0;

  return (
    <div
      className={`relative flex flex-col bg-[#161a20] rounded-2xl border transition-all duration-300 overflow-hidden ${
        isWinner ? "border-[#4f8ef7] shadow-[0_0_40px_rgba(79,142,247,0.12)]" : "border-[#2a3140]"
      }`}
    >
      {isWinner && (
        <div className="absolute top-4 right-4 z-10">
          <Badge color="accent">⭐ Melhor escolha</Badge>
        </div>
      )}

      {/* Image */}
      <div className="relative h-52 bg-[#0d0f12] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161a20] via-transparent to-transparent" />
        <button
          onClick={onRemove}
          className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-[#6b7585] hover:text-white hover:bg-black/80 transition-all text-xs"
        >
          ✕
        </button>
      </div>

      {/* Header info */}
      <div className="px-5 pt-4 pb-3 border-b border-[#2a3140]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-[#6b7585] uppercase tracking-widest mb-0.5">{product.brand}</p>
            <h3 className="font-semibold text-base text-[#e8ecf2] leading-tight">{product.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-mono font-bold text-[#4f8ef7]">
              {product.currency} {product.price.toFixed(2)}
            </p>
            {product.originalPrice && (
              <p className="text-xs font-mono text-[#6b7585] line-through">
                {product.currency} {product.originalPrice.toFixed(2)}
              </p>
            )}
            {compareProduct && priceDiff !== 0 && (
              <p className={`text-xs font-mono ${priceDiff > 0 ? "text-red-400" : "text-green-400"}`}>
                {priceDiff > 0 ? "+" : ""}{priceDiff.toFixed(0)}%
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <StarRating rating={product.rating} />
          <span className="text-xs font-mono text-[#6b7585]">
            {product.rating} ({product.reviewCount.toLocaleString("pt-BR")})
          </span>
          <Badge color={product.inStock ? "green" : "red"}>
            {product.inStock ? "Em estoque" : "Indisponível"}
          </Badge>
        </div>

        <p className="text-xs text-[#6b7585] mt-1">via {product.store}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a3140]">
        {(["overview", "specs", "reviews"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors ${
              tab === t
                ? "text-[#4f8ef7] border-b-2 border-[#4f8ef7] -mb-px"
                : "text-[#6b7585] hover:text-[#e8ecf2]"
            }`}
          >
            {t === "overview" ? "Visão Geral" : t === "specs" ? "Especificações" : "Avaliações"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[220px]">
        {tab === "overview" && (
          <>
            <p className="text-sm text-[#adb5c3] leading-relaxed">{product.description}</p>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#6b7585] mb-2">Pontos positivos</p>
              <ul className="space-y-1.5">
                {product.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#adb5c3]">
                    <span className="text-green-400 mt-0.5 shrink-0">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#6b7585] mb-2">Pontos negativos</p>
              <ul className="space-y-1.5">
                {product.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#adb5c3]">
                    <span className="text-red-400 mt-0.5 shrink-0">−</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {tab === "specs" && (
          <div className="space-y-0">
            {Object.entries(product.specs).map(([key, val], i) => (
              <div
                key={key}
                className={`flex justify-between gap-4 py-2.5 text-xs ${
                  i < Object.keys(product.specs).length - 1 ? "border-b border-[#1e242d]" : ""
                }`}
              >
                <span className="font-mono text-[#6b7585] shrink-0">{key}</span>
                <span className="text-[#adb5c3] text-right">{val}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#e8ecf2]">{r.author}</span>
                  <span className="text-xs font-mono text-[#6b7585]">{r.date}</span>
                </div>
                <StarRating rating={r.rating} size="sm" />
                <p className="text-xs text-[#adb5c3] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-3 border-t border-[#2a3140]">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-[#4f8ef7] hover:bg-[#6ba3fa] text-white transition-colors"
        >
          Ver na loja →
        </a>
      </div>
    </div>
  );
}

function EmptyCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      onClick={onAdd}
      className="flex flex-col items-center justify-center bg-[#161a20] rounded-2xl border-2 border-dashed border-[#2a3140] cursor-pointer hover:border-[#4f8ef7] hover:bg-[#161a20]/80 transition-all group min-h-[420px]"
    >
      <div className="w-14 h-14 rounded-full bg-[#1e242d] group-hover:bg-[#4f8ef7]/10 border border-[#2a3140] group-hover:border-[#4f8ef7]/40 flex items-center justify-center text-[#6b7585] group-hover:text-[#4f8ef7] text-2xl transition-all mb-4">
        +
      </div>
      <p className="text-sm font-semibold text-[#6b7585] group-hover:text-[#e8ecf2] transition-colors">
        Adicionar produto
      </p>
      <p className="text-xs text-[#6b7585] mt-1">Cole o link do produto para comparar</p>
    </div>
  );
}

function AddProductModal({ onAdd, onClose }: { onAdd: (product: Product) => void; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    // Simulate fetch delay
    await new Promise((r) => setTimeout(r, 1800));
    onAdd(DEMO_PRODUCT_B);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#161a20] border border-[#2a3140] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-[#e8ecf2]">Adicionar produto para comparação</h2>
            <p className="text-xs text-[#6b7585] mt-0.5">Suporte: Amazon, Mercado Livre, Shopee, Magazine Luiza e mais</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b7585] hover:text-white hover:bg-[#1e242d] transition-all"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7585] text-sm">🔗</span>
            <input
              ref={inputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.com.br/produto..."
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d0f12] border border-[#2a3140] text-sm text-[#e8ecf2] placeholder:text-[#6b7585] focus:outline-none focus:border-[#4f8ef7] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-[#6b7585]">Ou experimente um exemplo:</div>
            <button
              type="button"
              onClick={() => setUrl("https://www.shopee.com.br/lg-oled-c4-55-4k")}
              className="text-xs text-[#4f8ef7] hover:underline font-mono"
            >
              LG OLED 55"
            </button>
          </div>

          <button
            type="submit"
            disabled={!url.trim() || loading}
            className="w-full py-3 rounded-xl bg-[#4f8ef7] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#6ba3fa] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analisando produto...
              </>
            ) : (
              "Analisar e adicionar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatPanel({
  messages,
  onSend,
  onClose,
}: {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const quickActions = [
    "Qual é o melhor custo-benefício?",
    "Compare as avaliações",
    "Buscar alternativas na web",
  ];

  return (
    <div className="flex flex-col h-full bg-[#161a20] border-l border-[#2a3140]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3140]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e8ecf2]">Assistente CompareAI</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6b7585] hover:text-white hover:bg-[#1e242d] transition-all text-xs"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                m.role === "user"
                  ? "bg-[#4f8ef7] text-white rounded-br-sm"
                  : "bg-[#1e242d] text-[#adb5c3] rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickActions.map((q) => (
            <button
              key={q}
              onClick={() => onSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#1e242d] border border-[#2a3140] text-[#6b7585] hover:text-[#4f8ef7] hover:border-[#4f8ef7]/40 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t border-[#2a3140]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre os produtos..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0d0f12] border border-[#2a3140] text-sm text-[#e8ecf2] placeholder:text-[#6b7585] focus:outline-none focus:border-[#4f8ef7] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#4f8ef7] disabled:opacity-30 hover:bg-[#6ba3fa] text-white transition-all shrink-0"
          >
            →
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── URL Input bar ─────────────────────────────────────────────────────────────

function UrlInputBar({ onAnalyze }: { onAnalyze: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    onAnalyze(url);
    setLoading(false);
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7585] text-sm pointer-events-none">🔗</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole o link do produto (Amazon, Mercado Livre, Shopee...)"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#161a20] border border-[#2a3140] text-sm text-[#e8ecf2] placeholder:text-[#6b7585] focus:outline-none focus:border-[#4f8ef7] transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={!url.trim() || loading}
        className="px-5 py-3 rounded-xl bg-[#4f8ef7] disabled:opacity-40 hover:bg-[#6ba3fa] text-white text-sm font-semibold transition-all flex items-center gap-2 shrink-0"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analisando...
          </>
        ) : (
          "Analisar"
        )}
      </button>
    </form>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [products, setProducts] = useState<(Product | null)[]>([DEMO_PRODUCT_A, null]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Olá! Sou o assistente CompareAI. Já identifiquei o primeiro produto. Adicione um segundo para eu comparar, ou me pergunte qualquer coisa sobre o produto atual!",
    },
  ]);

  const handleAddProduct = (product: Product) => {
    setProducts((prev) => {
      const next = [...prev];
      const emptyIdx = next.findIndex((p) => p === null);
      if (emptyIdx !== -1) next[emptyIdx] = product;
      return next;
    });
    setShowAddModal(false);
  };

  const handleRemoveProduct = (idx: number) => {
    setProducts((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  const handleFirstProductAnalyze = (url: string) => {
    void url;
    setProducts([DEMO_PRODUCT_A, products[1]]);
  };

  const handleChatSend = (msg: string) => {
    const userMsg: ChatMessage = { role: "user", text: msg };
    const assistantText = getAIResponse(msg, products);
    const assistantMsg: ChatMessage = { role: "assistant", text: assistantText };
    setChatMessages((prev) => [...prev, userMsg, assistantMsg]);
    if (!chatOpen) setChatOpen(true);
  };

  const filledCount = products.filter(Boolean).length;
  const winner =
    products[0] && products[1]
      ? products[0].rating > products[1].rating
        ? 0
        : products[0].price < products[1].price
        ? 0
        : 1
      : null;

  return (
    <div className="flex flex-col h-screen bg-[#0d0f12] overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#2a3140] bg-[#0d0f12]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold">
            C
          </div>
          <span className="text-sm font-bold tracking-tight text-[#e8ecf2]">CompareAI</span>
          <span className="text-xs font-mono text-[#6b7585] ml-1">/ comparação de produtos</span>
        </div>

        <div className="flex items-center gap-2">
          {filledCount > 0 && (
            <Badge color="accent">
              {filledCount} {filledCount === 1 ? "produto" : "produtos"} analisado{filledCount > 1 ? "s" : ""}
            </Badge>
          )}
          <button
            onClick={() => setChatOpen((o) => !o)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              chatOpen
                ? "bg-[#4f8ef7]/10 border-[#4f8ef7]/40 text-[#4f8ef7]"
                : "bg-[#1e242d] border-[#2a3140] text-[#6b7585] hover:text-[#e8ecf2] hover:border-[#4f8ef7]/40"
            }`}
          >
            <span>💬</span>
            Assistente IA
          </button>
        </div>
      </header>

      {/* ── URL Bar ── */}
      {filledCount === 0 && (
        <div className="shrink-0 px-6 py-4 border-b border-[#2a3140] bg-[#0d0f12]">
          <UrlInputBar onAnalyze={handleFirstProductAnalyze} />
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products area */}
        <main className="flex-1 overflow-y-auto p-6">
          {filledCount === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4f8ef7] to-[#7c3aed] flex items-center justify-center text-white text-2xl">
                ⚖️
              </div>
              <h1 className="text-2xl font-bold text-[#e8ecf2]">Compare antes de comprar</h1>
              <p className="text-sm text-[#6b7585] leading-relaxed">
                Cole o link de qualquer produto da Amazon, Mercado Livre, Shopee ou Magalu. Nossa IA analisa preço, avaliações
                e qualidade para você decidir com confiança.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-[#6b7585]">
                <span>✓ Análise automática</span>
                <span>✓ Comparação lado a lado</span>
                <span>✓ Assistente IA</span>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-5 h-full ${
                products[1] || !products[0] ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-lg mx-auto"
              }`}
            >
              {products.map((product, idx) =>
                product ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onRemove={() => handleRemoveProduct(idx)}
                    isWinner={winner === idx}
                    compareProduct={products[idx === 0 ? 1 : 0]}
                  />
                ) : (
                  <EmptyCard key={`empty-${idx}`} onAdd={() => setShowAddModal(true)} />
                )
              )}
            </div>
          )}

          {/* Comparison summary bar */}
          {products[0] && products[1] && (
            <div className="mt-5 p-4 rounded-2xl bg-[#161a20] border border-[#2a3140] grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs font-mono uppercase tracking-widest text-[#6b7585] mb-1">Diferença de preço</p>
                <p className="text-base font-mono font-bold text-[#e8ecf2]">
                  R$ {Math.abs(products[0].price - products[1].price).toFixed(2)}
                </p>
                <p className="text-xs text-[#6b7585]">
                  {products[0].price < products[1].price ? products[0].brand : products[1].brand} é mais barato
                </p>
              </div>
              <div className="text-center border-x border-[#2a3140]">
                <p className="text-xs font-mono uppercase tracking-widest text-[#6b7585] mb-1">Melhor avaliado</p>
                <p className="text-base font-mono font-bold text-amber-400">
                  ⭐ {Math.max(products[0].rating, products[1].rating)}
                </p>
                <p className="text-xs text-[#6b7585]">
                  {products[0].rating >= products[1].rating ? products[0].brand : products[1].brand}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-mono uppercase tracking-widest text-[#6b7585] mb-1">Recomendação IA</p>
                <p className="text-base font-semibold text-[#4f8ef7]">
                  {winner !== null ? products[winner]?.brand : "—"}
                </p>
                <button
                  onClick={() => handleChatSend("Qual é o melhor custo-benefício?")}
                  className="text-xs text-[#6b7585] hover:text-[#4f8ef7] transition-colors"
                >
                  Ver análise completa →
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── Chat panel ── */}
        {chatOpen && (
          <aside className="w-80 shrink-0 border-l border-[#2a3140] flex flex-col">
            <ChatPanel
              messages={chatMessages}
              onSend={handleChatSend}
              onClose={() => setChatOpen(false)}
            />
          </aside>
        )}
      </div>

      {/* ── Bottom chat trigger (when chat is closed) ── */}
      {!chatOpen && filledCount > 0 && (
        <div className="shrink-0 px-6 py-3 border-t border-[#2a3140] bg-[#0d0f12]">
          <button
            onClick={() => setChatOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#161a20] border border-[#2a3140] hover:border-[#4f8ef7]/40 transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#7c3aed] flex items-center justify-center text-white text-xs shrink-0">
              AI
            </div>
            <span className="text-sm text-[#6b7585] group-hover:text-[#adb5c3] transition-colors flex-1 text-left">
              Peça ajuda ao assistente de IA...
            </span>
            <span className="text-xs font-mono text-[#6b7585]">↑</span>
          </button>
        </div>
      )}

      {/* ── Add product modal ── */}
      {showAddModal && (
        <AddProductModal onAdd={handleAddProduct} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
