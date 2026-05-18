import React from 'react';

interface RubyProps {
  kanji: string;
  furigana: string;
  className?: string;
}

export const Ruby: React.FC<RubyProps> = ({ kanji, furigana, className = '' }) => {
  return (
    <ruby className={`relative inline-block leading-none mx-0.5 ${className}`} style={{ rubyPosition: 'under' }}>
      {kanji}
      <rt className="absolute bottom-full left-1/2 -translate-x-1/2 w-max text-center text-[0.55em] text-gray-500 font-bold mb-0.5" style={{ display: 'block' }}>
        {furigana}
      </rt>
    </ruby>
  );
};

export const TextWithRuby: React.FC<{ text: React.ReactNode, className?: string }> = ({ text, className }) => {
  return <span className={className}>{text}</span>;
}
