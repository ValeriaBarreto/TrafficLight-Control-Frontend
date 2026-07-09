import { useState, useEffect } from "react"
import { Wifi, WifiOff, Clock, RotateCcw, Plus, ChevronRight, MapPin, Route, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useTraffic } from "@/lib/traffic-context"
import { getCongestionColor, getStatusColor, getModeLabel } from "@/lib/traffic-data"
import { getRoutes, getIntersectionsByRoute, createRoute, createIntersection, deleteRoute, deleteIntersection } from "@/lib/api"
import type { TrafficLight } from "@/lib/traffic-data"

interface Route {
  id: number
  name: string
  coordinate: { latitude: number; longitude: number }
}

function TrafficLightVisual({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg bg-black/40 p-2 border border-white/5">
      <div className={`size-5 rounded-full transition-all duration-500 ${color === "red" ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" : "bg-red-500/15"}`} />
      <div className={`size-5 rounded-full transition-all duration-500 ${color === "yellow" ? "bg-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.6)]" : "bg-yellow-500/15"}`} />
      <div className={`size-5 rounded-full transition-all duration-500 ${color === "green" ? "bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" : "bg-emerald-500/15"}`} />
    </div>
  )
}

function TrafficLightCard({ light, onSelect }: { light: TrafficLight; onSelect: () => void }) {
  const statusColor = getStatusColor(light.status)
  return (
    <Card
      className="border-border/40 bg-card/50 hover:bg-card/80 transition-all duration-200 cursor-pointer hover:border-emerald-500/30"
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
                style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
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
                  <span className="text-sm text-foreground capitalize">
                    {light.currentColor === "green" ? "Verde" : light.currentColor === "yellow" ? "Amarillo" : "Rojo"}
                  </span>
                </div>
              </div>
            </div>

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

function AddRouteDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "" })
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!form.name || !form.latitude || !form.longitude) return
    setLoading(true)
    try {
      await createRoute({
        name: form.name,
        coordinate: { latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) },
      })
      setForm({ name: "", latitude: "", longitude: "" })
      onCreated()
      onClose()
    } catch (e) {
      console.error("Error al crear ruta:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Ruta</DialogTitle>
          <DialogDescription>Ingresa los datos de la nueva ruta.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Nombre</Label>
            <Input placeholder="Ruta - Carrera 33" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Latitud</Label>
              <Input placeholder="7.1254" value={form.latitude}
                onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Longitud</Label>
              <Input placeholder="-73.1198" value={form.longitude}
                onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={loading || !form.name || !form.latitude || !form.longitude}>
            {loading ? "Creando..." : "Crear Ruta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddIntersectionDialog({ open, onClose, routeId, onCreated }: {
  open: boolean
  onClose: () => void
  routeId: number
  onCreated: () => void
}) {
  const [form, setForm] = useState({ location: "", code: "", position: "", latitude: "", longitude: "" })
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!form.location || !form.code || !form.position || !form.latitude || !form.longitude) return
    setLoading(true)
    try {
      await createIntersection({
        location: form.location,
        code: form.code,
        position: parseInt(form.position),
        routeId,
        coordinate: { latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) },
      })
      setForm({ location: "", code: "", position: "", latitude: "", longitude: "" })
      onCreated()
      onClose()
    } catch (e) {
      console.error("Error al crear interseccion:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Semaforo</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo semaforo.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Ubicacion</Label>
              <Input placeholder="Calle 32" value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Codigo</Label>
              <Input placeholder="INT-33-32" value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Posicion</Label>
            <Input type="number" placeholder="1" value={form.position}
              onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Latitud</Label>
              <Input placeholder="7.127318" value={form.latitude}
                onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Longitud</Label>
              <Input placeholder="-73.112977" value={form.longitude}
                onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={loading || !form.location || !form.code || !form.position || !form.latitude || !form.longitude}>
            {loading ? "Creando..." : "Agregar Semaforo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TrafficLightGrid() {
  const { trafficLights, selectedLight, setSelectedLight } = useTraffic()

  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [routeLights, setRouteLights] = useState<TrafficLight[]>([])
  const [addRouteOpen, setAddRouteOpen] = useState(false)
  const [addIntersectionOpen, setAddIntersectionOpen] = useState(false)
  const [loadingIntersections, setLoadingIntersections] = useState(false)

  const loadRoutes = async () => {
    try {
      const data = await getRoutes()
      setRoutes(data)
    } catch (e) {
      console.error("Error al cargar rutas:", e)
    }
  }

  const loadIntersections = async (route: Route) => {
    setLoadingIntersections(true)
    try {
      const data = await getIntersectionsByRoute(route.id)
      // Mapea las intersecciones del backend con el estado en tiempo real del contexto
      const mapped = data.map(i => {
        const live = trafficLights.find(l => l.id === i.code)
        return live ?? {
          id: i.code,
          name: i.location,
          location: i.location,
          latitude: i.latitude,
          longitude: i.longitude,
          status: "connecting" as const,
          currentColor: "red" as const,
          congestionLevel: 0,
          mode: "normal" as const,
          cycleTimeGreen: 30,
          cycleTimeYellow: 5,
          cycleTimeRed: 30,
          lastSync: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
        }
      })
      setRouteLights(mapped)
    } catch (e) {
      console.error("Error al cargar intersecciones:", e)
    } finally {
      setLoadingIntersections(false)
    }
  }

  useEffect(() => {
    loadRoutes()
  }, [])

  useEffect(() => {
    if (selectedRoute) {
      loadIntersections(selectedRoute)
    }
  }, [selectedRoute, trafficLights])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Rutas</h1>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[400px]">
        {/* Panel de rutas */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          <div className="rounded-lg border border-border/40 bg-card/50 flex flex-col h-full">
            <ScrollArea className="flex-1">
              <div className="p-2 flex flex-col gap-1">
                {routes.length === 0 ? (
                  <div className="p-4 text-center">
                    <Route className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Sin rutas</p>
                  </div>
                ) : (
                  routes.map(route => (
                    <div
                      key={route.id}
                      className={`w-full rounded-md flex items-center gap-1 group ${
                        selectedRoute?.id === route.id
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "hover:bg-secondary/40"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedRoute(route)}
                        className={`flex-1 text-left px-3 py-2.5 text-sm flex items-center gap-2 min-w-0 ${
                          selectedRoute?.id === route.id ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate text-xs font-medium">{route.name}</span>
                        <ChevronRight className={`size-3.5 shrink-0 ml-auto transition-transform ${selectedRoute?.id === route.id ? "rotate-90" : ""}`} />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            await deleteRoute(route.id)
                            if (selectedRoute?.id === route.id) setSelectedRoute(null)
                            loadRoutes()
                          } catch (err) {
                            console.error("Error al eliminar ruta:", err)
                          }
                        }}
                        className="p-1.5 mr-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-2 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setAddRouteOpen(true)}
              >
                <Plus className="size-3.5" />
                Agregar Ruta
              </Button>
            </div>
          </div>
        </div>

        {/* Panel de semáforos */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {selectedRoute ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{selectedRoute.name}</p>
                  <Badge variant="outline" className="text-[10px] h-5 border-border/30">
                    {routeLights.length} semaforos
                  </Badge>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setAddIntersectionOpen(true)}>
                  <Plus className="size-4" />
                  Agregar Semaforo
                </Button>
              </div>

              {loadingIntersections ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Cargando semaforos...</p>
                </div>
              ) : routeLights.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 p-8">
                  <TrafficLightVisual color="red" />
                  <p className="text-sm text-muted-foreground">Sin semaforos en esta ruta</p>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setAddIntersectionOpen(true)}>
                    <Plus className="size-4" />
                    Agregar primer semaforo
                  </Button>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pr-2">
                    {routeLights.map(light => (
                    <div key={light.id} className="relative group">
                      <TrafficLightCard
                        light={light}
                        onSelect={() => setSelectedLight(light)}
                      />
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            await deleteIntersection(light.id)
                            if (selectedRoute) loadIntersections(selectedRoute)
                          } catch (err) {
                            console.error("Error al eliminar interseccion:", err)
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded bg-background/80 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  </div>
                </ScrollArea>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40">
              <Route className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Selecciona una ruta para ver sus semaforos</p>
            </div>
          )}
        </div>
      </div>

      {selectedLight && (
        <TrafficLightDetail light={selectedLight} onClose={() => setSelectedLight(null)} />
      )}

      <AddRouteDialog
        open={addRouteOpen}
        onClose={() => setAddRouteOpen(false)}
        onCreated={loadRoutes}
      />

      {selectedRoute && (
        <AddIntersectionDialog
          open={addIntersectionOpen}
          onClose={() => setAddIntersectionOpen(false)}
          routeId={selectedRoute.id}
          onCreated={() => loadIntersections(selectedRoute)}
        />
      )}
    </div>
  )
}