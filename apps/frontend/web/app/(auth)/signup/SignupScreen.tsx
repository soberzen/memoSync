'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { AnimatedCharacters } from '@/components/ui/animated-characters';

import SignupForm, { type SignupVisualState } from './SignupForm';

const INITIAL_VISUAL_STATE: SignupVisualState = {
  isTyping: false,
  showPassword: false,
  passwordLength: 0,
};

export default function SignupScreen() {
  const [visualState, setVisualState] = useState(INITIAL_VISUAL_STATE);

  return (
    <div className="grid min-h-screen max-h-screen overflow-hidden lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 p-12 text-white dark:from-white/90 dark:via-white/80 dark:to-white/70 dark:text-gray-900 lg:flex">
        <div className="relative z-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Image
              src="/logo.png"
              alt="墨同文档 logo"
              width={32}
              height={32}
              className="rounded-lg bg-white/10 p-1 backdrop-blur-sm"
            />
            <span>墨同文档</span>
          </Link>
        </div>
        <div className="relative z-20 flex h-[500px] items-end justify-center">
          <AnimatedCharacters
            isTyping={visualState.isTyping}
            showPassword={visualState.showPassword}
            passwordLength={visualState.passwordLength}
          />
        </div>
      </div>
      <div className="flex items-center justify-center bg-background p-8">
        <SignupForm onVisualStateChange={setVisualState} />
      </div>
    </div>
  );
}
