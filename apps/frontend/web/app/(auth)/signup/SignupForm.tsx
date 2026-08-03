'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Label } from '@/components/ui/label';
import { register } from '@/service/api/auth';
import { showToast } from '@/utils/toast';

const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: '请输入昵称' })
      .max(50, { message: '昵称不能超过50个字符' }),
    email: z.email({ message: '请输入有效的邮箱地址' }),
    password: z.string().min(8, { message: '密码长度不能小于8位' }),
    confirmPassword: z.string().min(8, { message: '请再次输入密码' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export type SignupVisualState = {
  isTyping: boolean;
  showPassword: boolean;
  passwordLength: number;
};

type SignupFormProps = {
  onVisualStateChange?: (state: SignupVisualState) => void;
};

export default function SignupForm({ onVisualStateChange }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedPasswordField, setFocusedPasswordField] = useState<
    'password' | 'confirmPassword' | null
  >(null);

  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const passwordRegister = form.register('password');
  const confirmPasswordRegister = form.register('confirmPassword');
  const password =
    useWatch({
      control: form.control,
      name: 'password',
    }) ?? '';
  const confirmPassword =
    useWatch({
      control: form.control,
      name: 'confirmPassword',
    }) ?? '';

  useEffect(() => {
    const activePassword =
      focusedPasswordField === 'confirmPassword' ? confirmPassword : password;

    onVisualStateChange?.({
      isTyping: focusedPasswordField !== null && activePassword.length > 0,
      showPassword:
        focusedPasswordField === 'confirmPassword'
          ? showConfirmPassword
          : showPassword,
      passwordLength: activePassword.length,
    });
  }, [
    confirmPassword,
    focusedPasswordField,
    onVisualStateChange,
    password,
    showConfirmPassword,
    showPassword,
  ]);

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    register({
      email: values.email,
      name: values.name,
      password: values.password,
    })
      .then(() => {
        showToast.success('注册成功', {
          description: '现在可以使用邮箱和密码登录了',
        });
        router.push('/login');
      })
      .catch(() => {
        showToast.error('注册失败', {
          description: '请检查注册信息后重试',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-12 flex items-center justify-center gap-2 text-lg font-semibold lg:hidden">
        <Image
          src="/logo.png"
          alt="墨同文档 logo"
          width={32}
          height={32}
          className="dark:rounded-md dark:bg-white dark:p-1"
        />
        <span>墨同文档</span>
      </div>
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">创建账号</h1>
        <p className="text-sm text-muted-foreground">开始同步你的文档记忆</p>
      </div>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            昵称
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="off"
            placeholder="请输入你的昵称"
            {...form.register('name')}
            className="h-12 border-border/60 bg-background focus:border-primary"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium">
            邮箱
          </Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="off"
            placeholder="请输入你的邮箱"
            {...form.register('email')}
            className="h-12 border-border/60 bg-background focus:border-primary"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-sm font-medium">
            密码
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入你的密码"
              {...passwordRegister}
              onBlur={(event) => {
                passwordRegister.onBlur(event);
                setFocusedPasswordField(null);
              }}
              onFocus={() => setFocusedPasswordField('password')}
              className="h-12 border-border/60 bg-background pr-11 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
        <div className="space-y-2">
          <Label
            htmlFor="signup-confirm-password"
            className="text-sm font-medium"
          >
            确认密码
          </Label>
          <div className="relative">
            <Input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="请再次输入密码"
              {...confirmPasswordRegister}
              onBlur={(event) => {
                confirmPasswordRegister.onBlur(event);
                setFocusedPasswordField(null);
              }}
              onFocus={() => setFocusedPasswordField('confirmPassword')}
              className="h-12 border-border/60 bg-background pr-11 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showConfirmPassword ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
        <InteractiveHoverButton
          type="submit"
          text={isLoading ? '注册中...' : '创建账号'}
          className="h-12 w-full text-base font-medium"
          disabled={isLoading}
        />
      </form>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        已有账号？
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          去登录
        </Link>
      </div>
    </div>
  );
}
