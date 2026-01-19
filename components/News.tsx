
import React from 'react';

const STATIC_NEWS = [
  {
    title: "Comprendre les Cycles de Marché",
    summary: "Les marchés financiers ne montent pas en ligne droite. Apprenez à identifier les phases d'accumulation et de distribution pour optimiser vos entrées.",
    source: "ZenÉducation",
    link: "#"
  },
  {
    title: "L'Importance du Rééquilibrage",
    summary: "Un portefeuille qui dévie de son allocation cible devient plus risqué. Rééquilibrer une fois par an permet de maintenir votre profil de risque.",
    source: "Stratégie",
    link: "#"
  },
  {
    title: "Fiscalité : Les Enjeux de 2024",
    summary: "Optimisez vos enveloppes fiscales (PEA, Assurance Vie) avant de diversifier sur des comptes titres ordinaires plus taxés.",
    source: "Fiscalité",
    link: "#"
  }
];

const News: React.FC = () => {
  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-10">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">ZenÉducation 📚</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Les clés pour devenir un investisseur serein
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {STATIC_NEWS.map((item, idx) => (
            <div key={idx} className="group p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[2.5rem] transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 flex gap-6">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-2xl">📖</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-lg text-slate-800 dark:text-white leading-tight">{item.title}</h4>
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{item.source}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
