const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  token?: string;
  gymId?: string;
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.gymId ? { "x-gym-id": options.gymId } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    next: { revalidate: 15 },
  });

  if (!response.ok) {
    let details = "";
    try {
      const payload = (await response.json()) as
        | { message?: string | string[]; error?: string }
        | undefined;
      if (Array.isArray(payload?.message)) {
        details = payload.message.join(", ");
      } else if (typeof payload?.message === "string") {
        details = payload.message;
      } else if (typeof payload?.error === "string") {
        details = payload.error;
      }
    } catch {
      details = "";
    }
    throw new ApiError(
      details ? `API request failed for ${path}: ${details}` : `API request failed for ${path}`,
      response.status,
      details || undefined,
    );
  }

  return response.json() as Promise<T>;
}
