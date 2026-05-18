import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Ruby } from '../components/ui/Ruby';

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    isFirstLaunch, 
    setFirstLaunch,
    resetStamps 
  } = useStore();
  const navigate = useNavigate();

  // すでにパスワードが設定されているか
  const hasExistingPassword = !!settings.password;

  // 各種入力用ステート
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reward, setReward] = useState(settings.rewardText || '');
  const [goalStamps, setGoalStamps] = useState(settings.goalStamps || 10);

  const handleSave = () => {
    // 1. すでにパスワードが設定されている場合、現在のパスワード一致チェックを行う
    if (hasExistingPassword) {
      if (currentPasswordInput !== settings.password) {
        alert('「いまのパスワード」が正しくありません！');
        return;
      }
    }

    // 2. ゴールスタンプ数のバリデーション（10個〜50個）
    if (goalStamps < 10 || goalStamps > 50) {
      alert('ゴールスタンプ数は 10個 〜 50個 の範囲で設定してください！');
      return;
    }

    // 3. 新しいパスワードが入力されている場合のバリデーション
    let finalPassword = settings.password || '';
    if (newPassword) {
      if (newPassword.length < 4) {
        alert('新しいパスワードは4文字以上で入力してください！');
        return;
      }
      finalPassword = newPassword;
    } else if (!hasExistingPassword) {
      // 初回設定時なのにパスワードが空の場合
      alert('保護者用パスワードを4文字以上で設定してください！');
      return;
    }

    // 4. 設定の保存・更新
    updateSettings({ 
      password: finalPassword, 
      rewardText: reward,
      goalStamps: Number(goalStamps)
    });

    if (isFirstLaunch) {
      setFirstLaunch(false);
    }
    
    alert('設定を保存しました！ ✨');
    navigate('/');
  };

  // スタンプのリセット処理
  const handleResetStamps = () => {
    // セキュリティチェック：パスワード設定済みの場合は現在のパスワード入力が必要
    if (hasExistingPassword && currentPasswordInput !== settings.password) {
      alert('スタンプをリセットするには、「いまのパスワード」を正しく入力してください！');
      return;
    }

    if (window.confirm('これまでに あつめたスタンプを ぜんぶ【0個】に リセットしますか？\n（消えたスタンプは もとに もどりません）')) {
      resetStamps();
      alert('スタンプをリセットしました！ 🧹✨');
    }
  };

  return (
    <div className="p-6 min-h-screen flex flex-col justify-center max-w-sm mx-auto space-y-6 bg-pastel-blue bg-opacity-20 rounded-3xl">
      <h1 className="text-2xl font-bold text-center text-primary bg-white py-2.5 px-6 rounded-full shadow-sm">
        <Ruby kanji="保護者" furigana="ほごしゃ" />設定
      </h1>

      <div className="bg-white rounded-3xl p-6 shadow-md border-4 border-pastel-pink space-y-5 text-left">
        
        {/* === 【重要】現在のパスワード確認欄 (パスワード登録済みのときのみ表示) === */}
        {hasExistingPassword && (
          <div className="space-y-1">
            <label className="block font-extrabold text-xs text-text-main">
              🔑 <Ruby kanji="現在" furigana="いま" />のパスワード
            </label>
            <input
              type="password"
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              className="w-full border-4 border-pastel-pink rounded-2xl p-2.5 text-base outline-none focus:border-primary transition-all text-center font-bold"
              placeholder="現在のパスワードを入力"
            />
            <p className="text-[9px] text-gray-400 font-bold text-center">
              設定変更やリセットには、いまのパスワード入力が必要です。
            </p>
          </div>
        )}

        {/* ゴールスタンプ数の設定欄 */}
        <div className="space-y-1">
          <label className="block font-extrabold text-xs text-text-main">
            🎯 ゴールスタンプの数（10個〜50個）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="10"
              max="50"
              value={goalStamps}
              onChange={(e) => setGoalStamps(Number(e.target.value))}
              className="w-full border-4 border-pastel-blue rounded-2xl p-2.5 text-base outline-none focus:border-primary transition-all text-center font-bold"
            />
            <span className="font-extrabold text-text-main text-sm whitespace-nowrap">こ</span>
          </div>
          <p className="text-[9px] text-gray-400 font-bold">
            ごほうびカードのスタンプ枠数を 10 〜 50 個の間で自由に変えられます。
          </p>
        </div>

        {/* 新しいパスワード入力欄 */}
        <div className="space-y-1">
          <label className="block font-extrabold text-xs text-text-main">
            ✨ 新しいパスワード {hasExistingPassword && '（変更する場合のみ）'}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border-4 border-secondary rounded-2xl p-2.5 text-base outline-none focus:border-primary transition-all text-center"
            placeholder={hasExistingPassword ? "新しいパスワードを設定" : "4文字以上の数字など"}
          />
        </div>

        {/* ごほうびの内容入力欄 */}
        <div className="space-y-1">
          <label className="block font-extrabold text-xs text-text-main">
            🎁 ごほうびの<Ruby kanji="内容" furigana="ないよう" />
          </label>
          <input
            type="text"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            className="w-full border-4 border-pastel-green rounded-2xl p-2.5 text-base outline-none focus:border-primary transition-all text-center font-bold"
            placeholder="例：ケーキをたべる！"
          />
        </div>

        {/* === スタンプリセットセクション === */}
        <div className="pt-2 border-t-2 border-gray-100 space-y-2">
          <label className="block font-extrabold text-xs text-red-500">
            ⚠️ スタンプのリセット
          </label>
          <button
            type="button"
            onClick={handleResetStamps}
            className="w-full py-2.5 rounded-2xl font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-300 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>🧹</span>
            <span>スタンプを 0こに リセットする</span>
          </button>
        </div>

      </div>

      <div className="text-center">
        <Button 
          onClick={handleSave} 
          className="w-full text-lg h-14 shadow-lg border-b-6 border-orange-600 rounded-2xl" 
          variant="primary"
        >
          <Ruby kanji="保存" furigana="ほぞん" />して戻る
        </Button>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-500 underline"
        >
          キャンセルして戻る
        </button>
      </div>
    </div>
  );
};
