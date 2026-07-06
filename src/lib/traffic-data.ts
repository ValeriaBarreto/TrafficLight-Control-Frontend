export type TrafficLightColor = "red" | "yellow" | "green"
export type TrafficLightStatus = "online" | "connecting" | "offline"
export type SystemMode = "off" | "normal" | "rush_hour"
export type CongestionLevel = "low" | "medium" | "high"
export type UserRole = "admin" | "operator" | "guest"

export interface TrafficLight {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  status: TrafficLightStatus
  currentColor: TrafficLightColor
  cycleTimeGreen: number
  cycleTimeYellow: number
  cycleTimeRed: number
  congestionLevel: number // 0-100
  lastSync: string
  lastUpdate: string
  mode: SystemMode
}

export interface CongestionReading {
  timestamp: string
  level: number // 0-100
  label: CongestionLevel
}

export interface TransactionLog {
  id: string
  timestamp: string
  trafficLightId: string
  action: string
  details: string
  user: string
}

export interface Strategy {
  id: string
  name: string
  description: string
  active: boolean
  mode: SystemMode
  justification: string
  parameters: Record<string, string | number>
}

export interface ScheduleEntry {
  id: string
  mode: SystemMode
  startTime: string
  endTime: string
  days: string[]
}

export function getCongestionLabel(level: number): CongestionLevel {
  if (level < 40) return "low"
  if (level < 70) return "medium"
  return "high"
}

export function getCongestionColor(level: number): string {
  if (level < 40) return "#22c55e"
  if (level < 70) return "#eab308"
  return "#ef4444"
}

export function getStatusColor(status: TrafficLightStatus): string {
  switch (status) {
    case "online": return "#22c55e"
    case "connecting": return "#eab308"
    case "offline": return "#ef4444"
  }
}

export function getModeLabel(mode: SystemMode): string {
  switch (mode) {
    case "off": return "Normal"
    case "normal": return "Hora Valle"
    case "rush_hour": return "Hora Pico"
  }
}

export function getModeColor(mode: SystemMode): string {
  switch (mode) {
    case "off": return "#ef4444"
    case "normal": return "#22c55e"
    case "rush_hour": return "#eab308"
  }
}

// Generate mock traffic lights
export function generateTrafficLights(): TrafficLight[] {
  const lights: TrafficLight[] = [
    {
      id: "SEM-001",
      name: "Semaforo Cra 27 / Cll 45",
      location: "Carrera 27 con Calle 45",
      latitude: 7.1195,
      longitude: -73.1228,
      status: "online",
      currentColor: "green",
      cycleTimeGreen: 45,
      cycleTimeYellow: 5,
      cycleTimeRed: 40,
      congestionLevel: 35,
      lastSync: "2026-02-27T14:30:00",
      lastUpdate: "2026-02-27T14:30:05",
      mode: "normal",
    },
    {
      id: "SEM-002",
      name: "Semaforo Cra 27 / Cll 48",
      location: "Carrera 27 con Calle 48",
      latitude: 7.1210,
      longitude: -73.1232,
      status: "online",
      currentColor: "red",
      cycleTimeGreen: 40,
      cycleTimeYellow: 5,
      cycleTimeRed: 45,
      congestionLevel: 62,
      lastSync: "2026-02-27T14:29:55",
      lastUpdate: "2026-02-27T14:30:02",
      mode: "normal",
    },
    {
      id: "SEM-003",
      name: "Semaforo Cra 27 / Cll 51",
      location: "Carrera 27 con Calle 51",
      latitude: 7.1228,
      longitude: -73.1236,
      status: "online",
      currentColor: "yellow",
      cycleTimeGreen: 50,
      cycleTimeYellow: 5,
      cycleTimeRed: 35,
      congestionLevel: 78,
      lastSync: "2026-02-27T14:30:01",
      lastUpdate: "2026-02-27T14:30:04",
      mode: "rush_hour",
    },
    {
      id: "SEM-004",
      name: "Semaforo Cra 27 / Cll 54",
      location: "Carrera 27 con Calle 54",
      latitude: 7.1245,
      longitude: -73.1240,
      status: "connecting",
      currentColor: "green",
      cycleTimeGreen: 42,
      cycleTimeYellow: 5,
      cycleTimeRed: 43,
      congestionLevel: 45,
      lastSync: "2026-02-27T14:28:30",
      lastUpdate: "2026-02-27T14:29:00",
      mode: "normal",
    },
    {
      id: "SEM-005",
      name: "Semaforo Cra 27 / Cll 56",
      location: "Carrera 27 con Calle 56",
      latitude: 7.1260,
      longitude: -73.1243,
      status: "online",
      currentColor: "red",
      cycleTimeGreen: 38,
      cycleTimeYellow: 5,
      cycleTimeRed: 47,
      congestionLevel: 85,
      lastSync: "2026-02-27T14:30:02",
      lastUpdate: "2026-02-27T14:30:06",
      mode: "rush_hour",
    },
    {
      id: "SEM-006",
      name: "Semaforo Cra 27 / Cll 33",
      location: "Carrera 27 con Calle 33",
      latitude: 7.1160,
      longitude: -73.1218,
      status: "offline",
      currentColor: "red",
      cycleTimeGreen: 40,
      cycleTimeYellow: 5,
      cycleTimeRed: 40,
      congestionLevel: 0,
      lastSync: "2026-02-27T12:15:00",
      lastUpdate: "2026-02-27T12:15:00",
      mode: "off",
    },
    {
      id: "SEM-007",
      name: "Semaforo Cra 27 / Cll 33",
      location: "Carrera 27 con Calle 33",
      latitude: 7.1160,
      longitude: -73.1218,
      status: "offline",
      currentColor: "red",
      cycleTimeGreen: 40,
      cycleTimeYellow: 5,
      cycleTimeRed: 40,
      congestionLevel: 0,
      lastSync: "2026-02-27T12:15:00",
      lastUpdate: "2026-02-27T12:15:00",
      mode: "off",
    },
  ]
  return lights
}

// Generate congestion history for charts
export function generateCongestionHistory(hours: number = 24): CongestionReading[] {
  const readings: CongestionReading[] = []
  const now = new Date()
  for (let i = hours * 4; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000)
    const hour = timestamp.getHours()
    // Simulate rush hour patterns
    let baseLevel = 30
    if (hour >= 7 && hour <= 9) baseLevel = 70
    if (hour >= 12 && hour <= 13) baseLevel = 55
    if (hour >= 17 && hour <= 19) baseLevel = 80
    if (hour >= 22 || hour <= 5) baseLevel = 15
    const level = Math.min(100, Math.max(0, baseLevel + Math.floor(Math.random() * 20) - 10))
    readings.push({
      timestamp: timestamp.toISOString(),
      level,
      label: getCongestionLabel(level),
    })
  }
  return readings
}

// Generate transaction logs
export function generateTransactionLogs(): TransactionLog[] {
  return [
    { id: "TX-001", timestamp: "2026-02-27T14:30:05", trafficLightId: "SEM-001", action: "Cambio de ciclo", details: "Verde: 45s -> 50s (ajuste por congestion)", user: "Sistema" },
    { id: "TX-002", timestamp: "2026-02-27T14:29:30", trafficLightId: "SEM-003", action: "Modo cambiado", details: "Normal -> Hora Pico", user: "admin@sistema.com" },
    { id: "TX-003", timestamp: "2026-02-27T14:28:00", trafficLightId: "SEM-005", action: "Estrategia activada", details: "Extension de verde en Cra 27", user: "Sistema" },
    { id: "TX-004", timestamp: "2026-02-27T14:25:00", trafficLightId: "SEM-006", action: "Desconexion", details: "Semaforo fuera de linea", user: "Sistema" },
    { id: "TX-005", timestamp: "2026-02-27T14:20:00", trafficLightId: "SEM-002", action: "Sincronizacion", details: "Ola verde activada Cra 27", user: "Sistema" },
    { id: "TX-006", timestamp: "2026-02-27T14:15:00", trafficLightId: "SEM-004", action: "Reconexion", details: "Semaforo reconectando", user: "Sistema" },
    { id: "TX-007", timestamp: "2026-02-27T13:50:00", trafficLightId: "SEM-001", action: "Medicion", details: "Congestion: 35% (Google Maps API)", user: "Sistema" },
    { id: "TX-008", timestamp: "2026-02-27T13:35:00", trafficLightId: "SEM-003", action: "Cambio de ciclo", details: "Rojo: 40s -> 35s (prioridad Cra 27)", user: "Sistema" },
  ]
}

// Generate strategies
export function generateStrategies(): Strategy[] {
  return [
    {
      id: "STR-001",
      name: "Extension de Verde",
      description: "Extiende el tiempo de verde en la direccion principal cuando la congestion supera el 60%",
      active: true,
      mode: "rush_hour",
      justification: "Congestion detectada: 78% en Cra 27 / Cll 51",
      parameters: { extensionMax: 15, umbralActivacion: 60, direccion: "Norte-Sur" },
    },
    {
      id: "STR-002",
      name: "Ola Verde",
      description: "Sincroniza semaforos consecutivos para crear un corredor verde continuo",
      active: true,
      mode: "rush_hour",
      justification: "Flujo vehicular alto en corredor Cra 27",
      parameters: { velocidadObjetivo: 40, desfase: 8, semaforos: 5 },
    },
    {
      id: "STR-003",
      name: "Balance Dinamico",
      description: "Ajusta los tiempos de ciclo para equilibrar la congestion en todas las direcciones",
      active: false,
      mode: "normal",
      justification: "Congestion moderada, balance automatico",
      parameters: { factorBalanceo: 0.8, intervaloAjuste: 5 },
    },
    {
      id: "STR-004",
      name: "Priorizacion por Direccion",
      description: "Prioriza una direccion especifica basada en la demanda vehicular",
      active: true,
      mode: "rush_hour",
      justification: "Demanda 3x mayor en sentido Sur-Norte",
      parameters: { direccionPrioritaria: "Sur-Norte", factorPrioridad: 1.5, duracionMax: 30 },
    },
  ]
}

// Generate schedule entries
export function generateSchedule(): ScheduleEntry[] {
  return [
    { id: "SCH-001", mode: "rush_hour", startTime: "07:00", endTime: "09:00", days: ["Lun", "Mar", "Mie", "Jue", "Vie"] },
    { id: "SCH-002", mode: "normal", startTime: "09:00", endTime: "12:00", days: ["Lun", "Mar", "Mie", "Jue", "Vie"] },
    { id: "SCH-003", mode: "rush_hour", startTime: "12:00", endTime: "13:30", days: ["Lun", "Mar", "Mie", "Jue", "Vie"] },
    { id: "SCH-004", mode: "normal", startTime: "13:30", endTime: "17:00", days: ["Lun", "Mar", "Mie", "Jue", "Vie"] },
    { id: "SCH-005", mode: "rush_hour", startTime: "17:00", endTime: "19:30", days: ["Lun", "Mar", "Mie", "Jue", "Vie"] },
    { id: "SCH-006", mode: "normal", startTime: "19:30", endTime: "22:00", days: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"] },
    { id: "SCH-007", mode: "off", startTime: "22:00", endTime: "06:00", days: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"] },
  ]
}