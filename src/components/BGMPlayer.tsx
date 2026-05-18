import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

interface BGMPlayerProps {
  isBreak?: boolean;
}

export const BGMPlayer: React.FC<BGMPlayerProps> = ({ isBreak = false }) => {
  const { settings } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  // public フォルダに追加された新しい音源ファイルを指定します（100MB未満でGit・Web対応）
  const audioUrls = {
    music: '/BGM.wav',
    brownNoise: '/ブラウンノイズ.wav',
    break: '/たこさんウインナー .wav',
  };

  // 休憩中でおべんきょうミュート設定（none）でない場合は自動的に「休憩中.mp3」に変更
  const getAudioUrl = () => {
    if (settings.bgmType === 'none') return '';
    if (isBreak) return audioUrls.break;
    return audioUrls[settings.bgmType] || '';
  };

  const audioUrl = getAudioUrl();

  // 曲の終わりに一瞬だけ「プチッ」と途切れるのを防ぎ、シームレスに永久ループさせるためのイベント処理
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    if (audio.duration && audio.currentTime > 0) {
      const gapBuffer = 0.15; // 途切れを防ぐバッファ時間（秒）
      if (audio.duration - audio.currentTime < gapBuffer) {
        audio.currentTime = 0;
        audio.play().catch(err => {
          // 自動再生ポリシーによる一時的ブロックを考慮
          console.log("シームレスループの再再生待機:", err);
        });
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (!audioUrl) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        // 音源を設定して再生
        audioRef.current.volume = 0.3; // 音量を少し下げる
        
        // 音源が切り替わったら確実にリロードして再再生する
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        
        // ブラウザの自動再生ブロックをハンドリング
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("自動再生がブロックされました。画面をタップしてください:", error);
          });
        }
      }
    }
  }, [audioUrl]);

  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      loop
      onTimeUpdate={handleTimeUpdate}
      className="hidden" // HTML5 Audioはhiddenでも再生可能
    />
  );
};
