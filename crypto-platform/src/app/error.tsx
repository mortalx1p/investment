// src/app/error.tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-8">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold px-6 py-3 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all"
          >
            Try Again
          </button>
          <Link href="/" className="border border-white/15 text-white px-6 py-3 rounded-xl hover:bg-white/5 transition-all">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
