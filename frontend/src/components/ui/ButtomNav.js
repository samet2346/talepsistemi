"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav({ role }) {
  const pathname = usePathname();

  const menuItems = role === 'usta' ? [
    { label: 'İşler', href: '/usta/talepler', icon: '🔍' },
    { label: 'Teklifler', href: '/usta/tekliflerim', icon: '💰' },
    { label: 'Profil', href: '/usta/profil', icon: '👤' }
  ] : [
    { label: 'Keşfet', href: '/', icon: '🏠' },
    { label: 'Taleplerim', href: '/taleplerim', icon: '📋' },
    { label: 'Profil', href: '/profil', icon: '👤' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 px-6 py-3 flex justify-between items-center z-50">
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
          <span className="text-xl">{item.icon}</span>
          <span className={`text-[10px] font-bold uppercase ${pathname === item.href ? 'text-blue-500' : 'text-slate-500'}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}