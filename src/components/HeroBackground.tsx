'use client';

import React from 'react';

const ARTIFACT_IMAGES = [
  "https://images.unsplash.com/photo-1707068226685-27a15039f19b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwYXJ0aWZhY3QlMjBtdXNldW18ZW58MXx8fHwxNzc1NDYzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1737387818872-b476fa023874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwcmVsaWMlMjBzdG9uZXxlbnwxfHx8fDE3NzU0NjM5ODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1772149902755-5fc60d6350df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcm5hdGUlMjBzY3VscHR1cmUlMjBkYXJrfGVufDF8fHx8MTc3NTQ2Mzk4OXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1562162115-54cc44600875?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwY3J5c3RhbCUyMG1hY3JvfGVufDF8fHx8MTc3NTQ2Mzk4OXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMGFydGlmYWN0JTIwZ2xvd2luZ3xlbnwxfHx8fDE3NzU0NjM5ODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1762275194722-3a8c106adb0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3RoaWMlMjBzY3VscHR1cmUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc1MzgyODE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1575783383766-d47eae17de04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwbXVzZXVtJTIwZ29sZHxlbnwxfHx8fDE3NzU0NjM5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1761414140137-9d6a3c704a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMGpld2VsJTIwZGFya3xlbnwxfHx8fDE3NzU0NjM5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1626470408813-f0059745d58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlzdGFsJTIwZ2VvZGUlMjBzdG9uZXxlbnwxfHx8fDE3NzU0NjM5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1601458886250-2e6f975296a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnRpcXVlJTIwcmVsaWMlMjBtdXNldW18ZW58MXx8fHwxNzc1NDYzOTkyfDA&ixlib=rb-4.1.0&q=80&w=1080"
];

function getColumnImages(offset: number) {
  const len = ARTIFACT_IMAGES.length;
  const shifted = Array.from({ length: len }, (_, i) => ARTIFACT_IMAGES[(i + offset) % len]);
  return [...shifted, ...shifted];
}

export const HeroBackground: React.FC = () => {
  const col1 = getColumnImages(0);
  const col2 = getColumnImages(2);
  const col3 = getColumnImages(5);
  const col4 = getColumnImages(7);
  const col5 = getColumnImages(3);

  return (
    <>
      <style>
        {`
          @keyframes scrollDown {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }
          @keyframes scrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
        `}
      </style>
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0A0A0A] pointer-events-none p-4">
        <div className="flex w-full h-full gap-4">
          <div className="flex-1 overflow-hidden relative opacity-70">
            <div className="flex flex-col gap-4 w-full" style={{ animation: 'scrollDown 70s linear infinite' }}>
              {col1.map((src, i) => (
                <div key={i} className="w-full aspect-[1/1.2] relative rounded-2xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover grayscale brightness-75 contrast-125" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative opacity-70">
            <div className="flex flex-col gap-4 w-full" style={{ animation: 'scrollUp 80s linear infinite' }}>
              {col2.map((src, i) => (
                <div key={i} className="w-full aspect-[1/1.2] relative rounded-2xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover grayscale brightness-75 contrast-125" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative opacity-70">
            <div className="flex flex-col gap-4 w-full" style={{ animation: 'scrollDown 60s linear infinite' }}>
              {col3.map((src, i) => (
                <div key={i} className="w-full aspect-[1/1.2] relative rounded-2xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover grayscale brightness-75 contrast-125" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative opacity-70">
            <div className="flex flex-col gap-4 w-full" style={{ animation: 'scrollUp 90s linear infinite' }}>
              {col4.map((src, i) => (
                <div key={i} className="w-full aspect-[1/1.2] relative rounded-2xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover grayscale brightness-75 contrast-125" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative opacity-70">
            <div className="flex flex-col gap-4 w-full" style={{ animation: 'scrollDown 76s linear infinite' }}>
              {col5.map((src, i) => (
                <div key={i} className="w-full aspect-[1/1.2] relative rounded-2xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover grayscale brightness-75 contrast-125" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.9) 80%, rgba(10,10,10,1) 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
      </div>
    </>
  );
};
