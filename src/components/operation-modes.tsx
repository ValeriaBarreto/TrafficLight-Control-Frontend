import { useState, useMemo } from "react"
import { Power, Sun, Flame, Clock, Calendar, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useTraffic } from "@/lib/traffic-context"
import { getModeLabel, getModeColor, type SystemMode } from "@/lib/traffic-data"

const modes: { mode: SystemMode; icon: React.ElementType; description: string; details: string[] }[] = [
  {
    mode: "off",
    icon: Power,
    description: "Semaforos en modo intermitente. Sin sincronizacion activa.",
    details: ["Intermitente en amarillo", "Sin control de congestion", "Sin sincronizacion"],
  },
  {
    mode: "normal",
    icon: Sun,
    description: "Tiempos estandar con ajuste leve segun congestion detectada.",
    details: ["Tiempos base configurados", "Ajuste leve automatico", "Balance entre direcciones"],
  },
  {
    mode: "rush_hour",
    icon: Flame,
    description: "Ajuste agresivo de tiempos y estrategias de sincronizacion activas.",
    details: ["Ajuste agresivo de tiempos", "Ola verde activada", "Priorizacion dinamica", "Extension de verde"],
  },
]

const ALL_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

// Genera horas
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return `${hour}:00`
})

interface TimeSlot {
  day: string
  hour: string
}

export function OperationModes() {
  const { systemMode,  schedule, addScheduleEntry, removeScheduleEntry, userRole } = useTraffic()
  const isAdmin = userRole === "admin"
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<SystemMode>("normal")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // Calcula los slots ocupados a partir del horario existente
  const occupiedSlots = useMemo(() => {
    const slots: TimeSlot[] = []
    schedule.forEach(entry => {
      const startHour = parseInt(entry.startTime.split(":")[0])
      const endHour = parseInt(entry.endTime.split(":")[0])
      
      entry.days.forEach(day => {
        for (let h = startHour; h < endHour; h++) {
          slots.push({ day, hour: `${h.toString().padStart(2, "0")}:00` })
        }
      })
    })
    return slots
  }, [schedule])

  // Calcula las horas disponibles para el inicio y fin del horario, considerando los dias seleccionados y los slots ocupados
  const getAvailableHours = (days: string[], isStart: boolean, currentStart?: string) => {
    if (days.length === 0) return HOURS
    
    return HOURS.filter(hour => {
      // Si es hora de fin, asegurarse de que sea mayor que la hora de inicio
      if (!isStart && currentStart) {
        const startHourNum = parseInt(currentStart.split(":")[0])
        const hourNum = parseInt(hour.split(":")[0])
        if (hourNum <= startHourNum) return false
      }
      
      // Verifica si el slot esta ocupado para todos los dias seleccionados
      const hourNum = parseInt(hour.split(":")[0])
      return days.every(day => {
        // Si es hora de fin, verificar todos los slots entre la hora de inicio y la hora de fin
        if (!isStart && currentStart) {
          const startHourNum = parseInt(currentStart.split(":")[0])
          for (let h = startHourNum; h < hourNum; h++) {
            const isOccupied = occupiedSlots.some(
              slot => slot.day === day && slot.hour === `${h.toString().padStart(2, "0")}:00`
            )
            if (isOccupied) return false
          }
        }
        
        // Si es hora de inicio, solo verificar el slot actual
        if (isStart) {
          return !occupiedSlots.some(
            slot => slot.day === day && slot.hour === hour
          )
        }
        
        return true
      })
    })
  }

  const availableStartHours = getAvailableHours(selectedDays, true)
  const availableEndHours = getAvailableHours(selectedDays, false, startTime)

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day)
      }
      return [...prev, day]
    })
    // Resetear horas al cambiar dias
    setStartTime("")
    setEndTime("")
  }

  const handleAddSchedule = () => {
    if (selectedDays.length === 0 || !startTime || !endTime) return
    
    addScheduleEntry({
      mode: selectedMode,
      startTime,
      endTime,
      days: selectedDays,
    })
    
    // Resetear formulario
    setSelectedMode("normal")
    setSelectedDays([])
    setStartTime("")
    setEndTime("")
    setDialogOpen(false)
  }

  const isFormValid = selectedDays.length > 0 && startTime && endTime

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Modos de Operacion</h1>
      </div>

      {/* Modos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map(({ mode, icon: Icon, description, details }) => {
          const isActive = systemMode === mode
          const color = getModeColor(mode)
          return (
            <Card
              key={mode}
              className={`border-border/40 transition-all duration-300 ${
                isActive ? "border-opacity-100 ring-1" : "bg-card/30 hover:bg-card/60"
              }`}
              style={isActive ? { borderColor: `${color}40`, boxShadow: `0 0 20px ${color}10`, } : {}}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="size-5" style={{ color }} />
                  </div>
                  {isActive && (
                    <Badge
                      className="h-5 text-[10px] border-0"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      Activo
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2" style={isActive ? { color } : {}}>
                  {getModeLabel(mode)}
                </CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <ul className="flex flex-col gap-1.5">
                    {details.map((d, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="size-1 rounded-full" style={{ backgroundColor: isActive ? color : "rgba(255,255,255,0.2)" }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                  
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Horario */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                Horarios de Activacion
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {isAdmin ? "Configuracion de horarios automaticos por modo" : "Vista de horarios automaticos (solo lectura)"}
              </CardDescription>
            </div>
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="size-4" />
                    Crear Horario
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Horario</DialogTitle>
                    <DialogDescription>
                      Configure un nuevo horario de activacion para un modo de operacion.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    {/* Mode Selection */}
                    <div className="flex flex-col gap-2">
                      <Label>Modo de Operacion</Label>
                      <Select value={selectedMode} onValueChange={(v) => setSelectedMode(v as SystemMode)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar modo" />
                        </SelectTrigger>
                        <SelectContent>
                          {modes.map(({ mode }) => (
                            <SelectItem key={mode} value={mode}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="size-2 rounded-full" 
                                  style={{ backgroundColor: getModeColor(mode) }} 
                                />
                                {getModeLabel(mode)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Days Selection */}
                    <div className="flex flex-col gap-2">
                      <Label>Dias de la Semana</Label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_DAYS.map(day => (
                          <div key={day} className="flex items-center gap-1.5">
                            <Checkbox
                              id={day}
                              checked={selectedDays.includes(day)}
                              onCheckedChange={() => handleDayToggle(day)}
                            />
                            <Label htmlFor={day} className="text-sm cursor-pointer">
                              {day}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Hora de Inicio</Label>
                        <Select 
                          value={startTime} 
                          onValueChange={(v) => {
                            setStartTime(v)
                            setEndTime("")
                          }}
                          disabled={selectedDays.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Inicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStartHours.map(hour => (
                              <SelectItem key={hour} value={hour}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Hora de Fin</Label>
                        <Select 
                          value={endTime} 
                          onValueChange={setEndTime}
                          disabled={!startTime}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Fin" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableEndHours.map(hour => (
                              <SelectItem key={hour} value={hour}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedDays.length > 0 && availableStartHours.length === 0 && (
                      <p className="text-xs text-amber-500">
                        No hay horas disponibles para los dias seleccionados. Ya estan ocupadas.
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddSchedule} disabled={!isFormValid}>
                      Crear Horario
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {schedule.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
              <Calendar className="size-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay horarios configurados</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {isAdmin ? "Haga clic en \"Crear Horario\" para agregar uno nuevo" : "El administrador aun no ha configurado horarios"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/30 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/20">
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Modo</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Inicio</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Fin</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Dias</th>
                    {isAdmin && (
                      <th className="px-4 py-2.5 text-right text-muted-foreground font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((entry) => {
                    const color = getModeColor(entry.mode)
                    return (
                      <tr key={entry.id} className="border-b border-border/20 last:border-0 hover:bg-secondary/10">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="font-medium" style={{ color }}>{getModeLabel(entry.mode)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1 text-foreground">
                            <Clock className="size-3 text-muted-foreground" />
                            {entry.startTime}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-foreground">{entry.endTime}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {entry.days.map(d => (
                              <span key={d} className="rounded bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {d}
                              </span>
                            ))}
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-2.5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeScheduleEntry(entry.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
