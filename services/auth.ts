import { apiRequest } from '@/lib/api';

export function login(email: string, password: string) {
  return apiRequest<{ token: string; user: any }>('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false); // false porque ainda não tem token
}