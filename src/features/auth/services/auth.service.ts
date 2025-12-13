import { apiClient } from '@/shared/lib/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      data
    );
    return response.data;
  },
};