import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { TrafficProvider, useTraffic } from "@/lib/traffic-context"
import { DashboardGeneral } from "@/components/dashboard-general"
import { TrafficLightGrid } from "@/components/traffic-light-grid"
import { RoleManagement } from "@/components/role-management"
import { OperationModes } from "@/components/operation-modes"
import { LoginForm } from "@/components/login-form"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useTraffic()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNavbar />
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px]">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useTraffic()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><DashboardGeneral /></AppLayout></PrivateRoute>} />
      <Route path="/rutas" element={<PrivateRoute><AppLayout><TrafficLightGrid /></AppLayout></PrivateRoute>} />
      <Route path="/modos" element={<PrivateRoute><AppLayout><OperationModes /></AppLayout></PrivateRoute>} />
      <Route path="/roles" element={<PrivateRoute><AppLayout><RoleManagement /></AppLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TrafficProvider>
        <TooltipProvider>
          <AppRoutes />
        </TooltipProvider>
      </TrafficProvider>
    </BrowserRouter>
  )
}