import React from 'react';

interface RubyProps {
  kanji: string;
  furigana: string;
  className?: string;
}

export const Ruby: React.FC<RubyProps> = ({ kanji, furigana, className = '' }) => {
  return (
    <ruby className={`inline-block text-center align-middle mx-0.5 ${className}`} style={{ rubyPosition: 'over' }}>
      {kanji}
      <rt 
        className="font-black text-amber-800 select-none tracking-tight pb-0.5 text-center" 
        style={{ 
          display: 'ruby-text', 
          fontSize: '0.6em', 
          lineHeight: '1', 
          rubyPosition: 'over' 
        }}
      >
        {furigana}
      </rt>
    </ruby>
  );
};

export const TextWithRuby: React.FC<{ text: React.ReactNode, className?: string }> = ({ text, className }) => {
  return <span className={className}>{text}</span>;
}
