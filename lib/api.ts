export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  secure = true
): Promise<T | void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' && localStorage.getItem('token');

  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (secure && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/${path}`, {
    ...options,
    headers,
  });

  // ✅ se for 204, não tenta parsear JSON
  if (res.status === 204) return;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Erro ao fazer requisição');
  }

  return data;
}
