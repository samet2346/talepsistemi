"use client";
import { useRouter } from 'next/navigation';

export default function BackButton({ className = "" }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className={`flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group ${className}`}
    >
      <span className="group-hover:-translate-x-1 transition-transform">←</span>
      <span className="text-sm font-bold uppercase tracking-widest">Geri Dön</span>
    </button>
  );
}