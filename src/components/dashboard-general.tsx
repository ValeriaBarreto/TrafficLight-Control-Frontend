import { Activity, Gauge, MapPin, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTraffic } from "@/lib/traffic-context"
import { getModeLabel, getModeColor, getCongestionColor, getCongestionLabel } from "@/lib/traffic-data"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { useState, useEffect, useRef } from "react"
import { getMeasurements } from "@/lib/api"

export function DashboardGeneral() {
  const {
    systemMode,
    currentCongestion,
    trafficLights = [],
  } = useTraffic()

  const congestionLabel = getCongestionLabel(currentCongestion)
  const congestionColor = getCongestionColor(currentCongestion)
  const onlineCount = trafficLights.filter(l => l.status === "online").length
  const offlineCount = trafficLights.filter(l => l.status === "offline").length

const [measurements, setMeasurements] = useState<{ time: string; congestion: number }[]>([])
const historyRef = useRef<{ time: string; congestion: number }[]>([])

useEffect(() => {
  getMeasurements().then(data => {
    if (data.length > 0) {
      // Usa los datos reales de MySQL 
      const mapped = data.slice(-20).map(m => ({
        time: new Date(m.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        congestion: Math.round(m.congestionLevel * 100),
      }))
      setMeasurements(mapped)
      historyRef.current = mapped
    }
  }).catch(() => {})
}, [])

// Actualiza con datos en tiempo real del SSE cuando no hay datos históricos
if (currentCongestion > 0) {
  const now = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
  const last = historyRef.current[historyRef.current.length - 1]
  if (!last || last.congestion !== currentCongestion) {
    historyRef.current = [...historyRef.current.slice(-20), { time: now, congestion: currentCongestion }]
    setMeasurements([...historyRef.current])
  }
}

const chartData = measurements

  const prevCongestion = chartData.length > 1
    ? chartData[chartData.length - 2].congestion
    : currentCongestion
  const trend = currentCongestion - prevCongestion


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Dashboard General</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitoreo en tiempo real del sistema de semaforos inteligentes - Carrera 27</p>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Modo del Sistema */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Activity className="size-3.5" />
              Modo del Sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${getModeColor(systemMode)}15` }}
              >
                <div
                  className="size-4 rounded-full animate-pulse"
                  style={{ backgroundColor: getModeColor(systemMode) }}
                />
              </div>
              <div>
                <div className="text-lg font-semibold" style={{ color: getModeColor(systemMode) }}>
                  {getModeLabel(systemMode)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Estado activo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Congestion */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Gauge className="size-3.5" />
              Congestion Carrera 27
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="relative size-10">
                <svg viewBox="0 0 36 36" className="size-10 -rotate-90">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-secondary"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={congestionColor}
                    strokeWidth="3"
                    strokeDasharray={`${currentCongestion}, 100`}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: congestionColor }}>
                  {currentCongestion}%
                </span>
              </div>
              <div>
                <div className="text-lg font-semibold capitalize" style={{ color: congestionColor }}>
                  {congestionLabel === "low" ? "Bajo" : congestionLabel === "medium" ? "Medio" : "Alto"}
                </div>
                <div className="flex items-center gap-1">
                  {trend > 0 ? (
                    <TrendingUp className="size-3 text-red-400" />
                  ) : (
                    <TrendingDown className="size-3 text-emerald-400" />
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {trend > 0 ? "+" : ""}{trend}% vs anterior
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semaforos Activos */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <MapPin className="size-3.5" />
              Semaforos Activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-400">{onlineCount}</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {onlineCount}/{trafficLights.length}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {offlineCount > 0 ? (
                    <span className="text-red-400">{offlineCount} desconectado{offlineCount > 1 ? "s" : ""}</span>
                  ) : (
                    "Todos en linea"
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
                
      {/* Grafica congestion */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm">Historico de Congestion - Carrera 27</CardTitle>
          <CardDescription className="text-xs">
            Nivel de congestion en tiempo real (fuente: Google Maps API)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="congestionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#eab308" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,15,25,0.95)",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#fff",
                  }}
                  formatter={(value) => [`${value}%`, "Congestion"]}
                />
                <ReferenceLine y={40} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.4} />
                <ReferenceLine y={70} stroke="#eab308" strokeDasharray="4 4" strokeOpacity={0.4} />
                <Area
                  type="monotone"
                  dataKey="congestion"
                  stroke="#22c55e"
                  fill="url(#congestionGradient)"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-muted-foreground">{"Bajo (<40%)"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-yellow-500" />
              <span className="text-[10px] text-muted-foreground">{"Medio (40-70%)"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-red-500" />
              <span className="text-[10px] text-muted-foreground">{"Alto (>70%)"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}