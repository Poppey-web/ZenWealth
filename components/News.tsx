
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  link: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(localStorage.getItem('zen_news_timestamp'));

  const fetchNews = async (force = false) => {
    const cached = localStorage.getItem('zen_news_data');
    const timestamp = localStorage.getItem('zen_news_timestamp');
    const now = new Date().getTime();

    // Si on a du cache de moins de 24h et qu'on ne force pas, on utilise le cache
    if (!force && cached && timestamp && (now - parseInt(timestamp)) < 24 * 60 * 60 * 1000) {
      setNews(JSON.parse(cached));
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Quelles sont les 5 actualités économiques et géopolitiques mondiales les plus importantes ? Pour chaque news, donne un titre court, un résumé de 2 phrases et mentionne la source probable. Réponds au format JSON: Array<{title: string, summary: string, source: string, link: string}>",
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      
      const text = response.text || "[]";
      const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
      const parsedNews = JSON.parse(jsonStr);
      
      setNews(parsedNews);
      localStorage.setItem('zen_news_data', JSON.stringify(parsedNews));
      localStorage.setItem('zen_news_timestamp', now.toString());
      setLastUpdate(new Date(now).toLocaleString());
    } catch (e) {
      console.error(e);
      if (!cached) {
        setNews([{
          title: "Marchés et Géopolitique",
          summary: "Les tensions macroéconomiques persistent. Les investisseurs restent prudents face aux décisions des banques centrales.",
          source: "ZenIA Echo",
          link: "#"
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Pulse Économique ⚡</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Dernière mise à jour : {lastUpdate ? lastUpdate : 'Jamais'}
            </p>
          </div>
          <button 
            onClick={() => fetchNews(true)} 
            disabled={loading} 
            className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {loading ? 'Décryptage...' : 'Mettre à jour'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {news.map((item, idx) => (
            <div key={idx} className="group p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[2.5rem] transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 flex gap-6">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🗞️</div>
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
