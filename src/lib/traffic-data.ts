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
    case "off": return "Apagado"
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