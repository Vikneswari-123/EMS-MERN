import { useEffect, useState } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { dummyProfileData } from "../assets/assets"
import {
  User,
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const Sidebar = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setUsername(`${dummyProfileData.firstName} ${dummyProfileData.lastName}`)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = () => {
    navigate("/login")
  }

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/attendance", label: "Attendance", icon: CalendarDays },
    { path: "/leave", label: "Leave", icon: Briefcase },
    { path: "/payslips", label: "Payslips", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950/30 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-slate-800 px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Employee MS</p>
                <p className="text-xs text-slate-500">Management System</p>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 text-xs font-semibold text-slate-100">
                {username
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">{username || "John Doe"}</p>
                <p className="text-xs text-slate-500">Employee</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Navigation
            </p>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-800 text-slate-100"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-800 px-4 py-4">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-800 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      <button
        className="lg:hidden fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-slate-100"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}

export default Sidebar


