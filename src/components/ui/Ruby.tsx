import React from 'react';

interface RubyProps {
  kanji: string;
  furigana: string;
  className?: string;
}

export const Ruby: React.FC<RubyProps> = ({ kanji, furigana, className = '' }) => {
  return (
    <span className={`inline-flex flex-col items-center leading-none align-middle mx-0.5 ${className}`}>
      {/* 振り仮名 (ルビ) 部分 */}
      <span className="text-[9px] font-black text-gray-400 select-none pb-0.5 tracking-tight leading-none text-center">
        {furigana}
      </span>
      {/* 漢字部分 */}
      <span className="leading-none">
        {kanji}
      </span>
    </span>
  );
};

export const TextWithRuby: React.FC<{ text: React.ReactNode, className?: string }> = ({ text, className }) => {
  return <span className={className}>{text}</span>;
}
