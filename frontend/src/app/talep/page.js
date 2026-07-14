import { Suspense } from "react";
import TalepOlustur from "./talep-content";

export default function TalepPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <TalepOlustur />
    </Suspense>
  );
}