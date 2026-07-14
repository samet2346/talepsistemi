import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Yetkisiz() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-4xl">!</div>
        <h1 className="text-2xl font-bold text-white mb-4">Erişim Engellendi</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz. Lütfen doğru hesap türüyle giriş yaptığınızdan emin olun.
        </p>
        <Link href="/">
          <Button variant="outline" className="w-full">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  );
}