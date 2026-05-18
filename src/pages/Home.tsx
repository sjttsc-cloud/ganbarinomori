import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Ruby } from '../components/ui/Ruby';
import { Play, Settings as SettingsIcon, Calendar as CalendarIcon, Award, VolumeX, Music, Waves, Lock } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, hasUnclaimedStamp, discoveredObjects, cancelUnclaimedStamp } = useStore();
  const pomodoroOptions = [
    { study: 5, break: 1 },
    { study: 10, break: 2 },
    { study: 15, break: 3 },
    { study: 20, break: 4 },
    { study: 30, break: 5 },
    { study: 45, break: 10 },
    { study: 60, break: 15 },
  ];

  const [selectedOption, setSelectedOption] = useState(pomodoroOptions[1]); // デフォルト10分セット

  const handleCancelStamp = () => {
    const password = settings.password;
    if (password) {
      const input = prompt("ほごしゃ用パスワードを 入力してください：");
      if (input === null) return;
      if (input !== password) {
        alert("パスワードが 正しくありません！");
        return;
      }
    }
    
    if (window.confirm("今回のスタンプ（と、手に入れた『もりのたね』1こ）を なしに しますか？\n（この操作は もとに もどせません）")) {
      cancelUnclaimedStamp();
      alert("スタンプを なしにしました。お勉強を やり直せます！ 🧹✨");
    }
  };

  const handleStart = () => {
    navigate('/timer', { state: { studyTime: selectedOption.study, breakTime: selectedOption.break } });
  };

  return (
    <div className="p-6 min-h-screen flex flex-col bg-pastel-blue bg-opacity-20">
      <header className="flex justify-between items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="w-12 h-12 p-0 rounded-full bg-white shadow-sm">
          <SettingsIcon size={24} className="text-tertiary" />
        </Button>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')} className="w-12 h-12 p-0 rounded-full bg-white shadow-sm">
            <CalendarIcon size={24} className="text-secondary" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/stamp')} className="w-12 h-12 p-0 rounded-full bg-white shadow-sm relative">
            <Award size={24} className="text-primary" />
            {hasUnclaimedStamp && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-extrabold items-center justify-center">!</span>
              </span>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center space-y-8">
        {hasUnclaimedStamp ? (
          // === スタンプ未獲得状態での学習ロック画面 ===
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border-4 border-pastel-pink text-center space-y-6 animate-pulse-slow">
            <div className="mx-auto w-20 h-20 rounded-full bg-pastel-pink flex items-center justify-center text-primary shadow-inner">
              <Lock size={40} className="animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-main">
                スタンプが まだだよ！ 🏅
              </h2>
              <p className="text-sm font-bold text-gray-500 leading-relaxed">
                前回がんばったお勉強のスタンプが<br />
                まだカードにおされていません！
              </p>
              <div className="text-xs font-black text-primary bg-pastel-pink bg-opacity-40 p-3.5 rounded-2xl border border-pastel-pink space-y-1">
                <p>✨ おうちの人に みてもらって スタンプを もらおう！ ✨</p>
                <p className="text-[10px] text-gray-500 font-bold leading-normal">
                  おうちの人に「お勉強がんばったよ！👋」と画面を見せて、はなまるスタンプを押してもらってね！
                </p>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/stamp')} 
              className="w-full text-lg gap-2 h-16 shadow-lg border-b-8 border-orange-600 rounded-2xl animate-bounce" 
              variant="primary"
            >
              おうちの人とスタンプをもらいにいく！ 🏅
            </Button>

            {/* 保護者向けスタンプ無効化ボタン */}
            <div className="pt-2 border-t border-gray-100 w-full">
              <button
                onClick={handleCancelStamp}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200 transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5"
              >
                <span>🔑</span>
                <span>ほごしゃ用：今回のスタンプを なしにする</span>
              </button>
            </div>
          </div>
        ) : (
          // === 通常の学習開始画面 ===
          <>
            <div className="text-center w-full max-w-sm">
              <h2 className="text-2xl font-bold text-text-main mb-6">
                <Ruby kanji="学習" furigana="がくしゅう" />する<Ruby kanji="時間" furigana="じかん" />
              </h2>
              
              <div className="grid grid-cols-3 gap-3 mx-auto">
                {pomodoroOptions.map((opt) => {
                  const isSelected = selectedOption.study === opt.study;
                  return (
                    <button
                      key={opt.study}
                      onClick={() => setSelectedOption(opt)}
                      className={`
                        p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all
                        ${isSelected 
                          ? 'bg-secondary text-white scale-105 shadow-md border-orange-400' 
                          : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}
                      `}
                    >
                      <span className="text-xl font-bold">{opt.study}分</span>
                      <span className={`
                        text-[10px] font-black px-2 py-0.5 rounded-full mt-1.5 transition-all
                        ${isSelected
                          ? 'bg-white text-secondary' 
                          : 'bg-gray-100 text-gray-400'}
                      `}>
                        やすみ {opt.break}分
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 始めるボタン (上に配置) */}
            <div className="pt-2 w-full max-w-sm">
              <Button onClick={handleStart} className="w-full text-2xl gap-2 h-20 shadow-xl border-b-8 border-orange-600 rounded-3xl" variant="primary">
                <Play fill="currentColor" size={32} />
                <Ruby kanji="始" furigana="はじ" />める
              </Button>
            </div>

            {/* もりのなかま図鑑しんちょくボタン (下に配置) */}
            <div className="w-full max-w-sm pt-2">
              <button
                onClick={() => navigate('/forest-gallery')}
                className="w-full bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded-3xl p-4 shadow-md flex items-center justify-between border-b-6 border-emerald-700 transition-all active:translate-y-1 active:border-b-2"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-3xl bg-white bg-opacity-25 p-2 rounded-2xl select-none">🌳</span>
                  <div>
                    <p className="text-[10px] font-black opacity-90 tracking-wide">
                      🌱 もりのたね しんちょく
                    </p>
                    <h3 className="text-sm font-black tracking-tight leading-none mt-1">
                      もりのなかま図鑑をみる
                    </h3>
                  </div>
                </div>
                <div className="bg-white text-emerald-800 font-black text-xs px-3 py-1.5 rounded-2xl shadow-inner flex flex-col items-center leading-none">
                  <span className="text-[8px] text-gray-400 font-bold mb-0.5">みつけた</span>
                  <span>{discoveredObjects?.length || 0} / 17</span>
                </div>
              </button>
            </div>

            <div className="flex gap-4 justify-center items-center mt-4">
              <button 
                onClick={() => updateSettings({ bgmType: 'none' })}
                className={`p-3 rounded-full transition-all ${settings.bgmType === 'none' ? 'bg-secondary text-text-main scale-110 shadow-md' : 'bg-white text-gray-400'}`}
              >
                <VolumeX size={24} />
              </button>
              <button 
                onClick={() => updateSettings({ bgmType: 'music' })}
                className={`p-3 rounded-full transition-all ${settings.bgmType === 'music' ? 'bg-secondary text-text-main scale-110 shadow-md' : 'bg-white text-gray-400'}`}
              >
                <Music size={24} />
              </button>
              <button 
                onClick={() => updateSettings({ bgmType: 'brownNoise' })}
                className={`p-3 rounded-full transition-all ${settings.bgmType === 'brownNoise' ? 'bg-secondary text-text-main scale-110 shadow-md' : 'bg-white text-gray-400'}`}
              >
                <Waves size={24} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
