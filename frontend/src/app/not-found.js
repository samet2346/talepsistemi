import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Sayfa Bulunamadı</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>
        <Link href="/">
          <Button variant="primary" className="mx-auto min-w-50">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  );
}