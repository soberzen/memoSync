'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Label } from '@/components/ui/label';
import { showToast } from '@/utils/toast';

import { login } from '@/service/api/auth';
import { setToken } from '@/utils/auth';

const loginSchema = z.object({
  email: z.email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(8, { message: '密码长度不能小于8位' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginVisualState = {
  isTyping: boolean;
  showPassword: boolean;
  passwordLength: number;
};

type LoginFormProps = {
  onVisualStateChange?: (state: LoginVisualState) => void;
};

export default function LoginForm({ onVisualStateChange }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const passwordRegister = form.register('password');

  const password = useWatch({
    control: form.control,
    name: 'password',
  });

  const toggleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleLoginWithWeChat = useCallback(() => {
    showToast.error('微信登录功能暂未实现', {
      description: '请使用邮箱和密码登录',
    });
  }, []);

  useEffect(() => {
    onVisualStateChange?.({
      isTyping: isPasswordFocused && password.length > 0,
      showPassword,
      passwordLength: password.length,
    });
  }, [isPasswordFocused, onVisualStateChange, password.length, showPassword]);

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    login(values)
      .then((res) => {
        const { accessToken } = res.data;
        setToken(accessToken);
      })
      .catch(() => {
        showToast.error('登录失败', {
          description: '请检查邮箱和密码是否正确',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <div className="w-full max-w-[420px]">
      <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
        <Image
          src="/logo.png"
          alt="墨同文档 logo"
          width={32}
          height={32}
          className="dark:bg-white dark:p-1 dark:rounded-md"
        />
        <span>墨同文档</span>
      </div>
      {/* header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">欢迎回来！</h1>
        <p className="text-muted-foreground text-sm">请输入登录信息</p>
      </div>
      {/* login form */}
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            邮箱
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            placeholder="请输入你的邮箱"
            {...form.register('email')}
            className="h-12 bg-background border-border/60 focus:border-primary"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            密码
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入你的密码"
              {...passwordRegister}
              onBlur={(event) => {
                passwordRegister.onBlur(event);
                setIsPasswordFocused(false);
              }}
              onFocus={() => setIsPasswordFocused(true)}
              className="h-12 bg-background border-border/60 focus:border-primary"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              30天内记住我
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline font-medium"
          >
            忘记密码？
          </Link>
        </div>
        <InteractiveHoverButton
          type="submit"
          text={isLoading ? '登陆中...' : '登陆'}
          className="w-full h-12 text-base font-medium"
          disabled={isLoading}
        />
      </form>
      <div className="mt-6">
        <InteractiveHoverButton
          type="button"
          text="使用微信登陆"
          onClick={handleLoginWithWeChat}
          className="w-full h-12 border-border/60"
          icon={
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="3025"
              className="h-5 w-5"
            >
              <path
                d="M670.023548 368.251062c10.259668 0 20.38119 0.787946 30.53648 1.902326-27.361161-127.435391-163.538657-222.082004-319.066873-222.082004-173.813674 0-316.202639 118.450762-316.202639 268.934079 0 86.831624 47.341215 158.128437 126.509299 213.512838l-31.583323 95.101985 110.560048-55.386448c39.524179 7.748475 71.228251 15.809057 110.716614 15.809057 9.930163 0 19.771299-0.451278 29.473265-1.187035-6.123464-21.147646-9.771551-43.274596-9.771551-66.340941C401.265478 480.380862 519.85234 368.251062 670.023548 368.251062L670.023548 368.251062zM500.047272 282.537911c23.887037 0 39.591717 15.70468 39.591717 39.470967 0 23.679305-15.705704 39.542598-39.591717 39.542598-23.627117 0-47.410799-15.863293-47.410799-39.542598C452.636472 298.17403 476.366943 282.537911 500.047272 282.537911L500.047272 282.537911zM278.751167 361.551476c-23.731494 0-47.619554-15.863293-47.619554-39.542598 0-23.76731 23.88806-39.470967 47.619554-39.470967s39.488363 15.636119 39.488363 39.470967C318.23953 345.688183 302.482661 361.551476 278.751167 361.551476L278.751167 361.551476zM278.751167 361.551476"
                fill="#ffffff"
                p-id="3026"
              ></path>
              <path
                d="M958.709483 614.70822c0-126.403898-126.543068-229.42832-268.652669-229.42832-150.485363 0-268.915659 103.09503-268.915659 229.42832 0 126.753869 118.498858 229.462089 268.915659 229.462089 31.514761 0 63.272046-7.886621 94.89016-15.809057l86.690408 47.567365-23.76731-79.048357C911.351895 749.174748 958.709483 686.041872 958.709483 614.70822L958.709483 614.70822zM602.842473 575.132876c-15.70468 0-31.618115-15.633049-31.618115-31.618115 0-15.739473 15.914458-31.583323 31.618115-31.583323 24.010857 0 39.576367 15.84385 39.576367 31.583323C642.41884 559.499827 626.853329 575.132876 602.842473 575.132876L602.842473 575.132876zM776.78099 575.132876c-15.565511 0-31.445176-15.633049-31.445176-31.618115 0-15.739473 15.809057-31.583323 31.445176-31.583323 23.801079 0 39.576367 15.84385 39.576367 31.583323C816.356334 559.499827 800.581046 575.132876 776.78099 575.132876L776.78099 575.132876zM776.78099 575.132876"
                fill="#ffffff"
                p-id="3027"
              ></path>
            </svg>
          }
        />
      </div>
      <div className="text-center text-sm text-muted-foreground mt-8">
        还没有账号？
        <Link
          href="/signup"
          className="text-foreground font-medium hover:underline"
        >
          立即注册
        </Link>
      </div>
    </div>
  );
}
