import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Ruby } from '../components/ui/Ruby';
import { useStore } from '../store/useStore';
import { BGMPlayer } from '../components/BGMPlayer';

type TimerPhase = 'study' | 'break';
type TimerTheme = 'animals' | 'stars' | 'flowers' | 'cleaning' | 'adventure';

export const Timer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const seeds = useStore((state) => state.seeds);
  const forestObjects = useStore((state) => state.forestObjects);
  const useSeed = useStore((state) => state.useSeed);
  const addSession = useStore((state) => state.addSession);
  
  // ポモドーロパラメータ (デフォルトは10分学習 / 2分休憩)
  const studyTimeMinutes = location.state?.studyTime || 10;
  const breakTimeMinutes = location.state?.breakTime || 2;
  
  const studyTimeSeconds = studyTimeMinutes * 60;
  const breakTimeSeconds = breakTimeMinutes * 60;
  
  const [phase, setPhase] = useState<TimerPhase>('study');
  const [timeLeft, setTimeLeft] = useState(studyTimeSeconds);
  const [isActive, setIsActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 応援メッセージ（セリフ枠）の自動フェードイン・アウト用のステート
  const [lastMessageText, setLastMessageText] = useState('');
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // 育成アクション時のメッセージ
  const [growthMessage, setGrowthMessage] = useState<string | null>(null);
  const [tapEffect, setTapEffect] = useState<{ id: string; emoji: string } | null>(null);

  // 毎回タイマー開始時にランダムに選ばれるテーマ
  const [theme, setTheme] = useState<TimerTheme>('animals');

  // テーマをランダムに決定する関数
  const selectRandomTheme = () => {
    const themes: TimerTheme[] = ['animals', 'stars', 'flowers', 'cleaning', 'adventure'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
  };

  // マウント時にテーマをランダム決定
  useEffect(() => {
    selectRandomTheme();
  }, []);

  // 開始前カウントダウン
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setIsActive(true);
      setShowConfirm(false);
    }
  }, [countdown]);

  // メインタイマーロジック (自動ループ処理)
  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      
      if (phase === 'study') {
        // === お勉強タイマーが終了した時 ➔ 自動的に休憩へ移行 ===
        
        // 学習履歴を追加・保存 (この中で自動で たね+1 ＆ ロックON になります)
        addSession({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          durationMinutes: studyTimeMinutes,
          type: 'study'
        });

        // 休憩に移行
        setPhase('break');
        setTimeLeft(breakTimeSeconds);
        // 少し時間をおいてからタイマーを再開
        setTimeout(() => setIsActive(true), 500);

      } else if (phase === 'break') {
        // === 休憩タイマーが終了した時 ➔ 自動的にお勉強（次のループ）へ戻る ===
        
        // 次のお勉強テーマを再抽選！
        selectRandomTheme();

        // お勉強に移行
        setPhase('study');
        setTimeLeft(studyTimeSeconds);
        setTimeout(() => setIsActive(true), 500);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase, studyTimeMinutes, breakTimeSeconds, studyTimeSeconds, addSession]);

  const handleStartSequence = () => {
    setCountdown(3);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    if (window.confirm('ほんとうにやめる？（記録は残りません）')) {
      navigate('/');
    }
  };

  // 「お勉強をおわる」ボタンのハンドラ (実績を保持したままスタンプ画面へ)
  const handleFinish = () => {
    if (window.confirm('お勉強をおわって、ごほうびスタンプをもらう？ 🏅')) {
      navigate('/stamp');
    }
  };

  // ミニゲーム「たねをまく」アクションの実行
  const handlePlantSeed = () => {
    const result = useSeed();
    if (result.success && result.object) {
      setGrowthMessage(`🌱 たねがそだって 【${result.object.name} ${result.object.emoji}】 があらわれた！ ✨`);
      // エフェクト発動
      setTapEffect({ id: result.object.id, emoji: result.object.emoji });
      // 3秒後にメッセージをクリア
      setTimeout(() => {
        setGrowthMessage(null);
        setTapEffect(null);
      }, 3500);
    } else {
      alert('「たね」がありません！お勉強をがんばると新しいたねをもらえるよ！✏️🌱');
    }
  };

  // 学習中の進行度％
  const progressPercent = phase === 'study' 
    ? Math.floor(((studyTimeSeconds - timeLeft) / studyTimeSeconds) * 100)
    : 100;

  // テーマごとの名前
  const themeNames: Record<TimerTheme, string> = {
    animals: 'どうぶつあつめ 🦊',
    stars: '星あつめ ⭐',
    flowers: '花さかせ 🌸',
    cleaning: 'まほうでおそうじ 🧹',
    adventure: 'ゆうしゃぼうけん ⚔️',
  };

  // === 各テーマごとの画面全体演出用データ ===

  // 1. どうぶつあつめデータ (タイマーや文字と絶対に被らない画面全体の左右・四隅の余白へ配置)
  const animalsData = [
    { name: 'みつばちさん', src: '/画像/みつばちさん.png', progress: 15, style: { top: '16%', left: '4%', width: '80px', height: '80px' } },
    { name: 'ハムスターさん', src: '/画像/ハムスターとひまわりの種.png', progress: 30, style: { bottom: '20%', left: '4%', width: '90px', height: '90px' } },
    { name: 'アヒルさん', src: '/画像/アヒルさんのイラスト.png', progress: 45, style: { top: '16%', right: '4%', width: '90px', height: '90px' } },
    { name: 'ひつじさん', src: '/画像/眠っている羊さん.png', progress: 60, style: { bottom: '20%', right: '4%', width: '95px', height: '95px' } },
    { name: 'ライオンさん', src: '/画像/かわいいライオン.png', progress: 75, style: { top: '45%', left: '3%', width: '105px', height: '105px', transform: 'translateY(-50%)' } },
    { name: 'うしさん', src: '/画像/牛さんのイラスト背景透過.png', progress: 90, style: { top: '45%', right: '3%', width: '110px', height: '110px', transform: 'translateY(-50%)' } },
  ];

  // 2. 星あつめ用の星の配置
  const starsData = [
    { top: '10%', left: '8%', icon: '⭐', size: 'text-xl', progress: 10 },
    { top: '22%', left: '20%', icon: '✨', size: 'text-2xl', progress: 20 },
    { top: '8%', left: '78%', icon: '⭐', size: 'text-lg', progress: 30 },
    { top: '15%', left: '88%', icon: '✨', size: 'text-2xl', progress: 40 },
    { top: '35%', left: '5%', icon: '⭐', size: 'text-xl', progress: 50 },
    { top: '48%', left: '85%', icon: '💫', size: 'text-2xl', progress: 60 },
    { top: '72%', left: '10%', icon: '✨', size: 'text-3xl', progress: 70 },
    { top: '65%', left: '80%', icon: '⭐', size: 'text-xl', progress: 80 },
    { top: '82%', left: '15%', icon: '✨', size: 'text-2xl', progress: 90 },
    { top: '85%', left: '82%', icon: '💫', size: 'text-2xl', progress: 95 },
  ];

  // 3. まほうでおそうじ用のゴミの配置 (進捗バーに被らない安全座標)
  const garbageData = [
    { id: 1, icon: '🗑️', style: { top: '14%', left: '10%' }, progress: 10 },
    { id: 2, icon: '🕸️', style: { top: '16%', right: '10%' }, progress: 25 },
    { id: 3, icon: '👾', style: { top: '36%', left: '6%' }, progress: 40 },
    { id: 4, icon: '🧦', style: { top: '38%', right: '6%' }, progress: 55 },
    { id: 5, icon: '🍂', style: { bottom: '26%', left: '10%' }, progress: 70 },
    { id: 6, icon: '🗑️', style: { bottom: '26%', right: '10%' }, progress: 80 },
    { id: 7, icon: '🕸️', style: { bottom: '38%', left: '16%' }, progress: 90 },
  ];

  // 4. ゆうしゃぼうけんの進行状況に応じた敵
  const getAdventureEnemy = () => {
    if (progressPercent < 20) return { icon: '👾', name: 'ちびスライム', hp: '💙' };
    if (progressPercent < 40) return { icon: '👻', name: 'いたずらおばけ', hp: '💚' };
    if (progressPercent < 60) return { icon: '🦇', name: 'パタパタコウモリ', hp: '💛' };
    if (progressPercent < 80) return { icon: '🤖', name: 'らくがきロボ', hp: '🧡' };
    if (progressPercent < 100) return { icon: '🦖', name: 'プチドラゴン', hp: '❤️' };
    return { icon: '🎁', name: 'たからばこ', hp: '✨' };
  };
  const enemy = getAdventureEnemy();

  // 現在のテーマに応じた応援メッセージ
  const getThemeMessage = () => {
    if (growthMessage) return { name: 'もりのまほう 🌱✨', text: growthMessage };
    
    switch (theme) {
      case 'animals': {
        const active = animalsData.filter(a => progressPercent >= a.progress);
        if (active.length === 0) return { name: 'がんばりのもり', text: 'しずかな もりでおべんきょう スタート！' };
        const latest = active[active.length - 1];
        const messages: Record<string, string> = {
          'みつばちさん': 'ぶんぶん！ がんばるすがた、かっこいい！',
          'ハムスターさん': 'もぐもぐ！ はんぶんちかくまで きたよ！',
          'アヒルさん': 'がーがー！ そのちょうしで いこう！',
          'ひつじさん': 'すやすや… おちついて ゆっくりね！',
          'ライオンさん': 'がおー！ すごいぞ！ あとちょっとだ！',
          'うしさん': 'もー！ みんなあつまったよ！ よくがんばった！',
        };
        return { name: latest.name, text: messages[latest.name] || 'おうえんしているよ！' };
      }
      
      case 'stars':
        if (progressPercent < 30) return { name: 'おつきさま 🌙', text: '夜空を キラキラの 星で いっぱいに しよう！' };
        if (progressPercent < 60) return { name: 'ながれぼし 💫', text: 'しゅっ！ 星が あつまってきたよ！きれいだね！' };
        if (progressPercent < 90) return { name: 'きらきら星 ⭐', text: 'もうすぐ 満点の 星空に なるよ！ がんばれ！' };
        return { name: 'おほしさま ✨', text: 'やったー！ まばゆい 天の川の 完成だよ！大成功！' };
        
      case 'flowers':
        if (progressPercent < 20) return { name: 'ちいさな芽 🌱', text: 'お庭に ひょっこり 芽が出たよ！ かわいいね！' };
        if (progressPercent < 50) return { name: 'わかば 🌱', text: 'おひさまを あびて ぐんぐん 伸びてきたよ！' };
        if (progressPercent < 75) return { name: 'つぼみ 🌷', text: 'おおきな つぼみが ふくらんだよ！もうすぐ咲くよ！' };
        return { name: 'にじいろの花 🌸', text: 'パッ！ きれいな 大輪のお花が 咲いたよ！すてき！' };
        
      case 'cleaning':
        if (progressPercent < 30) return { name: 'まほうつかい 🧙', text: 'ちちんぷいぷい！ お部屋を ピカピカに するよ！' };
        if (progressPercent < 70) return { name: 'まほうの杖 ✨', text: 'キラーン✨ だいぶ ゴミが 消えて 綺麗になったね！' };
        if (progressPercent < 100) return { name: 'まほうつかい 🧙', text: 'あとすこしでおそうじ完了！お部屋がかがやいてる！' };
        return { name: 'ピカピカのお部屋 ✨', text: '完璧だよ！ お部屋がピカピカに光ってる！ありがとう！' };
      
      case 'adventure':
        if (progressPercent < 20) return { name: 'ゆうしゃ ⚔️', text: 'ぼうけん スタート！ スライムを やっつけよう！' };
        if (progressPercent < 60) return { name: 'ちいさな勇者 🧑‍🎤', text: 'トントン！ 魔法の剣で モンスターを 浄化するよ！' };
        if (progressPercent < 90) return { name: 'ゆうしゃ ⚔️', text: 'つよいドラゴンが あらわれた！ ラストバトルだ！' };
        return { name: 'たからばこ 🎁', text: 'モンスターをぜんぶ倒したよ！お宝をゲットした！' };
    }
  };

  const currentMessage = getThemeMessage();

  // 応援メッセージ（吹き出し）の更新をリアルタイム検知して5秒間だけ浮かび上がらせる
  useEffect(() => {
    if (currentMessage && currentMessage.text !== lastMessageText) {
      setLastMessageText(currentMessage.text);
      setIsBubbleVisible(true); // 吹き出しを表示！
 
      // 5秒後にフェードアウト
      const timerId = setTimeout(() => {
        setIsBubbleVisible(false);
      }, 5000);
 
      return () => clearTimeout(timerId); // クリーンアップ
    }
  }, [currentMessage?.text, lastMessageText]);

  // 1. カウントダウン/準備画面
  if (showConfirm) {
    return (
      <div className="p-6 min-h-screen flex flex-col items-center justify-center space-y-8 bg-pastel-blue bg-opacity-20">
        {countdown === null ? (
          <>
            <h2 className="text-3xl font-bold text-center text-primary bg-white px-8 py-3 rounded-full shadow-sm">
              <Ruby kanji="準備" furigana="じゅんび" />はいい？
            </h2>
            
            <div className="bg-white rounded-3xl p-6 shadow-md border-4 border-pastel-pink w-full max-w-xs text-center">
              <p className="text-lg font-bold text-text-main mb-4">今回のポモドーロ</p>
              <div className="text-primary font-bold text-2xl mb-2">
                ✏️ べんきょう：{studyTimeMinutes}分
              </div>
              <div className="text-tertiary font-bold text-lg bg-pastel-green bg-opacity-35 py-1.5 rounded-2xl mb-3">
                💤 きゅうけい：{breakTimeMinutes}分
              </div>
              <div className="text-xs font-bold text-gray-400 bg-gray-50 py-1 rounded-xl">
                えんしゅつ：{themeNames[theme]}
              </div>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
              <Button onClick={handleStartSequence} size="lg" className="shadow-lg border-b-8 border-orange-600 h-16 text-xl rounded-3xl" variant="primary">
                <Ruby kanji="始" furigana="はじ" />める！
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="bg-white h-12 rounded-2xl font-bold">
                やめる
              </Button>
            </div>
          </>
        ) : (
          // === 視認性100%確保 ＆ 超ド派手！わくわくカウントダウン演出 ===
          <div className="relative w-full max-w-sm h-80 flex flex-col items-center justify-center overflow-hidden">
            
            {/* 1. 最背面：背後でぐるぐる回転しながら脈打つ集中オーラ（z-0に完全に分離） */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-primary via-secondary to-tertiary blur-3xl opacity-25 animate-aura-pulse pointer-events-none z-0" />
            
            {/* 2. 中層：紙吹雪シャワー（文字の邪魔にならないように最背面に配置、かつ不透明度を調整） */}
            {countdown === 0 && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {Array.from({ length: 20 }).map((_, i) => {
                  const colors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-pink-400', 'bg-purple-400'];
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];
                  return (
                    <div
                      key={i}
                      className={`absolute w-3 h-3 rounded-full ${randomColor} animate-confetti`}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 15}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${2.0 + Math.random() * 1.5}s`
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* 3. 前面：視認性を完璧に守る「丸型発光座布団（バックドロップシールド）」＆ 境界線 ＆ シャドウ */}
            <div className="w-64 h-64 rounded-full bg-white bg-opacity-85 backdrop-blur-md border-4 border-pastel-pink shadow-2xl flex items-center justify-center relative z-10 p-4">
              
              {/* カウント数字およびテキスト */}
              <div key={countdown} className="relative select-none animate-pop-countdown flex flex-col items-center justify-center text-center">
                {countdown === 3 && (
                  <div className="flex flex-col items-center">
                    {/* 深いブルーでフチ取りを強化した極太「3」 */}
                    <span className="text-[110px] font-black text-blue-600 drop-shadow-[0_4px_8px_rgba(30,58,138,0.3)] leading-none">3</span>
                    <span className="text-sm font-black text-blue-800 bg-blue-100 px-3 py-1 rounded-full mt-2 animate-pulse">
                      Ready... 🫧
                    </span>
                  </div>
                )}
                {countdown === 2 && (
                  <div className="flex flex-col items-center">
                    {/* 深いグリーンでフチ取りを強化した極太「2」 */}
                    <span className="text-[110px] font-black text-emerald-600 drop-shadow-[0_4px_8px_rgba(6,78,59,0.3)] leading-none">2</span>
                    <span className="text-sm font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mt-2 animate-pulse">
                      Set... 🍃
                    </span>
                  </div>
                )}
                {countdown === 1 && (
                  <div className="flex flex-col items-center">
                    {/* 深いイエローでフチ取りを強化した極太「1」 */}
                    <span className="text-[110px] font-black text-amber-500 drop-shadow-[0_4px_8px_rgba(146,64,14,0.3)] leading-none">1</span>
                    <span className="text-sm font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full mt-2 animate-pulse">
                      Go!!! ✨
                    </span>
                  </div>
                )}
                {countdown === 0 && (
                  <div className="flex flex-col items-center text-center w-full px-2">
                    {/* よーい どん！グラデーションテキスト */}
                    <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(220,38,38,0.2)] animate-bounce leading-none py-1">
                      よーい どん！
                    </span>
                    <span className="text-5xl mt-1 select-none animate-bounce delay-150">🚀🔥</span>
                    <span className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-full shadow-sm mt-3 animate-pulse">
                      お勉強スタート！がんばるぞ！✊
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. 学習中 ＆ 休憩中のタイマー画面
  const isBreak = phase === 'break';
  const progressRatio = timeLeft / (isBreak ? breakTimeSeconds : studyTimeSeconds);

  // テーマ別の画面全体背景スタイル
  const getThemeBackgroundClass = () => {
    if (isBreak) return 'bg-indigo-950 text-indigo-100';
    switch (theme) {
      case 'animals': return 'bg-emerald-50 text-text-main';
      case 'stars': return 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-900 text-indigo-100';
      case 'flowers': return 'bg-gradient-to-b from-sky-100 to-green-50 text-text-main';
      case 'cleaning': return 'bg-amber-50 text-text-main';
      case 'adventure': return 'bg-gradient-to-b from-sky-200 to-amber-100 text-text-main';
    }
  };

  const activeAnimals = animalsData.filter(a => progressPercent >= a.progress);

  return (
    <div className={`p-6 min-h-screen flex flex-col transition-all duration-1000 relative overflow-hidden ${getThemeBackgroundClass()}`}>
      
      {/* ========================================================================= */}
      {/* 最背面演出レイヤー（z-0） */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0">
        
        {/* === 【もりのたね】で成長したオブジェクトの描画 (休憩中のみ表示) === */}
        {isBreak && forestObjects.map((obj) => {
          // すでにlocalStorageに保存されてしまっている古い不具合テキスト「Fountain」を自動で絵文字「⛲」にクレンジング表示
          const displayEmoji = obj.emoji.trim() === 'Fountain' ? '⛲' : obj.emoji;
          return (
            <div
              key={obj.id}
              className={`absolute text-4xl select-none transition-all duration-1000 pointer-events-auto cursor-pointer active:scale-150 active:rotate-12 hover:scale-110
                ${tapEffect?.id === obj.id ? 'animate-ping scale-150' : 'animate-pulse-slow'}
              `}
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transitionDelay: `${Math.random() * 200}ms`
              }}
              title={obj.name}
              onClick={() => {
                // タップした時にお祝いメッセージを出す
                setGrowthMessage(`もりの 【${obj.name} ${displayEmoji}】 をつんつんしたよ！ 👋✨`);
                setTimeout(() => setGrowthMessage(null), 2500);
              }}
            >
              {displayEmoji}
            </div>
          );
        })}

        {isBreak ? (
          /* 休憩中演出：満天の星空とふわふわ眠る羊さん */
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-indigo-950 to-slate-950 opacity-80 pointer-events-none" />
            <img 
              src="/画像/眠っている羊さん.png" 
              alt="やすみちゅう" 
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 object-contain animate-pulse opacity-90 pointer-events-none"
            />
            <div className="absolute bottom-60 left-1/3 text-white font-bold text-3xl animate-bounce pointer-events-none">💤</div>
            <div className="absolute bottom-64 left-1/2 text-white font-bold text-xl animate-bounce delay-300 pointer-events-none">zZ</div>
          </div>
        ) : (
          /* お勉強中のテーマ別画面全体演出 */
          <div className="absolute inset-0 pointer-events-none">
            {/* 1. どうぶつあつめテーマ（下部に芝生＋動物たちが広がる） */}
            {theme === 'animals' && (
              <>
                <img 
                  src="/forest_animals.png" 
                  alt="がんばりのもり" 
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
                  style={{
                    filter: `blur(${Math.max(0, 10 - (progressPercent / 8))}px)`,
                    opacity: 0.15 + (progressPercent / 100) * 0.35
                  }}
                />
                {/* 最下部のスリムな芝生ライン */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-emerald-200 bg-opacity-40 border-t-2 border-emerald-300" />
                {animalsData.map((animal) => {
                  const isVisible = progressPercent >= animal.progress;
                  const isLatest = activeAnimals.length > 0 && activeAnimals[activeAnimals.length - 1].name === animal.name;
                  if (!isVisible) return null;
                  return (
                    <img
                      key={animal.name}
                      src={animal.src}
                      alt={animal.name}
                      className={`absolute transition-all duration-1000 object-contain drop-shadow-md
                        ${isLatest ? 'animate-bounce scale-110' : 'scale-100'}
                      `}
                      style={animal.style}
                    />
                  );
                })}
              </>
            )}

            {/* 2. 星あつめテーマ（流れ星が走り、満天の星空がネオンのように瞬く） */}
            {theme === 'stars' && (
              <>
                {/* 1つ目の流れ星 (50%経過で出現) */}
                {progressPercent >= 50 && (
                  <div className="absolute top-[15%] right-[10%] text-3xl animate-shooting-star pointer-events-none select-none">
                    ☄️✨
                  </div>
                )}

                {/* 2つ目の流れ星 (80%経過でさらに出現) */}
                {progressPercent >= 80 && (
                  <div className="absolute top-[35%] right-[25%] text-2xl animate-shooting-star pointer-events-none select-none" style={{ animationDelay: '2.5s' }}>
                    ☄️💫
                  </div>
                )}
                
                {/* 画面中央裏の黄金のお月さまと神秘的なギャラクシーオーラ */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-yellow-300 via-purple-600 to-pink-500 opacity-20 blur-3xl pointer-events-none" />
                <div className="absolute top-[28%] left-[76%] flex flex-col items-center pointer-events-none select-none">
                  {/* 月の後光 */}
                  <div className="absolute w-16 h-16 rounded-full bg-yellow-200 opacity-30 blur-md animate-ping" />
                  <span className="text-6xl opacity-90 animate-bounce">🌙</span>
                  <span className="text-[8px] text-amber-200 font-bold bg-yellow-950 bg-opacity-65 px-1.5 py-0.5 rounded-full mt-1 border border-yellow-800">
                    ゴールドムーン
                  </span>
                </div>

                {starsData.map((star, idx) => {
                  if (progressPercent < star.progress) return null;
                  const isPing = idx % 3 === 0;
                  return (
                    <span
                      key={idx}
                      className={`absolute transition-all duration-1000 ${star.size} select-none
                        ${isPing ? 'animate-ping text-amber-200' : 'animate-pulse text-yellow-100'}
                      `}
                      style={{
                        top: star.top,
                        left: star.left,
                        textShadow: '0 0 15px rgba(253, 224, 71, 0.9)',
                        animationDelay: `${idx * 150}ms`
                      }}
                    >
                      {star.icon}
                    </span>
                  );
                })}

                {/* 90%以上での超爆発きらめき */}
                {progressPercent >= 90 && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <span className="text-9xl animate-ping opacity-25 text-amber-300">⭐💫</span>
                  </div>
                )}
              </>
            )}

            {/* 3. 花さかせテーマ（蝶々が舞い、お花から光の胞子が湧き立ち、満開時は桜吹雪が舞い散る） */}
            {theme === 'flowers' && (
              <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
                
                {/* 太陽のきらめき後光 */}
                <div className="absolute top-16 left-6 flex flex-col items-center select-none">
                  <div className="absolute w-14 h-14 bg-amber-400 opacity-20 blur-md rounded-full animate-ping" />
                  <span className="text-5xl animate-spin-slow">☀️</span>
                </div>

                {/* ひらひら舞う蝶々 (35%経過で1匹目、70%経過で2匹目が出現) */}
                {progressPercent >= 35 && (
                  <div className="absolute bottom-[35%] left-[8%] text-3xl animate-butterfly z-10 select-none">
                    🦋💙
                  </div>
                )}
                {progressPercent >= 70 && (
                  <div className="absolute bottom-[45%] right-[8%] text-3xl animate-butterfly z-10 select-none" style={{ animationDelay: '3s' }}>
                    🦋💖
                  </div>
                )}

                {/* お花が育つメインの茎と花のパーツ */}
                <div className="relative w-full h-64 flex flex-col items-center justify-end">
                  
                  {/* お花から立ちのぼる魔法の光のバブルエフェクト (お花が咲き始める45%以上で湧き出る) */}
                  {progressPercent >= 45 && (
                    <>
                      <span className="absolute bottom-32 left-[48%] text-lg animate-float-bubble text-yellow-300">🫧</span>
                      <span className="absolute bottom-24 left-[53%] text-xl animate-float-bubble text-pink-300" style={{ animationDelay: '1.5s' }}>✨</span>
                      <span className="absolute bottom-40 left-[45%] text-lg animate-float-bubble text-green-300" style={{ animationDelay: '3s' }}>🫧</span>
                      <span className="absolute bottom-28 left-[51%] text-xl animate-float-bubble text-blue-300" style={{ animationDelay: '4.5s' }}>💫</span>
                    </>
                  )}

                  {progressPercent < 20 && (
                    <div className="text-5xl animate-bounce mb-12">🌱</div>
                  )}
                  {progressPercent >= 20 && progressPercent < 45 && (
                    <div className="flex flex-col items-center mb-12">
                      <div className="text-4xl animate-pulse">🌱</div>
                      <div className="w-2.5 h-6 bg-green-500 rounded shadow-sm" />
                    </div>
                  )}
                  {progressPercent >= 45 && progressPercent < 70 && (
                    <div className="flex flex-col items-center mb-10">
                      <div className="text-4.5xl animate-bounce">🌿</div>
                      <div className="w-3 h-14 bg-green-500 rounded shadow-sm relative">
                        <div className="absolute -left-3 top-2 text-sm">🍃</div>
                      </div>
                    </div>
                  )}
                  {progressPercent >= 70 && progressPercent < 90 && (
                    <div className="flex flex-col items-center mb-6">
                      <div className="text-5xl animate-bounce">🌷</div>
                      <div className="w-4.5 h-24 bg-green-500 rounded relative shadow-sm">
                        <div className="absolute -left-3 top-4 text-sm">🍃</div>
                        <div className="absolute -right-3 top-8 text-sm">🍃</div>
                      </div>
                    </div>
                  )}
                  {progressPercent >= 90 && (
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-8xl animate-bounce drop-shadow-lg">🌸</div>
                      <div className="w-4.5 h-28 bg-green-500 rounded relative shadow-sm">
                        <div className="absolute -left-3 top-4 text-sm animate-pulse">🍃</div>
                        <div className="absolute -right-3 top-10 text-sm animate-pulse">🍃</div>
                      </div>
                    </div>
                  )}

                  {/* 最下部の土壌 */}
                  <div className="w-full h-16 bg-amber-800 border-t-8 border-amber-900 shadow-inner flex items-center justify-center">
                    <span className="text-xs text-amber-200 font-bold opacity-60">お花のひろば 🌷✨</span>
                  </div>
                </div>

                {/* 90%以上で画面全体にヒラヒラと美しく舞い散る「桜吹雪（フラワーシャワー）」 */}
                {progressPercent >= 90 && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <span className="absolute left-[5%] text-2xl animate-cherry-blossom" style={{ animationDelay: '0s', animationDuration: '6s' }}>🌸</span>
                    <span className="absolute left-[15%] text-xl animate-cherry-blossom" style={{ animationDelay: '2s', animationDuration: '8s' }}>🌸</span>
                    <span className="absolute left-[28%] text-2xl animate-cherry-blossom" style={{ animationDelay: '4s', animationDuration: '7s' }}>🌸</span>
                    <span className="absolute left-[45%] text-3xl animate-cherry-blossom" style={{ animationDelay: '1s', animationDuration: '9s' }}>🌸</span>
                    <span className="absolute left-[62%] text-xl animate-cherry-blossom" style={{ animationDelay: '3s', animationDuration: '6.5s' }}>🌸</span>
                    <span className="absolute left-[78%] text-2xl animate-cherry-blossom" style={{ animationDelay: '5s', animationDuration: '7.5s' }}>🌸</span>
                    <span className="absolute left-[90%] text-xl animate-cherry-blossom" style={{ animationDelay: '1.5s', animationDuration: '8.5s' }}>🌸</span>
                  </div>
                )}
              </div>
            )}

            {/* 4. まほうでおそうじテーマ（部屋全体にゴミが浮遊し、魔法でキラキラに浄化する） */}
            {theme === 'cleaning' && (
              <>
                {/* 部屋の模様 */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:20px_20px]" />
                
                {/* 魔法使い (進捗バーを避けた高さに浮かせる ＆ 魔法陣オーラを追加) */}
                <div className="absolute bottom-28 left-6 flex flex-col items-center pointer-events-none">
                  {/* 魔法陣オーラ */}
                  <div className="absolute w-24 h-24 rounded-full bg-purple-500 bg-opacity-20 blur-md animate-ping" />
                  <div className="absolute w-20 h-20 rounded-full border-4 border-dashed border-purple-400 border-opacity-40 animate-spin-slow" />
                  
                  {/* 魔法のきらめき粒子 */}
                  <span className="absolute -top-6 text-2xl animate-bounce">✨💫</span>
                  <span className="absolute -right-6 text-xl animate-pulse text-yellow-300">✨</span>
                  
                  <div className="text-7xl animate-bounce font-bold relative z-10">
                    🧙
                  </div>
                  <span className="text-[9px] bg-purple-600 bg-opacity-80 text-purple-100 px-2 py-0.5 rounded-full font-bold mt-1 shadow-sm border border-purple-400">
                    まほうつかい
                  </span>
                </div>

                {garbageData.map((garbage) => {
                  const isCleaned = progressPercent >= garbage.progress;
                  return (
                    <React.Fragment key={garbage.id}>
                      {/* ゴミ本体（未おそうじのときのみ表示） */}
                      <span
                        className={`absolute text-4xl transition-all duration-1000 select-none
                          ${isCleaned ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 animate-pulse'}
                        `}
                        style={garbage.style}
                      >
                        {garbage.icon}
                      </span>
                      
                      {/* ゴミが消えた後の派手なキラキラ魔法エフェクト (おそうじ完了後にきらめきが残る！) */}
                      {isCleaned && (
                        <span
                          className="absolute text-3xl select-none animate-ping text-yellow-300 opacity-80"
                          style={garbage.style}
                        >
                          ✨
                        </span>
                      )}
                      {isCleaned && (
                        <span
                          className="absolute text-2xl select-none animate-pulse text-purple-300 opacity-60"
                          style={{
                            ...garbage.style,
                            transform: 'translate(12px, -12px)'
                          }}
                        >
                          💫
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* 満点おそうじ完了キラキラエフェクト */}
                {progressPercent >= 90 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl animate-ping opacity-40 text-yellow-300">✨✨</span>
                  </div>
                )}
              </>
            )}

            {/* 5. ゆうしゃぼうけんテーマ（進捗バーを避けた高さに浮かぶ空中草原ロード） */}
            {theme === 'adventure' && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 草原フライングロード */}
                <div className="absolute bottom-28 inset-x-0 h-14 bg-gradient-to-r from-green-400 to-emerald-500 border-y-4 border-emerald-600 shadow-lg">
                  {/* ロード上の勇者 */}
                  <div className="absolute -top-10 left-10 flex flex-col items-center">
                    <span className="text-5xl animate-bounce">🧑‍🎤⚔️</span>
                  </div>

                  {/* ロード上の敵 */}
                  <div className="absolute -top-10 right-10 flex flex-col items-center animate-pulse">
                    <span className="text-5xl">{enemy.icon}</span>
                    <span className="text-[8px] bg-red-500 text-white px-1 rounded font-bold leading-none py-0.5 mt-0.5 shadow">
                      {enemy.name}
                    </span>
                    <span className="text-[10px] leading-none mt-0.5 text-red-500">{enemy.hp}</span>
                  </div>

                  {/* ヒットマーク */}
                  {progressPercent > 0 && progressPercent % 20 < 5 && (
                    <div className="absolute -top-12 right-16 text-2xl text-yellow-500 font-bold animate-ping">
                      ✨POW!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 前面操作・UIレイヤー（z-10 / グラスモルフィズムによる高い視認性） */}
      {/* ========================================================================= */}
      <header className="grid grid-cols-3 items-center mb-8 relative z-10 w-full">
        {/* 左：やめるボタン */}
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            onClick={handleCancel} 
            className={`h-12 px-5 rounded-full font-bold transition-all shadow-sm flex items-center justify-center whitespace-nowrap text-sm border ${
              isBreak 
                ? 'bg-indigo-900 bg-opacity-70 text-indigo-200 border-indigo-700 hover:text-indigo-100' 
                : 'bg-white bg-opacity-80 text-gray-500 border-gray-100 hover:bg-gray-100'
            }`}
          >
            やめる
          </Button>
        </div>
        
        {/* 中央：ステータス表示（完全に中央で縦横が揃う） */}
        <div className="flex justify-center">
          <div className={`text-sm md:text-base font-bold px-4 py-2.5 rounded-full shadow-sm flex items-center gap-1.5 justify-center whitespace-nowrap border ${
            isBreak 
              ? 'bg-indigo-900 bg-opacity-70 text-indigo-200 border-indigo-700' 
              : 'bg-white bg-opacity-80 text-text-main border-gray-100'
          }`}>
            {isBreak ? (
              <span className="flex items-center gap-1">きゅうけいちゅう <span className="text-sm">💤</span></span>
            ) : (
              <span className="flex items-center gap-1">おべんきょうちゅう <span className="text-sm">✏️</span></span>
            )}
          </div>
        </div>

        {/* 右：お勉強終了ボタン */}
        <div className="flex justify-end">
          <Button 
            onClick={handleFinish} 
            className={`h-12 px-4 rounded-full font-bold transition-all shadow-md flex items-center justify-center whitespace-nowrap text-xs md:text-sm border-b-4 ${
              isBreak 
                ? 'bg-orange-500 hover:bg-orange-400 text-white border-orange-700 shadow-orange-950/20' 
                : 'bg-primary hover:bg-opacity-90 text-white border-orange-600'
            }`}
          >
            おわる 🏆
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-between pb-8 relative z-10">
        
        {/* 上部：応援メッセージの吹き出し（お勉強中のみ表示、休憩中は非表示） */}
        {!isBreak && currentMessage && (
          <div 
            className={`w-full max-w-sm flex justify-center mt-2 transition-all duration-500 transform relative z-20
              ${isBubbleVisible 
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
              }
            `}
          >
            <div className="bg-white bg-opacity-95 rounded-3xl px-5 py-3 shadow-md border-4 border-pastel-yellow flex items-center gap-3 max-w-[95%] text-text-main animate-bounce">
              <span className="text-2xl">✨</span>
              <div className="text-left font-bold">
                <p className="text-[10px] font-bold text-gray-400 leading-none">{currentMessage.name}</p>
                <p className="text-sm font-bold leading-tight mt-1">{currentMessage.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* 休憩中用の「もりのたね」ミニゲームUI (羊さんの上部に浮かせる) */}
        {isBreak && (
          <div className="w-full max-w-xs bg-indigo-900 bg-opacity-90 rounded-3xl p-4 shadow-xl border-2 border-indigo-600 flex flex-col items-center text-center space-y-3 my-2">
            <div className="flex justify-between items-center w-full px-2">
              <span className="text-xs font-bold text-indigo-300">🌱 もりのたねの育成</span>
              <span className="text-xs font-extrabold text-yellow-300 bg-indigo-950 px-2 py-0.5 rounded-full">
                たね：{seeds}こ
              </span>
            </div>
            
            <p className="text-[10px] font-bold text-indigo-200">
              たねを植えると、森に木や動物がやってくるよ！
            </p>

            <button
              onClick={handlePlantSeed}
              disabled={seeds <= 0}
              className={`w-full py-2.5 rounded-2xl font-bold text-sm shadow transition-all border-b-4 flex items-center justify-center gap-1.5
                ${seeds > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-white animate-pulse'
                  : 'bg-indigo-950 border-indigo-900 text-indigo-400 cursor-not-allowed opacity-60'
                }
              `}
            >
              <span>🌱</span>
              <span>たねを まく！</span>
            </button>
          </div>
        )}

        {/* 中央：円形タイマー */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          {/* グラスモルフィズム円形背景 */}
          <div className={`absolute w-56 h-56 rounded-full shadow-inner ${
            isBreak ? 'bg-indigo-950 bg-opacity-40 border border-indigo-900' : 'bg-white bg-opacity-80'
          } backdrop-blur-sm z-0`} />
          
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 z-10" viewBox="0 0 256 256">
            <defs>
              {/* お勉強中のにじいろ虹色グラデーション */}
              <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7b54" />   {/* 元気なオレンジ赤 */}
                <stop offset="25%" stopColor="#ffb26b" />  {/* パステルオレンジ */}
                <stop offset="50%" stopColor="#ffd56b" />  {/* かわいい黄色 */}
                <stop offset="75%" stopColor="#93ffd8" />  {/* やさしいミントグリーン */}
                <stop offset="100%" stopColor="#bdb2ff" /> {/* ゆめかわ紫 */}
              </linearGradient>

              {/* 休憩中の夢心地ブルー＆パープルグラデーション */}
              <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a0c4ff" />   {/* やさしいブルー */}
                <stop offset="50%" stopColor="#bdb2ff" />  {/* パステルパープル */}
                <stop offset="100%" stopColor="#ffc6ff" /> {/* ゆめかわピンク */}
              </linearGradient>
            </defs>

            {/* 背景の円 */}
            <circle
              cx="128"
              cy="128"
              r="116"
              stroke={isBreak ? '#2e2a72' : '#f3f4f6'}
              strokeWidth="12"
              fill="transparent"
            />
            {/* プログレス円 */}
            <circle
              cx="128"
              cy="128"
              r="116"
              stroke={isBreak ? 'url(#breakGradient)' : 'url(#rainbowGradient)'}
              strokeWidth="12"
              fill="transparent"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]"
              strokeDasharray={2 * Math.PI * 116}
              strokeDashoffset={2 * Math.PI * 116 * (1 - progressRatio)}
            />
          </svg>
          <div className={`text-6xl font-extrabold z-20 font-sans tracking-wider ${isBreak ? 'text-white' : 'text-text-main'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* 下部：進捗ゲージ（もりのにぎやかさ） */}
        {!isBreak && (
          <div className="w-full max-w-sm bg-white bg-opacity-90 rounded-3xl p-3.5 shadow-md border-2 border-pastel-pink flex flex-col items-center space-y-2 mt-4">
            <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden border border-gray-200">
              <div 
                className="bg-pastel-green h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs font-bold text-gray-500">
              {themeNames[theme]}：{progressPercent}% 完了
            </div>
          </div>
        )}
        
        {/* BGMの再生（タイマー動作中のみ） */}
        <BGMPlayer isBreak={isBreak} />
      </main>
    </div>
  );
};
