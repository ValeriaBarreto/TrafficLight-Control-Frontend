import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { apiLogin, createSseConnection, getIntersections, getSchedules, createSchedule, deleteSchedule } from "@/lib/api"
import type { SystemMode, UserRole, ScheduleEntry, TrafficLight } from "@/lib/traffic-data"

interface Transaction {
  id: string
  timestamp: string
  trafficLightId: string
  action: string
  details: string
  user: string
}

interface TrafficContextType {
  trafficLights: TrafficLight[]
  systemMode: SystemMode
  currentCongestion: number
  userRole: UserRole
  userName: string
  isAuthenticated: boolean
  schedule: ScheduleEntry[]
  addScheduleEntry: (entry: Omit<ScheduleEntry, "id">) => void
  removeScheduleEntry: (id: string) => void
  transactions: Transaction[]
  selectedLight: TrafficLight | null
  setSelectedLight: (light: TrafficLight | null) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const TrafficContext = createContext<TrafficContextType | null>(null)

export function useTraffic() {
  const ctx = useContext(TrafficContext)
  if (!ctx) throw new Error("useTraffic must be used within TrafficProvider")
  return ctx
}

export function TrafficProvider({ children }: { children: React.ReactNode }) {
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([])
  const [systemMode, setSystemMode] = useState<SystemMode>("normal")
  const [currentCongestion, setCurrentCongestion] = useState(0)
  const [userRole, setUserRole] = useState<UserRole>("operator")
  const [userName, setUserName] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedLight, setSelectedLight] = useState<TrafficLight | null>(null)
  const sseRef = useRef<EventSource | null>(null)

  const upsertLight = useCallback((id: string, patch: Partial<TrafficLight>) => {
    setTrafficLights(prev => {
      const exists = prev.some(l => l.id === id)
      if (exists) {
        return prev.map(l => l.id === id ? { ...l, ...patch } : l)
      }
      // Crea el semaforo si no existe aun
      // TODO: reemplazar latitude/longitude por los valores reales
      // una vez identifiquemos en que evento SSE los envia el backend
      const newLight: TrafficLight = {
        id,
        name: id,
        location: id,
        latitude: 0,
        longitude: 0,
        status: "connecting",
        currentColor: "red",
        congestionLevel: 0,
        mode: "normal",
        cycleTimeGreen: 30,
        cycleTimeYellow: 5,
        cycleTimeRed: 30,
        lastSync: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        ...patch,
      }
      return [...prev, newLight]
    })
  }, [])

  const connectSse = useCallback(() => {
    if (sseRef.current) sseRef.current.close()

    sseRef.current = createSseConnection(
      // color-traffic
      ({ color, codeIntersection }) => {
        upsertLight(codeIntersection, {
          currentColor: color as "red" | "yellow" | "green",
          lastUpdate: new Date().toISOString(),
        })
        setTransactions(prev => [...prev.slice(-100), {
          id: `TX-${Date.now()}`,
          timestamp: new Date().toISOString(),
          trafficLightId: codeIntersection,
          action: "Cambio de color",
          details: `Color: ${color}`,
          user: userName,
        }])
      },
      // intersection-congestion
      ({ codeIntersection, congestionLevel }) => {
        upsertLight(codeIntersection, { congestionLevel })
      },
      // current-mode
      ({ currentMode }) => {
        setSystemMode(currentMode as SystemMode)
      },
      // status-intersection
      ({ status, codeIntersection }) => {
        upsertLight(codeIntersection, {
          status: status as "online" | "offline",
          lastSync: new Date().toISOString(),
        })
        setTransactions(prev => [...prev.slice(-100), {
          id: `TX-${Date.now()}`,
          timestamp: new Date().toISOString(),
          trafficLightId: codeIntersection,
          action: "Cambio de estado",
          details: `Estado: ${status}`,
          user: userName,
        }])
      },
      // route-congestion
      ({ congestionLevel }) => {
        setCurrentCongestion(Math.round(congestionLevel))
      },
    )
  }, [userName, upsertLight])

  useEffect(() => {
    return () => {
      if (sseRef.current) sseRef.current.close()
    }
  }, [])

  const dayMap: Record<string, string> = {
  MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mie",
  THURSDAY: "Jue", FRIDAY: "Vie", SATURDAY: "Sab", SUNDAY: "Dom",
}
const modeMap: Record<string, SystemMode> = {
  OFF: "off", NORMAL: "normal", PEAK: "rush_hour",
}

const loadSchedules = useCallback(async () => {
  try {
    const data = await getSchedules()
    setSchedule(data.map((s: any) => ({
      id: String(s.id),
      mode: modeMap[s.nameMode] ?? "normal",
      startTime: s.starTime?.slice(0, 5) ?? "00:00",
      endTime: s.endTime?.slice(0, 5) ?? "00:00",
      days: s.dayOfWeeks.map((d: string) => dayMap[d] ?? d),
    })))
  } catch (e) {
    console.error("Error al cargar horarios:", e)
  }
}, [])

const login = useCallback(async (username: string, password: string): Promise<boolean> => {
  try {
    const data = await apiLogin(username, password)
    setIsAuthenticated(true)
    setUserName(data.name)
    setUserRole(data.role.toLowerCase() as UserRole)

    // Carga intersecciones reales desde el backend
    const intersections = await getIntersections()
    setTrafficLights(intersections.map(i => ({
      id: i.code,
      name: i.location,
      location: i.location,
      latitude: i.latitude,
      longitude: i.longitude,
      status: "connecting" as const,
      currentColor: "red" as const,
      congestionLevel: 0,
      mode: "normal" as SystemMode,
      cycleTimeGreen: 30,
      cycleTimeYellow: 5,
      cycleTimeRed: 30,
      lastSync: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    })))

    await loadSchedules()
    connectSse()
    return true
  } catch {
    return false
  }
}, [connectSse])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUserName("")
    setTrafficLights([])
    setCurrentCongestion(0)
    setSchedule([])
    setTransactions([])
    setSelectedLight(null)
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }
  }, [])

const addScheduleEntry = useCallback(async (entry: Omit<ScheduleEntry, "id">) => {
  try {
    await createSchedule(entry)
    await loadSchedules()
  } catch (e) {
    console.error("Error al crear horario:", e)
  }
}, [])

  const removeScheduleEntry = useCallback(async (id: string) => {
  try {
    await deleteSchedule(id)
    setSchedule(prev => prev.filter(entry => entry.id !== id))
  } catch (e) {
    console.error("Error al eliminar horario:", e)
  }
}, [])

  return (
    <TrafficContext.Provider value={{
      trafficLights,
      systemMode,
      currentCongestion,
      userRole,
      userName,
      isAuthenticated,
      schedule,
      addScheduleEntry,
      removeScheduleEntry,
      transactions,
      selectedLight,
      setSelectedLight,
      login,
      logout,
    }}>
      {children}
    </TrafficContext.Provider>
  )
}