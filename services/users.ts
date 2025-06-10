import { apiRequest } from '@/lib/api';

export function createUser(name: string, email: string, password: string) {
  return apiRequest('users', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}
