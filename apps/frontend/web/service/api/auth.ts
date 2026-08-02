import { get, post } from '../base';
import type { AccessTokenResponse, HTTPResponse } from '../fetch';

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
};

export type User = {
  name: string;
  email: string;
  avatarUrl?: string;
};

export function login(data: LoginDto) {
  return post<AccessTokenResponse>('/auth/login', {
    body: data,
    credentials: 'include',
  });
}

export function register(data: RegisterDto) {
  return post<HTTPResponse<User>>('/auth/register', { body: data });
}

export function refresh() {
  return post<AccessTokenResponse>('/auth/refresh', {
    credentials: 'include',
  });
}

export function logout() {
  return post<HTTPResponse<null>>('/auth/logout', {
    credentials: 'include',
  });
}

export function getProfile() {
  return get<HTTPResponse<User>>('/auth/profile', {
    credentials: 'include',
  });
}
