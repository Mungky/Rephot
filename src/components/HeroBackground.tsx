'use client';

import React from 'react';

/** Output asli dari Rephot (Cloudinary) — di-scroll di kolom hero */
const ARTIFACT_IMAGES = [
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713939/rephot-4d688673_fap58m.png',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713900/rephot-1775713871921_awdyji.png',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713716/rephot-a0b660cc_by1vkp.png',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713477/c5ae00df-80d0-4902-a6d8-63309508d900_itllof.jpg',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713471/rephot-11f71a02_qwteqo.png',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713431/cc00191e-d101-441e-b35a-fcd43e2821d4_fpahoj.jpg',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713431/rephot-9d877a2d_jsmtl0.png',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713431/c1065f79-ee19-4bc4-b444-05a7055c3912_v3avkp.jpg',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775713431/rephot-bc02ee52_yifrss.png',
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775708063/19ac6dd3-50aa-4809-b417-79637ec1edf6_pbn6sb.jpg',
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
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0A0A0A] pointer-events-none px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
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
