import { post } from '../base';
import type { AccessTokenResponse, HTTPResponse } from '../fetch';

type LoginDto = {
  email: string;
  password: string;
};

type RegisterDto = {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
};

type RegisterResponse = {
  name: string;
  email: string;
  avatarUrl?: string;
};

export function login(data: LoginDto) {
  return post<AccessTokenResponse>('/auth/login', { body: data });
}

export function register(data: RegisterDto) {
  return post<HTTPResponse<RegisterResponse>>('/auth/register', { body: data });
}
