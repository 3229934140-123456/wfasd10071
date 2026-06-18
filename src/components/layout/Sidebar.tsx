import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PawPrint,
  Stethoscope,
  Syringe,
  Bed,
  Pill,
  BarChart3,
  LogOut,
  Heart,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "首页仪表盘", icon: LayoutDashboard },
  { path: "/pets", label: "宠物档案", icon: PawPrint },
  { path: "/medical", label: "就诊病历", icon: Stethoscope },
  { path: "/vaccine", label: "疫苗管理", icon: Syringe },
  { path: "/hospitalization", label: "住院护理", icon: Bed },
  { path: "/pharmacy", label: "药品库存", icon: Pill },
  { path: "/statistics", label: "数据统计", icon: BarChart3 },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-warm-200 flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-6 border-b border-warm-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-bold text-warm-900 text-lg">宠物诊所</h1>
            <p className="text-xs text-warm-500">管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-sm"
                  : "text-warm-600 hover:bg-warm-50 hover:text-warm-900"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-warm-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.name?.charAt(0) || "用"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-900 truncate">{user?.name || "用户"}</p>
            <p className="text-xs text-warm-500">
              {user?.role === "admin"
                ? "管理员"
                : user?.role === "doctor"
                ? "兽医"
                : "前台"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
