import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-stone-50 text-stone-800 font-sans selection:bg-rose-200">
      {/* Mantemos a Navbar original por enquanto para não quebrar a autenticação */}
      <Navbar />

      <div className="w-full max-w-5xl px-6 py-12 sm:py-20 mx-auto flex flex-col items-center">
        
        {/* Hero Section - Apresentação Limpa e Acolhedora */}
        <div className="text-center max-w-3xl mb-12 mt-8">
          <h1 className="text-5xl sm:text-7xl font-serif font-bold tracking-tight text-stone-900 mb-6">
            LilithLove
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed text-stone-600 mb-10">
            Sua conselheira amorosa e guia de inteligência emocional. 
            Um espaço seguro e acolhedor para todas as formas de amar. 
            Analise conversas, melhore seus relacionamentos e saiba exatamente como agir.
          </p>
          
          {/* Chips - Ações Rápidas (Aba 1 do seu escopo) */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button className="px-6 py-3 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2">
              <span className="text-xl">💬</span> Preciso de um conselho
            </button>
            <button className="px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2">
              <span className="text-xl">🔍</span> Analisar uma conversa
            </button>
            <button className="px-6 py-3 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2">
              <span className="text-xl">✍️</span> O que respondo agora?
            </button>
          </div>
        </div>

        {/* Ferramentas Inteligentes - Grid de Funil (Aba 2 do seu escopo) */}
        <div className="w-full mt-16">
          <h2 className="text-3xl font-serif font-semibold text-stone-800 mb-8 text-center">
            Ferramentas Inteligentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-start group">
              <div className="bg-stone-50 p-3 rounded-2xl mb-5 group-hover:scale-110 transition-transform">👋</div>
              <h3 className="text-xl font-semibold mb-3 text-stone-800">Primeiro Contato</h3>
              <p className="text-stone-500 leading-relaxed">Mensagens e abordagens perfeitas para puxar assunto e gerar interesse real e recíproco.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-start group">
              <div className="bg-stone-50 p-3 rounded-2xl mb-5 group-hover:scale-110 transition-transform">🚩</div>
              <h3 className="text-xl font-semibold mb-3 text-stone-800">Detector de Red Flags</h3>
              <p className="text-stone-500 leading-relaxed">Analise o perfil e o comportamento nas mensagens para identificar sinais de alerta precocemente.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-start group">
              <div className="bg-stone-50 p-3 rounded-2xl mb-5 group-hover:scale-110 transition-transform">🥂</div>
              <h3 className="text-xl font-semibold mb-3 text-stone-800">Pós-Encontro</h3>
              <p className="text-stone-500 leading-relaxed">Saiba exatamente o que mandar depois de sair para manter a conexão viva sem parecer desesperado(a).</p>
            </div>

            {/* Card 4 - Premium/Destaque (O Motor de Vendas) */}
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-8 rounded-3xl shadow-sm border border-rose-200 hover:shadow-md transition-all cursor-pointer flex flex-col items-start relative overflow-hidden group">
              <div className="absolute top-6 right-6 bg-rose-900 text-rose-50 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                Alta Eficácia
              </div>
              <div className="bg-white/60 p-3 rounded-2xl mb-5 group-hover:scale-110 transition-transform">❤️‍🩹</div>
              <h3 className="text-xl font-semibold text-rose-900 mb-3">Reconectar / Reconquistar</h3>
              <p className="text-rose-800/80 leading-relaxed pr-12">O módulo urgente. Como voltar a falar depois de um tempo, com estratégias de reversão de crise guiadas por IA.</p>
            </div>

          </div>
        </div>
        
        {/* Trilhas de Aprendizado - Teaser de Retenção (Aba 3 do seu escopo) */}
        <div className="w-full mt-24 pt-16 border-t border-stone-200 text-center">
          <span className="text-rose-600 font-semibold tracking-wider uppercase text-sm mb-4 block">Exclusivo Assinantes</span>
          <h2 className="text-3xl font-serif font-semibold text-stone-800 mb-8">
            Trilhas de Desenvolvimento
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-4 bg-white border border-stone-100 shadow-sm rounded-2xl text-stone-600 font-medium">✨ Ame a Si Mesmo Primeiro</div>
            <div className="px-6 py-4 bg-white border border-stone-100 shadow-sm rounded-2xl text-stone-600 font-medium">🛑 Contato Zero na Prática</div>
            <div className="px-6 py-4 bg-white border border-stone-100 shadow-sm rounded-2xl text-stone-600 font-medium">🔥 Desperte sua Confiança</div>
          </div>
        </div>

      </div>
    </main>
  );
}