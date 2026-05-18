import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Ruby } from '../components/ui/Ruby';
import { Home as HomeIcon, X } from 'lucide-react';

export const Stamp: React.FC = () => {
  const navigate = useNavigate();
  const { stamps, settings, addStamp } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(1);

  const handleOpenModal = () => {
    setShowModal(true);
    setPassword('');
    setError(false);
    setSelectedAmount(1);
  };

  const handleAddStamp = () => {
    if (password === settings.password) {
      addStamp(selectedAmount);
      setShowModal(false);
    } else {
      setError(true);
    }
  };

  // スタンプカードの枠を生成
  // 目標が10より少ない場合は目標数、多すぎる場合は10区切りなどで表示する工夫が必要だが、
  // 今回はUIとして1画面10個（またはgoalStamps個）の枠を描画する
  const displayCount = Math.max(10, settings.goalStamps);
  const blanks = Array(displayCount).fill(null);

  return (
    <div className="p-6 min-h-screen flex flex-col bg-pastel-yellow bg-opacity-20">
      <header className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-12 h-12 p-0 rounded-full bg-white shadow-sm">
          <HomeIcon size={24} className="text-primary" />
        </Button>
        <h1 className="text-xl font-bold text-primary bg-white px-6 py-2 rounded-full shadow-sm">
          ごほうびカード
        </h1>
        <div className="w-12"></div>
      </header>

      <main className="flex-1 flex flex-col items-center max-w-sm mx-auto w-full space-y-4">
        
        {/* 子供向けの「おうちの人に見せよう」誘導案内文 */}
        <div className="w-full bg-white rounded-2xl p-4 border-2 border-dashed border-pastel-pink text-center shadow-sm relative overflow-hidden animate-pulse-slow">
          <span className="text-3xl absolute -bottom-2 -right-2 opacity-10 select-none">💮</span>
          <p className="text-xs font-black text-primary">
            🙋 おうちの人に「がんばったよ！」と みせよう！
          </p>
          <p className="text-[10px] text-gray-500 font-bold mt-1 leading-normal">
            おうちの人にこの画面を「はい！👋」と渡してね。<br />
            がんばりに応じて、はなまるスタンプを押してもらえるよ！
          </p>
        </div>

        {/* スタンプカード部分 */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-4 border-pastel-pink w-full relative overflow-hidden">
          <h2 className="text-center font-bold text-lg text-text-main mb-4">
            いまのスタンプ: <span className="text-3xl text-primary">{stamps}</span> こ
          </h2>
          
          <div className="grid grid-cols-5 gap-3 justify-items-center mb-4 relative z-10">
            {blanks.map((_, i) => {
              const isGoal = i === settings.goalStamps - 1;
              const isStamped = i < stamps;
              
              if (isGoal) {
                // === ゴールマス（特別なデザイン） ===
                return (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center relative shadow-md transition-all duration-500
                      ${isStamped 
                        ? 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-400 border-yellow-500 scale-125 z-10 animate-bounce' 
                        : 'bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-300 border-double'}`}
                  >
                    {isStamped ? (
                      <>
                        {/* ゴール達成時：王冠＋はなまるスタンプ 👑💮 */}
                        <img 
                          src="/はなまる.png" 
                          alt="stamp" 
                          className="absolute inset-0 w-full h-full object-cover transform scale-110 drop-shadow-md"
                        />
                        <span className="absolute -top-3.5 text-lg drop-shadow-md animate-bounce">👑</span>
                        <span className="absolute -bottom-1 bg-yellow-400 text-white font-black text-[7px] px-1 rounded-full border border-yellow-500 scale-90">GOAL!</span>
                      </>
                    ) : (
                      <>
                        {/* ゴール未達成時：ゴールドに光り輝く宝箱 🎁✨ */}
                        <span className="text-xl filter drop-shadow-sm select-none animate-pulse">🎁</span>
                        <span className="absolute -top-2.5 text-xs text-amber-500 animate-bounce">✨</span>
                        <span className="absolute -bottom-1 bg-amber-500 text-white font-black text-[6px] px-1 rounded-full scale-90">GOAL!</span>
                      </>
                    )}
                  </div>
                );
              }

              // === 通常のマス ===
              return (
                <div 
                  key={i} 
                  className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center relative bg-gray-50"
                >
                  {isStamped ? (
                    <img 
                      src="/はなまる.png" 
                      alt="stamp" 
                      className="absolute inset-0 w-full h-full object-cover transform scale-125 drop-shadow-sm animate-bounce-in"
                    />
                  ) : (
                    <span className="text-gray-300 text-xs font-bold">{i + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center bg-pastel-pink bg-opacity-30 p-3 rounded-xl border border-pastel-pink">
            <p className="text-xs font-bold text-gray-500 mb-1">ごほうびまで あと {Math.max(0, settings.goalStamps - stamps)} こ</p>
            <p className="font-bold text-primary">{settings.rewardText}</p>
          </div>
        </div>

        <Button onClick={handleOpenModal} className="w-full h-16 text-xl shadow-lg border-b-4 border-orange-500" variant="primary">
          <Ruby kanji="おうちの人におしてもらう！" furigana="おうちのひとにおしてもらう！" /> 💮
        </Button>
      </main>

      {/* スタンプ追加モーダル (保護者用) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 p-2 bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-center mb-4 text-primary">
              <Ruby kanji="保護者" furigana="ほごしゃ" />にかくにん
            </h2>

            {/* 保護者向け：がんばりに応じた選択目安ガイドメッセージ */}
            <div className="mb-4 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-[10px] text-amber-900 leading-relaxed font-bold shadow-inner">
              <p className="text-xs font-black text-amber-700 mb-1 flex items-center gap-1 justify-center">
                <span>💮</span>
                <span>お子さまの「がんばり」でスタンプ数を選択</span>
              </p>
              <p className="text-center border-b border-dashed border-amber-200 pb-1.5 mb-1.5">
                今日の取り組みの姿勢に合わせて、自由に評価してあげてください！
              </p>
              <ul className="space-y-1 text-gray-600">
                <li>🌟 <span className="text-primary font-black">5こおす</span>：帰宅後すぐ勉強に取り組めた！</li>
                <li>💖 <span className="text-primary font-black">3こおす</span>：最後まで集中してがんばれた！</li>
                <li>👍 <span className="text-primary font-black">1〜2こ</span>：あきらめずに挑戦しクリアできた！</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="text-center font-bold text-gray-600 mb-2">いくつおす？</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setSelectedAmount(num)}
                    className={`w-14 h-14 rounded-full font-bold text-xl transition-all ${
                      selectedAmount === num 
                        ? 'bg-primary text-white scale-110 shadow-md border-2 border-orange-200' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-center font-bold text-gray-600 mb-3">パスワード</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border-4 rounded-2xl p-4 text-xl outline-none text-center ${error ? 'border-red-400 bg-red-50' : 'border-pastel-blue focus:border-tertiary bg-blue-50'}`}
                placeholder="****"
              />
              {error && <p className="text-red-500 text-sm font-bold text-center mt-2">パスワードがちがいます</p>}
            </div>
            
            <Button onClick={handleAddStamp} className="w-full h-14 text-lg">
              スタンプを {selectedAmount} こ おす！
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
