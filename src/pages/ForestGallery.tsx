import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Ruby } from '../components/ui/Ruby';
import { ChevronLeft, Sparkles } from 'lucide-react';

// 全55種類の図鑑候補
export const GALLERY_ITEMS = [
  // --- き（全13種類） ---
  { category: '🌲 き', name: 'もりの大木', emoji: '🌳', desc: 'もりのまもり神のような大きなきだよ！' },
  { category: '🌲 き', name: 'もみの木', emoji: '🌲', desc: 'ギザギザしたかっこいいきだよ！' },
  { category: '🌲 き', name: 'ヤシの木', emoji: '🌴', desc: 'みなみのくににある、たのしいきだよ！' },
  { category: '🌲 き', name: 'もみじ', emoji: '🍁', desc: 'あかくてとってもきれいなはっぱだよ！' },
  { category: '🌲 き', name: 'さくら', emoji: '🌸', desc: 'はるになるとピンクの花がさくよ！' },
  { category: '🌲 き', name: 'サボテン', emoji: '🌵', desc: 'さばくのサボテン。トゲトゲだけどやさしいよ！' },
  { category: '🌲 き', name: 'ひまわり', emoji: '🌻', desc: 'おひさまにむかって元気にさく、きいろいお花！' },
  { category: '🌲 き', name: 'チューリップ', emoji: '🌷', desc: 'あかやきいろ、カラフルでかわいいお花だよ！' },
  { category: '🌲 き', name: 'バラ', emoji: '🌹', desc: 'ちょっとオトナな雰囲気の、きれいなお花だよ！' },
  { category: '🌲 き', name: 'りんごの木', emoji: '🍎', desc: 'あまくておいしいりんごがたくさん実るよ！' },
  { category: '🌲 き', name: 'バナナの木', emoji: '🍌', desc: '南国のきいろくてあまーいバナナがなっているよ！' },
  { category: '🌲 き', name: 'クローバー', emoji: '🍀', desc: 'みつけるとハッピーになれるかもしれないよ！' },
  { category: '🌲 き', name: 'たけのこ', emoji: '🎍', desc: 'ぐんぐんのびて、つよくて青い竹になるよ！' },
  
  // --- どうぶつ（全20種類） ---
  { category: '🦊 どうぶつ', name: 'キツネさん', emoji: '🦊', desc: 'おめめがかわいくて、かけっこがとくい！' },
  { category: '🦊 どうぶつ', name: 'ウサギさん', emoji: '🐰', desc: 'おみみがながくて、ぴょんぴょんはねるよ！' },
  { category: '🦊 どうぶつ', name: 'リスさん', emoji: '🐿️', desc: 'ほっぺにどんぐりをたくさんためるよ！' },
  { category: '🦊 どうぶつ', name: '小鳥さん', emoji: '🐦', desc: 'きれいなこえでチチチとさえずるよ！' },
  { category: '🦊 どうぶつ', name: 'くまさん', emoji: '🐻', desc: 'ちからもちで、ハチミツがだいすき！' },
  { category: '🦊 どうぶつ', name: 'フクロウさん', emoji: '🦉', desc: 'もりのものしりはかせ。よるにおきているよ！' },
  { category: '🦊 どうぶつ', name: 'ネコさん', emoji: '🐱', desc: '日向ぼっこが大好きで、のんびりやさんだよ！' },
  { category: '🦊 どうぶつ', name: 'イヌさん', emoji: '🐶', desc: 'しっぽをふって、かけっこが大好きなお友達！' },
  { category: '🦊 どうぶつ', name: 'コアラさん', emoji: '🐨', desc: 'ユーカリの木の上で、いつもすやすや眠っているよ！' },
  { category: '🦊 どうぶつ', name: 'パンダさん', emoji: '🐼', desc: '笹（ささ）の葉をムシャムシャ食べるのが大好き！' },
  { category: '🦊 どうぶつ', name: 'ライオンさん', emoji: '🦁', desc: 'かっこいい立派なたてがみをもつ、もりの王様！' },
  { category: '🦊 どうぶつ', name: 'トラさん', emoji: '🐯', desc: '黄色と黒のしましま模様がとっても強そう！' },
  { category: '🦊 どうぶつ', name: 'サルさん', emoji: '🐒', desc: '木登りが得意で、バナナが大好物だよ！' },
  { category: '🦊 どうぶつ', name: 'カエルさん', emoji: '🐸', desc: '雨がふると元気にケロケロ鳴き出すよ！' },
  { category: '🦊 どうぶつ', name: 'シカさん', emoji: '🦌', desc: '立派なツノがある、おとなしくてやさしいどうぶつ！' },
  { category: '🦊 どうぶつ', name: 'ハムスターさん', emoji: '🐹', desc: 'ひまわりのタネをほっぺにいっぱい詰め込むよ！' },
  { category: '🦊 どうぶつ', name: 'ハチさん', emoji: '🐝', desc: 'お花からあまーいミツを一生懸命あつめるよ！' },
  { category: '🦊 どうぶつ', name: 'チョウチョさん', emoji: '🦋', desc: 'きれいな羽でお花畑をひらひら舞うよ！' },
  { category: '🦊 どうぶつ', name: 'カメさん', emoji: '🐢', desc: 'ゆっくりだけど、一歩ずつ歩くのが得意だよ！' },
  { category: '🦊 どうぶつ', name: 'ペンギンさん', emoji: '🐧', desc: 'トボトボ歩いて、泳ぐのがとっても上手だよ！' },
  
  // --- おうち（全10種類） ---
  { category: '🍄 おうち', name: '木の家', emoji: '🏡', desc: 'もりのきで作られた、あったかいおうち！' },
  { category: '🍄 おうち', name: 'テント', emoji: '🛖', desc: 'キャンプをするための、かっこいいおうち！' },
  { category: '🍄 おうち', name: 'きのこの家', emoji: '🍄', desc: 'ようせいたちがすんでいる、ふしぎなおうち！' },
  { category: '🍄 おうち', name: 'レンガの家', emoji: '🧱', desc: 'オオカミが来ても壊れない、じょうぶなおうち！' },
  { category: '🍄 おうち', name: 'お城', emoji: '🏰', desc: 'お姫様や王子様が住んでいそうなキラキラなお城！' },
  { category: '🍄 おうち', name: 'サーカステント', emoji: '🎪', desc: '楽しいピエロや動物たちのショーが見られるよ！' },
  { category: '🍄 おうち', name: '郵便ポスト', emoji: '📮', desc: 'みんなのお手紙を運んでくれる赤いポストだよ！' },
  { category: '🍄 おうち', name: 'すべり台', emoji: '🛝', desc: 'しゅーっとすべるのがとっても楽しい遊具だよ！' },
  { category: '🍄 おうち', name: 'メリーゴーランド', emoji: '🎠', desc: '音楽に合わせて、おうまさんがくるくる回るよ！' },
  { category: '🍄 おうち', name: 'キャンピングカー', emoji: '🚐', desc: 'どこへでもお出かけできる、車のおうちだよ！' },
  
  // --- しぜん（全12種類） ---
  { category: '🌊 しぜん', name: 'ちいさな川', emoji: '🌊', desc: 'きれいなお水がさらさら流れているよ！' },
  { category: '🌊 しぜん', name: 'もりの噴水', emoji: '⛲', desc: 'お水がピュッピュとふきだす、たのしい広場！' },
  { category: '🌊 しぜん', name: '木の橋', emoji: '🪵', desc: '川のむこうにわたるための、やさしい木の橋！' },
  { category: '🌊 しぜん', name: 'にじ', emoji: '🌈', desc: '雨上がりに架かる、なないろのきれいな橋だよ！' },
  { category: '🌊 しぜん', name: 'お星さま', emoji: '🌟', desc: '夜の森をピカピカ照らしてくれるお星さまだよ！' },
  { category: '🌊 しぜん', name: 'お月さま', emoji: '🌙', desc: '暗い夜道を優しく照らしてくれるお月さまだよ！' },
  { category: '🌊 しぜん', name: 'たき火', emoji: '🔥', desc: 'パチパチと燃えて、みんなを温めてくれるよ！' },
  { category: '🌊 しぜん', name: '雲', emoji: '☁️', desc: '空に浮かぶ、ふわふわで真っ白な雲だよ！' },
  { category: '🌊 しぜん', name: '流れ星', emoji: '💫', desc: '願い事を３回唱えると叶うかもしれないよ！' },
  { category: '🌊 しぜん', name: '結晶', emoji: '❄️', desc: '冬に空から舞い降りてくる、きれいな氷の星！' },
  { category: '🌊 しぜん', name: 'たき', emoji: '🏞️', desc: '山の上から勢いよく水が流れ落ちているよ！' },
  { category: '🌊 しぜん', name: 'ちいさな火山', emoji: '🌋', desc: '中からぽかぽか温かい温泉がわき出ているよ！' },
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
