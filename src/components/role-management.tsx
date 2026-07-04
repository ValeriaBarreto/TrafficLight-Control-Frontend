import { Shield, Eye, EyeOff, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTraffic } from "@/lib/traffic-context"
import type { UserRole } from "@/lib/traffic-data"

interface RoleInfo {
  role: UserRole
  label: string
  description: string
  icon: React.ElementType
  color: string
  permissions: { label: string; allowed: boolean }[]
}

const roles: RoleInfo[] = [
  {
    role: "admin",
    label: "Administrador",
    description: "Control total del sistema. Puede cambiar modos, modificar horarios y ver el historial completo de transacciones.",
    icon: Shield,
    color: "#22c55e",
    permissions: [
      { label: "Cambiar modos de operacion", allowed: true },
      { label: "Modificar horarios", allowed: true },
      { label: "Ver historial de transacciones", allowed: true },
      { label: "Configurar intervalo de medicion", allowed: true },
    ],
  },
  {
    role: "operator",
    label: "Operador",
    description: "Acceso de visualizacion completa en tiempo real. No puede modificar configuraciones del sistema.",
    icon: Eye,
    color: "#3b82f6",
    permissions: [
      { label: "Cambiar modos de operacion", allowed: false },
      { label: "Modificar horarios", allowed: false },
      { label: "Ver historial de transacciones", allowed: true },
      { label: "Configurar intervalo de medicion", allowed: false },
    ],
  }, 
]

export function RoleManagement() {
  const { userRole, transactions } = useTraffic()

  const currentRoleInfo = roles.find(r => r.role === userRole)!

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Gestion de Roles</h1>
      </div>

      {/* Sesion Actual */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentRoleInfo.color}15` }}
            >
              <currentRoleInfo.icon className="size-5" style={{ color: currentRoleInfo.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Sesion Actual</p>
                <Badge
                  className="text-[10px] h-5 border-0"
                  style={{ backgroundColor: `${currentRoleInfo.color}20`, color: currentRoleInfo.color }}
                >
                  {currentRoleInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{currentRoleInfo.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
        {roles.map(r => {
          const isActive = userRole === r.role
          return (
            <Card
              key={r.role}
              className={`border-border/40 transition-all ${isActive ? "ring-1" : "bg-card/30"}`}
              style={isActive ? { borderColor: `${r.color}40`, boxShadow: `0 0 20px ${r.color}08` } : {}}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="size-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${r.color}15` }}
                  >
                    <r.icon className="size-4" style={{ color: r.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-sm" style={isActive ? { color: r.color } : {}}>{r.label}</CardTitle>
                    <CardDescription className="text-[10px]">{r.description.slice(0, 50)}...</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Permisos</p>
                  {r.permissions.map((perm, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {perm.allowed ? (
                        <Eye className="size-3 text-emerald-400 shrink-0" />
                      ) : (
                        <EyeOff className="size-3 text-red-400/50 shrink-0" />
                      )}
                      <span className={`text-xs ${perm.allowed ? "text-foreground" : "text-muted-foreground/50"}`}>
                        {perm.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Historial de Transacciones */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              Historial de Transacciones
            </CardTitle>
            <CardDescription className="text-xs">Registro de todas las acciones y cambios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="rounded-lg border border-border/30 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/20">
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">ID</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Hora</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Semaforo</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Accion</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium hidden md:table-cell">Detalles</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-border/15 last:border-0 hover:bg-secondary/10">
                        <td className="px-3 py-2 font-mono text-muted-foreground">{tx.id}</td>
                        <td className="px-3 py-2 font-mono text-foreground">
                          {new Date(tx.timestamp).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-[10px] h-5 border-border/30">{tx.trafficLightId}</Badge>
                        </td>
                        <td className="px-3 py-2 text-foreground">{tx.action}</td>
                        <td className="px-3 py-2 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{tx.details}</td>
                        <td className="px-3 py-2 text-muted-foreground">{tx.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
    </div>
  )
}
