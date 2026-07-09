import { Shield, Eye, EyeOff, History, Users, Trash2, Plus, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useTraffic } from "@/lib/traffic-context"
import { getUsers, registerUser, deleteUser, updateUserRole, getTransactions } from "@/lib/api"
import type { UserRole } from "@/lib/traffic-data"
import { useState, useEffect } from "react"

interface RoleInfo {
  role: UserRole
  label: string
  description: string
  icon: React.ElementType
  color: string
  permissions: { label: string; allowed: boolean }[]
}

interface User {
  id: number
  name: string
  lastName: string
  email: string
  phone: string
  role: string
}

interface DbTransaction {
  id: number
  createdAt: string
  returnDate: string | null
  codeIntersection: string
  description: string
}

const roles: RoleInfo[] = [
  {
    role: "admin",
    label: "Administrador",
    description: "Control total del sistema. Puede cambiar modos, modificar horarios y ver el historial completo de transacciones.",
    icon: Shield,
    color: "#22c55e",
    permissions: [
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
      { label: "Modificar horarios", allowed: false },
      { label: "Ver historial de transacciones", allowed: true },
      { label: "Configurar intervalo de medicion", allowed: false },
    ],
  },
]

export function RoleManagement() {
  const { userRole } = useTraffic()
  const isAdmin = userRole === "admin"
  const currentRoleInfo = roles.find(r => r.role === userRole)!

  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: "", lastName: "", email: "", password: "", phone: "", role: "OPERATOR"
  })
  const [dbTransactions, setDbTransactions] = useState<DbTransaction[]>([])

  useEffect(() => {
    getTransactions().then(setDbTransactions).catch(console.error)
  }, [])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (e) {
      console.error("Error al cargar usuarios:", e)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin])

  const handleRegister = async () => {
    try {
      await registerUser(form)
      setForm({ name: "", lastName: "", email: "", password: "", phone: "", role: "OPERATOR" })
      setDialogOpen(false)
      loadUsers()
    } catch (e) {
      console.error("Error al registrar usuario:", e)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (e) {
      console.error("Error al eliminar usuario:", e)
    }
  }

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateUserRole(id, role)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    } catch (e) {
      console.error("Error al cambiar rol:", e)
    }
  }

  const isFormValid = form.name && form.lastName && form.email && form.password && form.phone

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Gestion de Roles</h1>
      </div>

      {/* Sesion Actual */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentRoleInfo.color}15` }}>
              <currentRoleInfo.icon className="size-5" style={{ color: currentRoleInfo.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Sesion Actual</p>
                <Badge className="text-[10px] h-5 border-0"
                  style={{ backgroundColor: `${currentRoleInfo.color}20`, color: currentRoleInfo.color }}>
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
            <Card key={r.role}
              className={`border-border/40 transition-all ${isActive ? "ring-1" : "bg-card/30"}`}
              style={isActive ? { borderColor: `${r.color}40`, boxShadow: `0 0 20px ${r.color}08` } : {}}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${r.color}15` }}>
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

      {/* Gestion de Usuarios — solo admin */}
      {isAdmin && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  Usuarios del Sistema
                </CardTitle>
                <CardDescription className="text-xs mt-1">Administra los usuarios y sus roles</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={loadUsers} disabled={loadingUsers}>
                  <RefreshCw className={`size-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="size-4" />
                      Nuevo Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Registrar Usuario</DialogTitle>
                      <DialogDescription>Complete los datos del nuevo usuario.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs">Nombre</Label>
                          <Input placeholder="Nombre" value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs">Apellido</Label>
                          <Input placeholder="Apellido" value={form.lastName}
                            onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Email</Label>
                        <Input type="email" placeholder="correo@ejemplo.com" value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Contraseña</Label>
                        <Input type="password" placeholder="••••••••" value={form.password}
                          onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Telefono</Label>
                        <Input placeholder="3001234567" value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Rol</Label>
                        <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                            <SelectItem value="OPERATOR">Operador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleRegister} disabled={!isFormValid}>Registrar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                <Users className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay usuarios registrados</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border/30 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/20">
                      <th className="px-3 py-2.5 text-left text-muted-foreground font-medium">Nombre</th>
                      <th className="px-3 py-2.5 text-left text-muted-foreground font-medium hidden md:table-cell">Email</th>
                      <th className="px-3 py-2.5 text-left text-muted-foreground font-medium hidden md:table-cell">Telefono</th>
                      <th className="px-3 py-2.5 text-left text-muted-foreground font-medium">Rol</th>
                      <th className="px-3 py-2.5 text-right text-muted-foreground font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-border/15 last:border-0 hover:bg-secondary/10">
                        <td className="px-3 py-2.5 text-foreground font-medium">
                          {user.name} {user.lastName}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{user.email}</td>
                        <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{user.phone}</td>
                        <td className="px-3 py-2.5">
                          <Select value={user.role} onValueChange={v => handleRoleChange(user.id, v)}>
                            <SelectTrigger className="h-7 w-28 text-[11px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Administrador</SelectItem>
                              <SelectItem value="OPERATOR">Operador</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Button variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(user.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historial de Transacciones */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            Historial de Transacciones
          </CardTitle>
          <CardDescription className="text-xs">Registro de activaciones del sistema de semaforos</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px]">
            <div className="rounded-lg border border-border/30 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/20">
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">ID</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Fecha Inicio</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Fecha Fin</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Interseccion</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium hidden md:table-cell">Descripcion</th>
                  </tr>
                </thead>
                <tbody>
                  {dbTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">
                        Sin transacciones registradas
                      </td>
                    </tr>
                  ) : (
                    [...dbTransactions].reverse().map(tx => (
                      <tr key={tx.id} className="border-b border-border/15 last:border-0 hover:bg-secondary/10">
                        <td className="px-3 py-2 font-mono text-muted-foreground">{tx.id}</td>
                        <td className="px-3 py-2 font-mono text-foreground">
                          {new Date(tx.createdAt).toLocaleString("es-CO", {
                            day: "2-digit", month: "2-digit", year: "2-digit",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                        <td className="px-3 py-2 font-mono text-foreground">
                          {tx.returnDate
                            ? new Date(tx.returnDate).toLocaleString("es-CO", {
                                day: "2-digit", month: "2-digit", year: "2-digit",
                                hour: "2-digit", minute: "2-digit"
                              })
                            : <span className="text-muted-foreground/50">—</span>
                          }
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-[10px] h-5 border-border/30">{tx.codeIntersection}</Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{tx.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}