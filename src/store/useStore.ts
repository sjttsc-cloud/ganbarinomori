import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudySession {
  id: string;
  date: string; // ISO string
  durationMinutes: number;
  type: 'study';
}

export interface AppSettings {
  password?: string;
  goalStamps: number;
  rewardText: string;
  bgmType: 'none' | 'music' | 'brownNoise';
}

export interface ForestObject {
  id: string;
  type: 'tree' | 'animal' | 'house' | 'river';
  name: string;
  emoji: string;
  x: number; // 画面上のX座標百分率
  y: number; // 画面上のY座標百分率
}

interface AppState {
  stamps: number;
  history: StudySession[];
  settings: AppSettings;
  isFirstLaunch: boolean;
  
  // ミニゲーム「もりのたね」用のステート
  seeds: number;
  lastEarnedSeeds: number; // 直前のセッションで獲得したたねの数（保護者キャンセル用）
  forestObjects: ForestObject[];
  discoveredObjects: string[]; // これまでに発見したオブジェクトの名前リスト（図鑑用）
  hasUnclaimedStamp: boolean; // 前回の学習後にスタンプが未獲得かどうか
  
  addStamp: (amount: number) => void;
  addSession: (session: StudySession) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setFirstLaunch: (val: boolean) => void;
  
  // ミニゲーム「もりのたね」用のアクション
  addSeed: (amount: number) => void;
  useSeed: () => { success: boolean; object?: ForestObject };
  resetForest: () => void;
  setHasUnclaimedStamp: (val: boolean) => void;
  resetStamps: () => void; // スタンプ全クリア用
  cancelUnclaimedStamp: () => void; // 今回のスタンプ無効化用
  addDiscoveredObject: (name: string) => void; // 新たに図鑑に登録する
}

// ランダムに森オブジェクトを選択するための候補リスト
const OBJECT_TEMPLATES = [
  // --- き（全13種類） ---
  { type: 'tree', name: 'もりの大木', emoji: '🌳' },
  { type: 'tree', name: 'もみの木', emoji: '🌲' },
  { type: 'tree', name: 'ヤシの木', emoji: '🌴' },
  { type: 'tree', name: 'もみじ', emoji: '🍁' },
  { type: 'tree', name: 'さくら', emoji: '🌸' },
  { type: 'tree', name: 'サボテン', emoji: '🌵' },
  { type: 'tree', name: 'ひまわり', emoji: '🌻' },
  { type: 'tree', name: 'チューリップ', emoji: '🌷' },
  { type: 'tree', name: 'バラ', emoji: '🌹' },
  { type: 'tree', name: 'りんごの木', emoji: '🍎' },
  { type: 'tree', name: 'バナナの木', emoji: '🍌' },
  { type: 'tree', name: 'クローバー', emoji: '🍀' },
  { type: 'tree', name: 'たけのこ', emoji: '🎍' },
  
  // --- どうぶつ（全20種類） ---
  { type: 'animal', name: 'キツネさん', emoji: '🦊' },
  { type: 'animal', name: 'ウサギさん', emoji: '🐰' },
  { type: 'animal', name: 'リスさん', emoji: '🐿️' },
  { type: 'animal', name: '小鳥さん', emoji: '🐦' },
  { type: 'animal', name: 'くまさん', emoji: '🐻' },
  { type: 'animal', name: 'フクロウさん', emoji: '🦉' },
  { type: 'animal', name: 'ネコさん', emoji: '🐱' },
  { type: 'animal', name: 'イヌさん', emoji: '🐶' },
  { type: 'animal', name: 'コアラさん', emoji: '🐨' },
  { type: 'animal', name: 'パンダさん', emoji: '🐼' },
  { type: 'animal', name: 'ライオンさん', emoji: '🦁' },
  { type: 'animal', name: 'トラさん', emoji: '🐯' },
  { type: 'animal', name: 'サルさん', emoji: '🐒' },
  { type: 'animal', name: 'カエルさん', emoji: '🐸' },
  { type: 'animal', name: 'シカさん', emoji: '🦌' },
  { type: 'animal', name: 'ハムスターさん', emoji: '🐹' },
  { type: 'animal', name: 'ハチさん', emoji: '🐝' },
  { type: 'animal', name: 'チョウチョさん', emoji: '🦋' },
  { type: 'animal', name: 'カメさん', emoji: '🐢' },
  { type: 'animal', name: 'ペンギンさん', emoji: '🐧' },
  
  // --- おうち（全10種類） ---
  { type: 'house', name: '木の家', emoji: '🏡' },
  { type: 'house', name: 'テント', emoji: '🛖' },
  { type: 'house', name: 'きのこの家', emoji: '🍄' },
  { type: 'house', name: 'レンガの家', emoji: '🧱' },
  { type: 'house', name: 'お城', emoji: '🏰' },
  { type: 'house', name: 'サーカステント', emoji: '🎪' },
  { type: 'house', name: '郵便ポスト', emoji: '📮' },
  { type: 'house', name: 'すべり台', emoji: '🛝' },
  { type: 'house', name: 'メリーゴーランド', emoji: '🎠' },
  { type: 'house', name: 'キャンピングカー', emoji: '🚐' },
  
  // --- しぜん（全12種類） ---
  { type: 'river', name: 'ちいさな川', emoji: '🌊' },
  { type: 'river', name: 'もりの噴水', emoji: '⛲' },
  { type: 'river', name: '木の橋', emoji: '🪵' },
  { type: 'river', name: 'にじ', emoji: '🌈' },
  { type: 'river', name: 'お星さま', emoji: '🌟' },
  { type: 'river', name: 'お月さま', emoji: '🌙' },
  { type: 'river', name: 'たき火', emoji: '🔥' },
  { type: 'river', name: '雲', emoji: '☁️' },
  { type: 'river', name: '流れ星', emoji: '💫' },
  { type: 'river', name: '結晶', emoji: '❄️' },
  { type: 'river', name: 'たき', emoji: '🏞️' },
  { type: 'river', name: 'ちいさな火山', emoji: '🌋' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      stamps: 0,
      history: [],
      settings: {
        goalStamps: 10,
        rewardText: 'ケーキをたべる！',
        bgmType: 'none',
      },
      isFirstLaunch: true,
      
      // 初期値
      seeds: 0,
      lastEarnedSeeds: 0,
      forestObjects: [],
      discoveredObjects: [], // 図鑑データの初期値
      hasUnclaimedStamp: false,
      
      addStamp: (amount) => set((state) => {
        // スタンプが付与されたら、未獲得フラグをクリアする
        const nextStamps = Math.max(0, state.stamps + amount);
        
        // 付与されたスタンプ数分、学習セッション履歴を自動生成してカレンダー履歴へ同期追加！
        const newSessions: StudySession[] = [];
        const nowStr = new Date().toISOString();
        for (let i = 0; i < amount; i++) {
          newSessions.push({
            id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            date: nowStr,
            durationMinutes: 10, // 標準的な学習時間
            type: 'study'
          });
        }

        return { 
          stamps: nextStamps,
          hasUnclaimedStamp: false, // ごほうび獲得に成功したのでフラグ解除
          history: [...state.history, ...newSessions] // 学習のきろくのカレンダーへ完璧に連動！
        };
      }),
      
      addSession: (session) => set((state) => {
        // お勉強が1回完了すると、時間に応じた量のたねを入手 ＆ スタンプ未獲得フラグON
        // ５分→1個、10分→1個、15分→2個、20分→2個、30分→3個、45分→3個、60分→5個
        const minutes = session.durationMinutes;
        let seedEarned = 1;
        if (minutes >= 60) {
          seedEarned = 5;
        } else if (minutes >= 45) {
          seedEarned = 3;
        } else if (minutes >= 30) {
          seedEarned = 3;
        } else if (minutes >= 20) {
          seedEarned = 2;
        } else if (minutes >= 15) {
          seedEarned = 2;
        } else {
          seedEarned = 1;
        }

        return { 
          seeds: state.seeds + seedEarned, 
          lastEarnedSeeds: seedEarned, // 今回獲得したたねの数を記録
          hasUnclaimedStamp: true 
        };
      }),
      
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setFirstLaunch: (val) => set({ isFirstLaunch: val }),
      
      // たねの付与
      addSeed: (amount) => set((state) => ({ seeds: state.seeds + amount })),
      
      // たねの消費＆森オブジェクト生成
      useSeed: () => {
        const { seeds, discoveredObjects } = get();
        if (seeds <= 0) {
          return { success: false };
        }
        
        // ランダムなテンプレートを選出
        const template = OBJECT_TEMPLATES[Math.floor(Math.random() * OBJECT_TEMPLATES.length)];
        
        // タイマーなどのUIに被りにくいよう、画面の空いている範囲にランダム配置
        const x = Math.floor(Math.random() * 80) + 10;
        const y = Math.floor(Math.random() * 65) + 15;
        
        const newObject: ForestObject = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          type: template.type as any,
          name: template.name,
          emoji: template.emoji,
          x,
          y,
        };

        // 図鑑への登録判定（まだ発見していなければ追加）
        const nextDiscovered = discoveredObjects.includes(template.name)
          ? discoveredObjects
          : [...discoveredObjects, template.name];
        
        set((state) => ({
          seeds: state.seeds - 1,
          forestObjects: [...state.forestObjects, newObject],
          discoveredObjects: nextDiscovered
        }));
        
        return { success: true, object: newObject };
      },
      
      // 森のリセット（森の描画データとたねは消すが、集めた図鑑実績は消さない親切仕様）
      resetForest: () => set({ forestObjects: [], seeds: 0 }),
      
      // スタンプ獲得状態の直接管理
      setHasUnclaimedStamp: (val) => set({ hasUnclaimedStamp: val }),
 
      // スタンプの完全リセット（スタンプ数、未獲得フラグ、森、たねは消すが、子供のコレクションの実績である図鑑データは安全に保持する）
      resetStamps: () => set({ stamps: 0, hasUnclaimedStamp: false, forestObjects: [], seeds: 0, lastEarnedSeeds: 0 }),

      // 今回のスタンプ無効化（獲得したたねも減らす）
      cancelUnclaimedStamp: () => set((state) => ({ 
        hasUnclaimedStamp: false, 
        seeds: Math.max(0, state.seeds - state.lastEarnedSeeds),
        lastEarnedSeeds: 0
      })),

      // 個別の図鑑登録アクション（後からマージする際などに使用）
      addDiscoveredObject: (name) => set((state) => {
        if (state.discoveredObjects.includes(name)) return {};
        return { discoveredObjects: [...state.discoveredObjects, name] };
      }),
    }),
    {
      name: 'ganbari-no-mori-storage',
    }
  )
);
