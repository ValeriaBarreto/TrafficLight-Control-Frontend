
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error("Credenciales incorrectas")
  return res.json() as Promise<{ name: string; email: string; role: string }>
}

export async function getOperationModes() {
  const res = await fetch(`${BASE_URL}/config/operation/get`)
  if (!res.ok) throw new Error("Error al obtener modos")
  return res.json()
}

export function createSseConnection(
  onColorTraffic: (data: { color: string; codeIntersection: string }) => void,
  onCongestion: (data: { codeIntersection: string; congestionLevel: number }) => void,
  onMode: (data: { currentMode: string }) => void,
  onStatus: (data: { status: string; codeIntersection: string }) => void,
  onRouteCongestion: (data: { congestionLevel: number; routeId: number }) => void,
) {
  const es = new EventSource(`${BASE_URL}/stream/transactions`)

  es.addEventListener("color-traffic", (e) => {
    onColorTraffic(JSON.parse(e.data))
  })

  es.addEventListener("intersection-congestion", (e) => {
    onCongestion(JSON.parse(e.data))
  })

  es.addEventListener("current-mode", (e) => {
    onMode(JSON.parse(e.data))
  })

  es.addEventListener("status-intersection", (e) => {
    onStatus(JSON.parse(e.data))
  })

  es.addEventListener("route-congestion", (e) => {
    onRouteCongestion(JSON.parse(e.data))
  })

  es.onerror = () => {
    console.error("SSE connection error")
    es.close()
  }

  return es
}
export async function getIntersections() {
  const res = await fetch(`${BASE_URL}/intersections`)
  if (!res.ok) throw new Error("Error al obtener intersecciones")
  return res.json() as Promise<{
    code: string
    location: string
    latitude: number
    longitude: number
  }[]>
}

export async function createMode(mode: string) {
  const modeMap: Record<string, string> = {
    off: "OFF",
    normal: "NORMAL",
    rush_hour: "PEAK",
  }
  const res = await fetch(`${BASE_URL}/config/create/mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: modeMap[mode], description: "" }),
  })
  if (!res.ok) throw new Error("Error al crear modo")
}

export async function getSchedules() {
  const res = await fetch(`${BASE_URL}/config/schedule/get`)
  if (!res.ok) throw new Error("Error al obtener horarios")
  return res.json()
}

export async function createSchedule(entry: {
  mode: string
  startTime: string
  endTime: string
  days: string[]
}) {
  const dayMap: Record<string, string> = {
    Lun: "MONDAY",
    Mar: "TUESDAY",
    Mie: "WEDNESDAY",
    Jue: "THURSDAY",
    Vie: "FRIDAY",
    Sab: "SATURDAY",
    Dom: "SUNDAY",
  }
  const modeIdMap: Record<string, number> = {
    off: 1,
    normal: 2,
    rush_hour: 3,
  }
  const res = await fetch(`${BASE_URL}/config/create/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dayOfWeeks: entry.days.map(d => dayMap[d]),
      startTime: entry.startTime,
      endTime: entry.endTime,
      modeId: modeIdMap[entry.mode],
    }),
  })
  if (!res.ok) throw new Error("Error al crear horario")
  return res.json()
}

export async function deleteSchedule(id: string) {
  const res = await fetch(`${BASE_URL}/config/schedule/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Error al eliminar horario")
}

export async function getMeasurements() {
  const res = await fetch(`${BASE_URL}/measurements`)
  if (!res.ok) throw new Error("Error al obtener mediciones")
  return res.json() as Promise<{
    id: number
    intersectionCode: string
    duration: number
    durationInTraffic: number
    congestionLevel: number
    createdAt: string
    codeResponse: string
  }[]>
}
export async function getUsers() {
  const res = await fetch(`${BASE_URL}/auth/users`)
  if (!res.ok) throw new Error("Error al obtener usuarios")
  return res.json() as Promise<{
    id: number
    name: string
    lastName: string
    email: string
    phone: string
    role: string
  }[]>
}

export async function registerUser(data: {
  name: string
  lastName: string
  email: string
  password: string
  phone: string
  role: string
}) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al registrar usuario")
  return res.json()
}

export async function deleteUser(id: number) {
  const res = await fetch(`${BASE_URL}/auth/users/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Error al eliminar usuario")
}

export async function updateUserRole(id: number, role: string) {
  const res = await fetch(`${BASE_URL}/auth/users/${id}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(role),
  })
  if (!res.ok) throw new Error("Error al actualizar rol")
  return res.json()
}

export async function getRoutes() {
  const res = await fetch(`${BASE_URL}/config/routes`)
  if (!res.ok) throw new Error("Error al obtener rutas")
  return res.json() as Promise<{
    id: number
    name: string
    coordinate: { latitude: number; longitude: number }
  }[]>
}

export async function getIntersectionsByRoute(routeId: number) {
  const res = await fetch(`${BASE_URL}/config/routes/${routeId}/intersections`)
  if (!res.ok) throw new Error("Error al obtener intersecciones")
  return res.json() as Promise<{
    code: string
    location: string
    latitude: number
    longitude: number
  }[]>
}

export async function createRoute(data: {
  name: string
  coordinate: { latitude: number; longitude: number }
}) {
  const res = await fetch(`${BASE_URL}/config/create/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al crear ruta")
  return res.json()
}

export async function createIntersection(data: {
  location: string
  code: string
  position: number
  routeId: number
  coordinate: { latitude: number; longitude: number }
}) {
  const res = await fetch(`${BASE_URL}/config/create/intersection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([data]),
  })
  if (!res.ok) throw new Error("Error al crear interseccion")
  return res.json()
}
export async function deleteRoute(id: number) {
  const res = await fetch(`${BASE_URL}/config/routes/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Error al eliminar ruta")
}

export async function deleteIntersection(code: string) {
  const res = await fetch(`${BASE_URL}/config/intersections/${code}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Error al eliminar interseccion")
}

export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/transactions`)
  if (!res.ok) throw new Error("Error al obtener transacciones")
  return res.json() as Promise<{
    id: number
    createdAt: string
    returnDate: string | null
    codeIntersection: string
    description: string
  }[]>
}