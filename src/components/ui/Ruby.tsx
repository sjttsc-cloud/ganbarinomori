import React from 'react';

interface RubyProps {
  kanji: string;
  furigana: string;
  className?: string;
}

export const Ruby: React.FC<RubyProps> = ({ kanji, furigana, className = '' }) => {
  return (
    <ruby className={`inline-block text-center align-middle mx-0.5 ${className}`}>
      {kanji}
      <rt className="text-[9px] font-black text-gray-400 select-none tracking-tight pb-0.5">
        {furigana}
      </rt>
    </ruby>
  );
};

export const TextWithRuby: React.FC<{ text: React.ReactNode, className?: string }> = ({ text, className }) => {
  return <span className={className}>{text}</span>;
}
