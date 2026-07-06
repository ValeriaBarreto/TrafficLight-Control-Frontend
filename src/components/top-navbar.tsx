
import { Wifi, WifiOff, LogOut, ShieldCheck, User } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTraffic } from "@/lib/traffic-context"
import { getModeLabel, getModeColor, getCongestionColor } from "@/lib/traffic-data"
import { useNavigate } from "react-router-dom"

export function TopNavbar() {
  const {
    systemMode,
    currentCongestion,
    trafficLights,
    userRole,
    logout,
  } = useTraffic()

  const navigate = useNavigate()
  const onlineCount = trafficLights.filter(l => l.status === "online").length
  const offlineCount = trafficLights.filter(l => l.status === "offline").length
  const totalCount = trafficLights.length

  const handleLogout = () => {
    logout()
    navigate("/login")
  }


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-md px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="h-5 w-px bg-border" />

      {/* Modo del Sistema */}
      <div className="flex items-center gap-2">
        <div
          className="size-2 rounded-full animate-pulse"
          style={{ backgroundColor: getModeColor(systemMode) }}
        />
        <span className="text-xs font-medium text-foreground hidden sm:inline">
          {getModeLabel(systemMode)}
        </span>
      </div>

      <div className="h-5 w-px bg-border hidden sm:block" />

      {/* Congestion */}
      <div className="hidden sm:flex items-center gap-2">
        <div
          className="size-2 rounded-full"
          style={{ backgroundColor: getCongestionColor(currentCongestion) }}
        />
        <span className="text-xs text-muted-foreground">
          Congestion: <span className="text-foreground font-medium">{Math.min(100, Math.max(0, Math.round((currentCongestion - 1) * 100)))}%</span>
        </span>
      </div>

      <div className="h-5 w-px bg-border hidden md:block" />

      {/* Conectividad */}
      <div className="hidden md:flex items-center gap-2">
        {offlineCount > 0 ? (
          <WifiOff className="size-3.5 text-red-400" />
        ) : (
          <Wifi className="size-3.5 text-emerald-400" />
        )}
        <span className="text-xs text-muted-foreground">
          {onlineCount}/{totalCount} en linea
        </span>
      </div>

      <div className="flex-1" />

      {/* Rol */}
      <div className="flex items-center gap-1.5 rounded-md bg-secondary/30 border border-border/50 px-2.5 py-1">
        {userRole === "admin" ? (
          <ShieldCheck className="size-3.5 text-emerald-400" />
        ) : (
          <User className="size-3.5 text-sky-400" />
        )}
        <span className="text-xs font-medium text-foreground">
          {userRole === "admin" ? "Administrador" : "Operador"}
        </span>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        title="Cerrar sesion"
      >
        <LogOut className="size-4" />
      </button>
    </header>
  )
}
