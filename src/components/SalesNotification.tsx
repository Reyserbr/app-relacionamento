"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NOMES_COMPRADORES = [
  "Amanda S.", "Beatriz M.", "Camila R.", "Carolina F.", "Juliana P.", "Fernanda L.", "Mariana C.", "Letícia A.", "Gabriela T.", "Larissa V.",
  "Bruna G.", "Natália O.", "Isabela N.", "Patrícia B.", "Aline D.", "Vanessa K.", "Priscila H.", "Tatiane S.", "Renata M.", "Jéssica R.",
  "Bianca L.", "Débora C.", "Sabrina F.", "Raquel P.", "Luana A.", "Thaís V.", "Evelyn G.", "Cintia O.", "Helena N.", "Mônica B.",
  "Lucas M.", "Gabriel S.", "Rafael C.", "Matheus R.", "Gustavo F.", "Felipe P.", "Bruno L.", "Leonardo A.", "Thiago V.", "Rodrigo G.",
  "Diego O.", "André N.", "Marcelo B.", "Eduardo D.", "Vitor K.", "Henrique H.", "Caio S.", "Igor M.", "Daniel R.", "Leandro L.",
  "Paula C.", "Adriana F.", "Simone P.", "Cristiane A.", "Eliane V.", "Fabiana G.", "Gisele O.", "Luciana N.", "Marcia B.", "Sandra D.",
  "Talita K.", "Viviane H.", "Yasmin S.", "Mirella M.", "Lorena R.", "Clara L.", "Valentina C.", "Heloísa F.", "Lívia P.", "Giovanna A.",
  "Milena V.", "Bárbara G.", "Pietra O.", "Flávia N.", "Karina B.", "Kelly D.", "Lilian K.", "Michele H.", "Nádia S.", "Paloma M.",
  "Rafaela R.", "Samara L.", "Tamires C.", "Úrsula F.", "Verônica P.", "Wanessa A.", "Tainá V.", "Maiara G.", "Marília O.", "Jaqueline N.",
  "Alexandre B.", "Antônio D.", "Arthur K.", "Bernardo H.", "César S.", "Davi M.", "Emanuel R.", "Fabrício L.", "Guilherme C.", "Heitor F.",
  "Ícaro P.", "João Pedro A.", "Kauã V.", "Lorenzo G.", "Murilo O.", "Nicolas N.", "Otávio B.", "Pedro H.", "Renan S.", "Samuel M.",
  "Breno R.", "Cauã L.", "Danilo C.", "Enzo F.", "Fábio P.", "Gilberto A.", "Hugo V.", "Ivan G.", "Jorge O.", "Kleber N.",
  "Luan B.", "Maurício D.", "Natan K.", "Orlando H.", "Paulo S.", "Ruan M.", "Sérgio R.", "Túlio L.", "Ubirajara C.", "Vinícius F.",
  "Wagner P.", "Yuri A.", "Zeca V.", "Clara M.", "Bia S.", "Dani R.", "Maju L.", "Gabi C.", "Ju F.", "Carol P.",
  "Rê A.", "Mari V.", "Lê G.", "Nati O.", "Isa N.", "Pati B.", "Lari D.", "Fê K.", "Cami H.", "Tati S.",
  "Gui M.", "Léo R.", "Rafa L.", "Mat C.", "Fê F.", "Bê P.", "Thi A.", "Rod V.", "Edu G.", "Vini O."
];

const CIDADES = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Porto Alegre, RS",
  "Salvador, BA", "Fortaleza, CE", "Recife, PE", "Brasília, DF", "Goiânia, GO",
  "Florianópolis, SC", "Campinas, SP", "Vitória, ES", "Manaus, AM", "Natal, RN",
  "João Pessoa, PB", "Maceió, AL", "Santos, SP", "Ribeirão Preto, SP", "Uberlândia, MG"
];

const ACOES = [
  "acabou de desbloquear o Acesso VIP Ilimitado",
  "ativou o Protocolo de Reconquista Premium",
  "desbloqueou a Mensagem Cirúrgica da Lilith",
  "assinou o Plano Premium e liberou o Oráculo",
  "ativou o Acesso Completo às Trilhas e IAs"
];

const TEMPOS = ["agora mesmo", "há 1 minuto", "há 2 minutos", "há 3 minutos", "há alguns segundos"];

export default function SalesNotification() {
  const [isPremium, setIsPremium] = useState(true); // Inicia oculto até confirmar que é Free
  const [enabledByAdmin, setEnabledByAdmin] = useState(true);
  const [visible, setVisible] = useState(false);
  const [currentSale, setCurrentSale] = useState({
    nome: "Mariana C.",
    cidade: "São Paulo, SP",
    acao: "acabou de desbloquear o Acesso VIP Ilimitado",
    tempo: "agora mesmo",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("lilith_vip_test") === "true") {
      setIsPremium(true);
      return;
    }

    Promise.all([
      fetch("/api/status").then((r) => r.json()).catch(() => ({ isPremium: false })),
      fetch("/api/affiliate/config").then((r) => r.json()).catch(() => ({ salesPopupOpen: true })),
    ]).then(([statusData, configData]) => {
      setIsPremium(Boolean(statusData?.isPremium));
      if (typeof configData?.salesPopupOpen === "boolean") {
        setEnabledByAdmin(configData.salesPopupOpen);
      }
    });
  }, []);

  useEffect(() => {
    if (isPremium || !enabledByAdmin) return;

    const triggerRandomSale = () => {
      const nome = NOMES_COMPRADORES[Math.floor(Math.random() * NOMES_COMPRADORES.length)];
      const cidade = CIDADES[Math.floor(Math.random() * CIDADES.length)];
      const acao = ACOES[Math.floor(Math.random() * ACOES.length)];
      const tempo = TEMPOS[Math.floor(Math.random() * TEMPOS.length)];

      setCurrentSale({ nome, cidade, acao, tempo });
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 5500);
    };

    const initialTimer = setTimeout(triggerRandomSale, 6000);
    const interval = setInterval(triggerRandomSale, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isPremium, enabledByAdmin]);

  if (isPremium || !enabledByAdmin || !visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-[320px] sm:max-w-xs bg-white/95 dark:bg-[#1c1016]/95 backdrop-blur-md border border-rose-200 dark:border-rose-400/30 rounded-2xl p-3.5 shadow-2xl transition-all duration-500 animate-bounce-short">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-900 to-rose-600 text-white flex items-center justify-center text-base shrink-0 shadow-sm mt-0.5">
          👑
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
              {currentSale.nome} <span className="font-normal text-[10px] text-stone-400">({currentSale.cidade})</span>
            </p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="text-[10px] text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug mt-0.5">
            {currentSale.acao}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Compra verificada • {currentSale.tempo}
            </span>
            <Link
              href="/planos"
              className="text-[10px] font-bold text-rose-700 dark:text-rose-400 hover:underline"
            >
              Ver VIP →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}