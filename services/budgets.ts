import { apiRequest } from '@/lib/api';
import { Cliente } from './clients';

export interface Budget {
  id: string;
  clientId: string;
  client: Cliente;
  createdAt: string;
  total: number;
  items: { description: string; quantity: number; price: number }[];
}

export function listBudgets(): Promise<Budget[] | void> {
  return apiRequest('budgets');
}

export function createBudget(
  clientId: string,
  items: { description: string; quantity: number; price: number }[]
) {
  return apiRequest('budgets', {
    method: 'POST',
    body: JSON.stringify({ clientId, items }),
  });
}

export async function deleteBudget(id: string) {
  return apiRequest(`budgets/${id}`, { method: 'DELETE' });
}

export async function getBudgetById(id: string): Promise<Budget | void> {
  return apiRequest(`budgets/${id}`);
}

export async function updateBudget(
  id: string,
  data: { clientId: string; items: { description: string; quantity: number; price: number }[] }
) {
  return apiRequest(`budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
