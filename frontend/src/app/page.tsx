'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';

export default function Home() {
  const router = useRouter();

  return (
    <LandingPage
      onNavigate={(path) => {
        router.push(path);
      }}
    />
  );
}
