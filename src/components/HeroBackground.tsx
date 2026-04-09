'use client';

import React from 'react';

/** Foto produk (kuliner, fashion, skincare, elektronik) — format query sama seperti template awal */
const ARTIFACT_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1583292650601-6366587e5aa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1526738549149-8e07ada60c0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
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

        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.9) 80%, rgba(10,10,10,1) 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
      </div>
    </>
  );
};
