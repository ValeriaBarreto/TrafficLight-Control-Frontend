const BASE_URL = "http://localhost:8080"

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