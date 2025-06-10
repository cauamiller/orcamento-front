export interface Cliente {
  id: string
  name: string
  email: string
  phone?: string
}

import { apiRequest } from "@/lib/api"

export function getClients(): Promise<Cliente[] | void> {
  return apiRequest('clients')
}


export function createClient(name: string, email: string, phone: string) {
  return apiRequest('clients', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone }),
  });
}

export async function deleteClient(id: string) {
  return apiRequest(`clients/${id}`, { method: 'DELETE' })
}

export async function getClientById(id: string): Promise<Cliente | void> {
  return apiRequest(`clients/${id}`)
}

export async function updateClient(id: string, data: {
  name: string
  email: string
  phone?: string
}) {
  return apiRequest(`clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
