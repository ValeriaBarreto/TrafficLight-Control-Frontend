import { Wifi, WifiOff, Clock, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useTraffic } from "@/lib/traffic-context"
import { getCongestionColor, getStatusColor, getModeLabel } from "@/lib/traffic-data"
import type { TrafficLight } from "@/lib/traffic-data"

function TrafficLightVisual({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg bg-black/40 p-2 border border-white/5">
      <div
        className={`size-5 rounded-full transition-all duration-500 ${
          color === "red" ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" : "bg-red-500/15"
        }`}
      />
      <div
        className={`size-5 rounded-full transition-all duration-500 ${
          color === "yellow" ? "bg-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.6)]" : "bg-yellow-500/15"
        }`}
      />
      <div
        className={`size-5 rounded-full transition-all duration-500 ${
          color === "green" ? "bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" : "bg-emerald-500/15"
        }`}
      />
    </div>
  )
}

function TrafficLightCard({ light, onSelect }: { light: TrafficLight; onSelect: () => void }) {
  const statusColor = getStatusColor(light.status)

  return (
    <Card
      className="border-border/40 bg-card/50 hover:bg-card/80 transition-all duration-200 cursor-pointer hover:border-emerald-500/30 group"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{light.id}</span>
              <Badge
                variant="outline"
                className="h-5 text-[10px] border-0 px-1.5"
                style={{
                  backgroundColor: `${statusColor}15`,
                  color: statusColor,
                }}
              >
                <div className="size-1.5 rounded-full mr-1 animate-pulse" style={{ backgroundColor: statusColor }} />
                {light.status === "online" ? "En linea" : light.status === "connecting" ? "Conectando" : "Desconectado"}
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{light.location}</p>
          </div>
          <TrafficLightVisual color={light.currentColor} />
        </div>
      </CardContent>
    </Card>
  )
}

function TrafficLightDetail({ light, onClose }: { light: TrafficLight; onClose: () => void }) {
  const { transactions } = useTraffic()
  const lightTransactions = transactions.filter(t => t.trafficLightId === light.id)

  return (
    <Sheet open={true} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-background border-border/50">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground flex items-center gap-2">
            <TrafficLightVisual color={light.currentColor} />
            <div>
              <div className="text-base">{light.id}</div>
              <div className="text-xs font-normal text-muted-foreground">{light.location}</div>
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Detalles del semaforo {light.id}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="flex flex-col gap-5">
            {/* Estado */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Estado</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-muted-foreground">Estado</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {light.status === "online" ? <Wifi className="size-3 text-emerald-400" /> : <WifiOff className="size-3 text-red-400" />}
                    <span className="text-sm text-foreground capitalize">
                      {light.status === "online" ? "En linea" : light.status === "connecting" ? "Conectando" : "Desconectado"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Modo Operativo</div>
                  <span className="text-sm text-foreground">{getModeLabel(light.mode)}</span>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Congestion Local</div>
                  <span className="text-sm font-medium" style={{ color: getCongestionColor(light.congestionLevel) }}>
                    {light.congestionLevel}%
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Color Activo</div>
                  <span className="text-sm text-foreground capitalize">{light.currentColor === "green" ? "Verde" : light.currentColor === "yellow" ? "Amarillo" : "Rojo"}</span>
                </div>
              </div>
            </div>

            {/* Tiempos de Ciclo */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Tiempos de Ciclo</h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Verde", time: light.cycleTimeGreen, color: "#22c55e" },
                  { label: "Amarillo", time: light.cycleTimeYellow, color: "#eab308" },
                  { label: "Rojo", time: light.cycleTimeRed, color: "#ef4444" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">{item.time}s</span>
                  </div>
                ))}
                <Separator className="my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Ciclo</span>
                  <span className="text-sm font-mono text-foreground">
                    {light.cycleTimeGreen + light.cycleTimeYellow + light.cycleTimeRed}s
                  </span>
                </div>
              </div>
            </div>

            {/* Sincronizacion */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Sincronizacion</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ultima Sincronizacion</span>
                  </div>
                  <span className="text-xs font-mono text-foreground">
                    {new Date(light.lastSync).toLocaleTimeString("es-CO")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ultima Actualizacion</span>
                  </div>
                  <span className="text-xs font-mono text-foreground">
                    {new Date(light.lastUpdate).toLocaleTimeString("es-CO")}
                  </span>
                </div>
              </div>
            </div>

            {/* Historial de Transacciones */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Historial de Transacciones
              </h3>
              {lightTransactions.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin transacciones recientes</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {lightTransactions.map(tx => (
                    <div key={tx.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{tx.action}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(tx.timestamp).toLocaleTimeString("es-CO")}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{tx.details}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
export function TrafficLightGrid() {
  const { trafficLights, selectedLight, setSelectedLight } = useTraffic()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Semaforos</h1>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {trafficLights.map(light => (
          <TrafficLightCard
            key={light.id}
            light={light}
            onSelect={() => setSelectedLight(light)}
          />
        ))}
      </div>

      {selectedLight && (
        <TrafficLightDetail light={selectedLight} onClose={() => setSelectedLight(null)} />
      )}
    </div>
  )
}

