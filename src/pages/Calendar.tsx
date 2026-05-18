import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Ruby } from '../components/ui/Ruby';
import { Home as HomeIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { history } = useStore();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 1日の曜日を取得
  const startDay = new Date(year, month, 1).getDay();
  // 月の最終日を取得
  const lastDate = new Date(year, month + 1, 0).getDate();

  const blanks = Array(startDay).fill(null);
  const daysInMonth = Array.from({ length: lastDate }, (_, i) => new Date(year, month, i + 1));

  // 日ごとの学習回数を集計する
  const getDailyStamps = (day: Date) => {
    return history.filter(session => {
      const sDate = new Date(session.date);
      return sDate.getFullYear() === day.getFullYear() && 
             sDate.getMonth() === day.getMonth() && 
             sDate.getDate() === day.getDate();
    }).length;
  };

  const getMedal = (count: number) => {
    if (count >= 4) return '🥇'; // 4〜5個 金メダル
    if (count >= 2) return '🥈'; // 2〜3個 銀メダル
    if (count === 1) return '🥉'; // 1個 銅メダル
    return null;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.getFullYear() === today.getFullYear() && 
           day.getMonth() === today.getMonth() && 
           day.getDate() === today.getDate();
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-12 h-12 p-0 rounded-full">
          <HomeIcon size={24} />
        </Button>
        <h1 className="text-xl font-bold text-primary">
          <Ruby kanji="学習" furigana="がくしゅう" />のきろく
        </h1>
        <div className="w-12"></div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-secondary w-full max-w-sm">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="p-1 h-auto">
              <ChevronLeft />
            </Button>
            <h2 className="text-xl font-bold">
              {year}年 {month + 1}月
            </h2>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} className="p-1 h-auto">
              <ChevronRight />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className="font-bold text-gray-400 text-sm">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="p-2" />
            ))}
            {daysInMonth.map((day, i) => {
              const count = getDailyStamps(day);
              const medal = getMedal(count);
              const todayFlag = isToday(day);
              return (
                <div 
                  key={`day-${i}`} 
                  className={`p-1 rounded-xl flex flex-col items-center justify-center min-h-[50px]
                    ${todayFlag ? 'bg-orange-50 border-2 border-primary' : ''}
                  `}
                >
                  <span className={`text-sm font-bold ${todayFlag ? 'text-primary' : 'text-text-main'}`}>
                    {day.getDate()}
                  </span>
                  <div className="text-lg h-6 leading-none mt-1">
                    {medal}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 font-bold bg-white p-4 rounded-2xl border-2 border-gray-100 w-full max-w-sm">
          <p className="mb-2">メダルのいみ</p>
          <div className="flex justify-center gap-4 text-sm">
            <span>🥇 4かいいじょう</span>
            <span>🥈 2〜3かい</span>
            <span>🥉 1かい</span>
          </div>
        </div>
      </main>
    </div>
  );
};
