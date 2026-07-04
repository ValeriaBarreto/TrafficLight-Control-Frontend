import { useState } from "react"
import { Radio, LogIn, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTraffic } from "@/lib/traffic-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const { login } = useTraffic()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
  setError("")
  setIsLoading(true)
  try {
    const success = await login(username, password)
    if (!success) {
      setError("Usuario o contrasena incorrectos")
    } else {
      navigate("/dashboard")
    }
  } catch {
    setError("Error de conexion con el servidor")
  }
  setIsLoading(false)
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Radio className="size-8 text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">TrafficIQ</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sistema de Control de Trafico Inteligente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full mt-2 gap-2" disabled={isLoading}>
              <LogIn className="size-4" />
              {isLoading ? "Ingresando..." : "Iniciar Sesion"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}