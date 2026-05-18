import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Ruby } from '../components/ui/Ruby';
import { ChevronLeft, Sparkles } from 'lucide-react';

// 全17種類の図鑑候補
const GALLERY_ITEMS = [
  { category: '🌲 き', name: 'もりの大木', emoji: '🌳', desc: 'もりのまもり神のような大きなきだよ！' },
  { category: '🌲 き', name: 'もみの木', emoji: '🌲', desc: 'ギザギザしたかっこいいきだよ！' },
  { category: '🌲 き', name: 'ヤシの木', emoji: '🌴', desc: 'みなみのくににある、たのしいきだよ！' },
  { category: '🌲 き', name: 'もみじ', emoji: '🍁', desc: 'あかくてとってもきれいなはっぱだよ！' },
  { category: '🌲 き', name: 'さくら', emoji: '🌸', desc: 'はるになるとピンクの花がさくよ！' },
  
  { category: '🦊 どうぶつ', name: 'キツネさん', emoji: '🦊', desc: 'おめめがかわいくて、かけっこがとくい！' },
  { category: '🦊 どうぶつ', name: 'ウサギさん', emoji: '🐰', desc: 'おみみがながくて、ぴょんぴょんはねるよ！' },
  { category: '🦊 どうぶつ', name: 'リスさん', emoji: '🐿️', desc: 'ほっぺにどんぐりをたくさんためるよ！' },
  { category: '🦊 どうぶつ', name: '小鳥さん', emoji: '🐦', desc: 'きれいなこえでチチチとさえずるよ！' },
  { category: '🦊 どうぶつ', name: 'くまさん', emoji: '🐻', desc: 'ちからもちで、ハチミツがだいすき！' },
  { category: '🦊 どうぶつ', name: 'フクロウさん', emoji: '🦉', desc: 'もりのものしりはかせ。よるにおきているよ！' },
  
  { category: '🍄 おうち', name: '木の家', emoji: '🏡', desc: 'もりのきで作られた、あったかいおうち！' },
  { category: '🍄 おうち', name: 'テント', emoji: '🛖', desc: 'キャンプをするための、かっこいいおうち！' },
  { category: '🍄 おうち', name: 'きのこの家', emoji: '🍄', desc: 'ようせいたちがすんでいる、ふしぎなおうち！' },
  
  { category: '🌊 しぜん', name: 'ちいさな川', emoji: '🌊', desc: 'きれいなお水がさらさら流れているよ！' },
  { category: '🌊 しぜん', name: 'もりの噴水', emoji: '⛲', desc: 'お水がピュッピュとふきだす、たのしい広場！' },
  { category: '🌊 しぜん', name: '木の橋', emoji: '🪵', desc: '川のむこうにわたるための、やさしい木の橋！' },
];

export const ForestGallery: React.FC = () => {
  const navigate = useNavigate();
  const { forestObjects, discoveredObjects, addDiscoveredObject, seeds } = useStore();

  // マウント時に、現在森に実在しているオブジェクトを自動的に発見済みに同期クレンジングする
  useEffect(() => {
    forestObjects.forEach(obj => {
      if (obj.name && !discoveredObjects.includes(obj.name)) {
        addDiscoveredObject(obj.name);
      }
    });
  }, [forestObjects, discoveredObjects, addDiscoveredObject]);

  const totalCount = GALLERY_ITEMS.length;
  const discoveredCount = GALLERY_ITEMS.filter(item => discoveredObjects.includes(item.name)).length;
  const percent = Math.round((discoveredCount / totalCount) * 100);

  // カテゴリごとに分割
  const categories = Array.from(new Set(GALLERY_ITEMS.map(item => item.category)));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-green-100 p-5">
      {/* ヘッダー */}
      <header className="flex items-center gap-3 mb-6 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="w-10 h-10 p-0 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all border border-green-200"
        >
          <ChevronLeft size={24} className="text-emerald-700" />
        </Button>
        <h1 className="text-xl font-black text-emerald-900 flex items-center gap-1.5 drop-shadow-sm">
          <span>🌳</span>
          <Ruby kanji="森" furigana="もり" />のなかま<Ruby kanji="図鑑" furigana="ずかん" />
        </h1>
      </header>

      <main className="flex-1 flex flex-col space-y-5 overflow-y-auto pb-10">
        
        {/* 全体しんちょくステータスカード */}
        <div className="bg-white rounded-3xl p-5 border-4 border-emerald-200 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✨ しんちょく
              </span>
              <h2 className="text-2xl font-black text-emerald-900">
                {discoveredCount} <span className="text-base font-bold text-gray-500">/ {totalCount}しゅるい</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-amber-500 drop-shadow-sm">{percent}%</span>
              <p className="text-[10px] font-bold text-gray-400">あつまったよ！</p>
            </div>
          </div>

          {/* 進捗ゲージ */}
          <div className="relative w-full h-5 bg-green-100 rounded-full overflow-hidden border-2 border-green-200">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-1000 relative"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-pulse" />
            </div>
          </div>

          {/* 種の表示 */}
          <div className="bg-emerald-50 bg-opacity-70 rounded-2xl p-3 flex justify-between items-center border border-emerald-100">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              🌱 もっている「たね」：
            </span>
            <span className="text-lg font-extrabold text-amber-600 bg-white px-3 py-0.5 rounded-full border border-amber-200 shadow-sm">
              {seeds} こ
            </span>
          </div>
        </div>

        {/* 図鑑リスト */}
        {categories.map(cat => {
          const catItems = GALLERY_ITEMS.filter(item => item.category === cat);
          return (
            <div key={cat} className="space-y-2">
              <h3 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 px-1">
                <span>{cat === '🌲 き' ? '🌲' : cat === '🦊 どうぶつ' ? '🦊' : cat === '🍄 おうち' ? '🍄' : '🌊'}</span>
                {cat.replace(/^[^\s]+\s+/, '')}
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {catItems.map(item => {
                  const isFound = discoveredObjects.includes(item.name);
                  return (
                    <div
                      key={item.name}
                      className={`
                        p-3.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden shadow-sm
                        ${isFound 
                          ? 'bg-white border-green-300 text-emerald-950 scale-100' 
                          : 'bg-gray-100/80 border-gray-200 text-gray-400 select-none'}
                      `}
                    >
                      {/* キラキラ飾り (発見時のみ) */}
                      {isFound && (
                        <Sparkles size={12} className="absolute top-2 right-2 text-amber-400 animate-pulse" />
                      )}

                      {/* アイコン */}
                      <span className={`text-4.5xl my-2 transition-all duration-500 ${isFound ? 'animate-pulse-slow active:scale-125' : 'opacity-20 filter grayscale'}`}>
                        {isFound ? item.emoji : '❓'}
                      </span>

                      {/* 名前 */}
                      <span className="text-xs font-black tracking-tight leading-tight">
                        {isFound ? item.name : '？？？'}
                      </span>

                      {/* 説明 (発見時のみ) */}
                      {isFound ? (
                        <span className="text-[9px] text-gray-400 mt-1 font-bold leading-tight block h-6 overflow-hidden">
                          {item.desc}
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 mt-1 block">
                          たねをまいてみつけよう
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      </main>
    </div>
  );
};
