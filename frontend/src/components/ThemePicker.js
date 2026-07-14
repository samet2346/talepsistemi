"use client";
import { useState, useEffect } from 'react';

const themeOptions = [
  { key: 'cloud', color: 'bg-blue-400' },
  { key: 'night', color: 'bg-black' },
  { key: 'safe', color: 'bg-emerald-500' }
];

export default function ThemePicker() {
  const [activeTheme, setActiveTheme] = useState('cloud');

  useEffect(() => {
    const saved = localStorage.getItem('app-theme') || 'cloud';
    setActiveTheme(saved);
  }, []);

  const handleThemeChange = (key) => {
    setActiveTheme(key);
    localStorage.setItem('app-theme', key);
    document.documentElement.setAttribute('data-theme', key);
  };

  return (
    <div className="absolute top-6 right-6 flex gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-black/5 z-50">
      {themeOptions.map((opt) => (
        <button
          key={opt.key}
          onClick={() => handleThemeChange(opt.key)}
          className={`w-8 h-8 rounded-xl border-2 transition-all ${activeTheme === opt.key ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'} ${opt.color}`}
        />
      ))}
    </div>
  );
}