import React, { useState, useEffect } from 'react';

const motivationalQuotes: string[] = [
  'Be so good no one can ignore you',
  'Focus on being productive instead of busy',
  'The secret of getting ahead is getting started',
  'Small progress is still progress',
  'Today is a great day to accomplish something',
  'Make each day your masterpiece',
  'The harder you work, the luckier you get',
  'Success is the sum of small efforts repeated daily',
  'Dream big, start small, act now',
  'Your limitation—it\'s only your imagination',
  'Great things never come from comfort zones',
  'Don\'t stop when you\'re tired. Stop when you\'re done',
  'Wake up with determination. Go to bed with satisfaction',
  'Do something today that your future self will thank you for',
  'Little things make big days'
];

interface GreetingProps {
  userName?: string;
}

function Greeting({ userName }: GreetingProps) {
  const [greeting, setGreeting] = useState<string>('');
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    const updateGreeting = (): void => {
      const hour = new Date().getHours();
      let greetingText = '';

      if (hour >= 5 && hour < 12) {
        greetingText = 'Good Morning';
      } else if (hour >= 12 && hour < 17) {
        greetingText = 'Good Afternoon';
      } else if (hour >= 17 && hour < 22) {
        greetingText = 'Good Evening';
      } else {
        greetingText = 'Good Night';
      }

      setGreeting(greetingText);
    };

    const selectRandomQuote = (): void => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(motivationalQuotes[randomIndex]);
    };

    updateGreeting();
    selectRandomQuote();

    // Update greeting every minute in case time period changes
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayName = userName || 'STEVE ARMSTRONG';

  return (
    <div className="greeting-section">
      <h1 className="greeting-text">
        {greeting}, {displayName}
      </h1>
      <p className="motivational-quote">{quote}</p>
    </div>
  );
}

export default Greeting;
