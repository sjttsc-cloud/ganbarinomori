import React from 'react';

interface RubyProps {
  kanji: string;
  furigana: string;
  className?: string;
}

export const Ruby: React.FC<RubyProps> = ({ kanji, furigana, className = '' }) => {
  return (
    <span 
      className={`inline-block relative text-center mx-0.5 ${className}`} 
      style={{ verticalAlign: 'baseline' }}
    >
      {/* 漢字部分 (ベースラインに完全に固定され、沈み込みを100%防ぐ) */}
      <span className="leading-none">{kanji}</span>
      
      {/* 振り仮名 (ルビ) 部分 (漢字の上に絶対配置され、高さを持たないため段落を崩さない) */}
      <span 
        className="absolute bottom-full left-1/2 font-black text-amber-800 select-none tracking-tight text-center" 
        style={{ 
          transform: 'translate(-50%, -2px)', 
          fontSize: '9px', 
          lineHeight: '1',
          width: 'max-content',
          pointerEvents: 'none'
        }}
      >
        {furigana}
      </span>
    </span>
  );
};

export const TextWithRuby: React.FC<{ text: React.ReactNode, className?: string }> = ({ text, className }) => {
  return <span className={className}>{text}</span>;
}
