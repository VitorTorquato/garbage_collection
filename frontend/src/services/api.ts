const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: extraHeaders, ...rest } = options
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders as Record<string, string>),
    },
  })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message ?? `Request failed with status ${res.status}`
    throw new Error(Array.isArray(message) ? message.join(', ') : message)
  }

  return data as T
}

function auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number
  name: string
  email: string
}

export interface UserAddress {
  id: number
  street: string
  neighborhood: string | null
  city: string
  state: string
  country: string
  lat: number
  lng: number
}

export interface UpsertAddressDto {
  street?: string
  neighborhood?: string
  city: string
}

export interface CollectionSchedule {
  id: number
  trashType: 'organic' | 'mixed' | 'recyclable' | 'glass'
}

export interface CreateScheduleDto {
  trashType: string
}

export interface NotificationPreference {
  id: number
  enabled: boolean
  notificationTime: string
  notifyDayBefore: boolean
  phoneNumber: string | null
}

export interface UpsertNotificationPrefsDto {
  enabled: boolean
  notificationTime: string
  notifyDayBefore: boolean
  phoneNumber?: string
}

// ── API ──────────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  signIn(email: string, password: string) {
    return request<{ accessToken: string }>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  signUp(name: string, email: string, password: string, phoneNumber?: string) {
    return request<{ id: number }>('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, ...(phoneNumber ? { phoneNumber } : {}) }),
    })
  },

  // Users
  getUser(id: number, token: string) {
    return request<UserProfile>(`/users/${id}`, { headers: auth(token) })
  },

  // Address
  getAddress(token: string) {
    return request<UserAddress>('/address', { headers: auth(token) })
  },

  upsertAddress(dto: UpsertAddressDto, token: string) {
    return request<UserAddress>('/address', {
      method: 'PATCH',
      headers: auth(token),
      body: JSON.stringify(dto),
    })
  },

  // Collection schedules
  getSchedules(token: string) {
    return request<CollectionSchedule[]>('/collection-schedules', {
      headers: auth(token),
    })
  },

  createSchedule(dto: CreateScheduleDto, token: string) {
    return request<CollectionSchedule>('/collection-schedules', {
      method: 'POST',
      headers: auth(token),
      body: JSON.stringify(dto),
    })
  },

  deleteSchedule(id: number, token: string) {
    return request<void>(`/collection-schedules/${id}`, {
      method: 'DELETE',
      headers: auth(token),
    })
  },

  getDashboard(token: string, days = 30) {
    return request<{ from: string; to: string; days: { date: string; trashTypes: string[] }[] }>(
      `/collection-schedules/dashboard?days=${days}`,
      { headers: auth(token) },
    )
  },

  // Notification preferences
  getNotificationPrefs(token: string) {
    return request<NotificationPreference>('/notifications/preferences', {
      headers: auth(token),
    })
  },

  upsertNotificationPrefs(dto: UpsertNotificationPrefsDto, token: string) {
    return request<NotificationPreference>('/notifications/preferences', {
      method: 'PUT',
      headers: auth(token),
      body: JSON.stringify(dto),
    })
  },
}
