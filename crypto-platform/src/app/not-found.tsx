// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="font-display text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold px-6 py-3 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all">
          Go Home
        </Link>
      </div>
    </div>
  );
}
