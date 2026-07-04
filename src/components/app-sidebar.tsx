import {
  LayoutDashboard,
  TrafficCone,
  Settings2,
  Shield,
  Radio,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useTraffic } from "@/lib/traffic-context"
import { getModeColor, getModeLabel } from "@/lib/traffic-data"

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/semaforos", label: "Semaforos", icon: TrafficCone },
  { path: "/modos", label: "Modos de Operacion", icon: Settings2 },
  { path: "/roles", label: "Gestion de Roles", icon: Shield },
]

export function AppSidebar() {
  const { systemMode } = useTraffic()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <Radio className="size-5 text-emerald-400" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              TrafficIQ
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Control Center
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegacion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    tooltip={item.label}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
          <div
            className="size-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: getModeColor(systemMode) }}
          />
          <span className="text-xs text-muted-foreground">
            Modo: <span className="text-foreground font-medium">{getModeLabel(systemMode)}</span>
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}