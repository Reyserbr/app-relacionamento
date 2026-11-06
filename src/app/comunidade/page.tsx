"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Post {
  id: string;
  apelido: string;
  categoria: string;
  tempo: string;
  titulo: string;
  relato: string;
  likes: number;
}

const INITIAL_POSTS: Post[] = [
  {
    id: "p1",
    apelido: "Anônima • 28 anos",
    categoria: "Vitória na Reconquista",
    tempo: "Há 3 horas",
    titulo: "14 dias de Vácuo Magnético e ele veio atrás pedindo desculpas!",
    relato:
      "Gente, eu jurava que o meu caso não tinha volta porque ele tinha dito que não sentia mais o mesmo. Segui exatamente o protocolo de descompressão que a Especialista em Reconquista me passou, parei de cobrar e postei só os stories de bastidor. Hoje de manhã ele respondeu meu story e perguntou se podia me ver hoje à noite!",
    likes: 47,
  },
  {
    id: "p2",
    apelido: "Anônimo • 33 anos",
    categoria: "Virada de Jogo",
    tempo: "Há 7 horas",
    titulo: "A regra do espelho salvou minha dignidade",
    relato:
      "Ela estava me respondendo super seca há uma semana. Mandei o print pra Lilith e ela me explicou na hora que eu estava entregando validação de graça. Usei a resposta curta de inversão de polo e sumi no fim de semana. Pela primeira vez em meses foi ela quem mandou 4 mensagens seguidas puxando assunto.",
    likes: 39,
  },
  {
    id: "p3",
    apelido: "Anônima • 25 anos",
    categoria: "Alerta de Red Flag",
    tempo: "Ontem",
    titulo: "Me livrei de um narcisista graças ao scanner de conversa",
    relato:
      "O cara fazia love bombing pesado e depois sumia por 3 dias dizendo que o celular tinha dado problema. Quando joguei a conversa no Detector de Red Flags, a Lilith desmontou cada desculpa dele. Cortei na hora e descobri dois dias depois que ele fazia exatamente o mesmo roteiro com outras.",
    likes: 64,
  },
];

export default function ComunidadePage() {
  const [communityOpen, setCommunityOpen] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("Vitória na Reconquista");
  const [novoRelato, setNovoRelato] = useState("");
  const [enviadoMsg, setEnviadoMsg] = useState("");

  useEffect(() => {
    fetch("/api/affiliate/config")
      .then((r) => r.json())
      .then((cfg) => {
        setCommunityOpen(Boolean(cfg?.communityOpen));
      })
      .catch(() => setCommunityOpen(false));
  }, []);

  const handleLike = (id: string) => {
    if (likedIds.includes(id)) return;
    setLikedIds([...likedIds, id]);
    setPosts(posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  const handleEnviarRelato = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novoRelato.trim()) return;
    const novo: Post = {
      id: Date.now().toString(),
      apelido: "Membro Anônimo(a)",
      categoria: novaCategoria,
      tempo: "Agora mesmo",
      titulo: novoTitulo.trim(),
      relato: novoRelato.trim(),
      likes: 1,
    };
    setPosts([novo, ...posts]);
    setNovoTitulo("");
    setNovoRelato("");
    setEnviadoMsg("✨ Seu relato anônimo foi publicado no mural!");
    setTimeout(() => setEnviadoMsg(""), 4000);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#faf7f5] text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {communityOpen === false ? (
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 flex items-center justify-center mx-auto mb-5 text-3xl">
              🤫
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-3">
              Comunidade Secreta em Preparação
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-8">
              O mural anônimo de experiências e vitórias dos membros da LilithLove está temporariamente fechado e será liberado em breve pelo administrador.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-rose-900 hover:bg-rose-800 text-white px-6 py-3 rounded-full text-sm font-semibold shadow"
            >
              ← Voltar ao Início
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block mb-1">
                100% Anônimo & Seguro
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
                Comunidade & Mural de Vitórias
              </h1>
              <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 mt-1">
                Compartilhe sua experiência sem revelar seu nome real e veja como outros membros estão aplicando as estratégias.
              </p>
            </div>

            {/* Formulário de Novo Relato Anônimo */}
            <form
              onSubmit={handleEnviarRelato}
              className="bg-white dark:bg-[#1c1016] rounded-3xl border border-stone-200/80 dark:border-rose-400/20 p-5 sm:p-6 mb-8 shadow-sm space-y-3.5"
            >
              <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                ✍️ Contar minha experiência (Seu nome não aparece)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <input
                  type="text"
                  placeholder="Título do seu relato..."
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="sm:col-span-2 rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10"
                />
                <select
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className="rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                >
                  <option value="Vitória na Reconquista">Vitória na Reconquista</option>
                  <option value="Virada de Jogo">Virada de Jogo</option>
                  <option value="Alerta de Red Flag">Alerta de Red Flag</option>
                  <option value="Desabafo & Contato Zero">Desabafo & Contato Zero</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Conte o que aconteceu e qual estratégia você usou..."
                value={novoRelato}
                onChange={(e) => setNovoRelato(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-xs sm:text-sm"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-stone-400">
                  🔒 Publicado automaticamente como Membro Anônimo(a)
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 dark:bg-rose-600 text-white text-xs sm:text-sm font-bold shadow"
                >
                  Publicar Relato Anônimo
                </button>
              </div>
              {enviadoMsg && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {enviadoMsg}
                </p>
              )}
            </form>

            {/* Lista de Relatos */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#1c1016] rounded-3xl border border-stone-200/80 dark:border-white/10 p-5 sm:p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                        {post.apelido}
                      </span>
                      <span className="text-xs text-stone-400">• {post.tempo}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300">
                      {post.categoria}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-white mb-2">
                    {post.titulo}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                    {post.relato}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                      likedIds.includes(post.id)
                        ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-300"
                        : "bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-white/10 hover:bg-rose-50"
                    }`}
                  >
                    <span>❤️</span>
                    <span>Me identifiquei ({post.likes})</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}