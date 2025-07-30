import { useEffect, useRef } from 'react';

export const CosmicBackground = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createStars = () => {
      if (!backgroundRef.current) return;

      // Создаем звёзды
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'absolute w-1 h-1 bg-white rounded-full opacity-70';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animation = `stardust-twinkle ${2 + Math.random() * 3}s ease-in-out infinite`;
        star.style.animationDelay = Math.random() * 3 + 's';
        backgroundRef.current.appendChild(star);
      }

      // Создаем падающие метеоры
      for (let i = 0; i < 3; i++) {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        meteor.style.left = Math.random() * 100 + '%';
        meteor.style.top = Math.random() * 100 + '%';
        meteor.style.animationDelay = Math.random() * 10 + 's';
        backgroundRef.current.appendChild(meteor);
      }
    };

    const timeout = setTimeout(createStars, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div 
      ref={backgroundRef}
      className="fixed inset-0 pointer-events-none z-0 cosmic-background"
    >
      {/* Основной космический фон с градиентом */}
      <div className="absolute inset-0 bg-gradient-nebula opacity-90" />
      
      {/* Космические туманности */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-stardust opacity-20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-2xl float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-secondary/10 rounded-full filter blur-3xl float" />
      </div>
    </div>
  );
};