import { useEffect, useState } from "react";
import {
  Stethoscope,
  Bell,
  Package,
  Syringe,
  TrendingUp,
  Bed,
  PawPrint,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DashboardStats, Vaccination } from "@/types";

const statCards = [
  {
    key: "todayVisits",
    label: "今日就诊",
    icon: Stethoscope,
    color: "primary",
    bgGradient: "from-primary-500 to-primary-600",
  },
  {
    key: "pendingVisits",
    label: "待处理",
    icon: Clock,
    color: "warning",
    bgGradient: "from-warning-500 to-warning-600",
  },
  {
    key: "lowStockAlerts",
    label: "库存预警",
    icon: Package,
    color: "red",
    bgGradient: "from-red-500 to-red-600",
  },
  {
    key: "vaccineReminders",
    label: "疫苗提醒",
    icon: Syringe,
    color: "secondary",
    bgGradient: "from-secondary-500 to-secondary-600",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vaccineReminders, setVaccineReminders] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, vaccineRes] = await Promise.all([
        fetch("/api/statistics/dashboard"),
        fetch("/api/vaccinations/reminders"),
      ]);
      const statsData = await statsRes.json();
      const vaccineData = await vaccineRes.json();
      setStats(statsData.data);
      setVaccineReminders(vaccineData.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "快速挂号", icon: Plus, path: "/medical/new", color: "primary" },
    { label: "新增宠物", icon: PawPrint, path: "/pets/new", color: "secondary" },
    { label: "药品入库", icon: Package, path: "/pharmacy", color: "warning" },
    { label: "疫苗登记", icon: Syringe, path: "/vaccine", color: "green" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-700";
      case "due":
        return "bg-warning-100 text-warning-700";
      default:
        return "bg-primary-100 text-primary-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "overdue":
        return "已过期";
      case "due":
        return "即将到期";
      default:
        return "待接种";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const value = stats?.[card.key as keyof DashboardStats] as number;
          return (
            <div
              key={card.key}
              className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-warm-500 text-sm mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-warm-900">{value || 0}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold text-warm-900 mb-4">快捷操作</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-${action.color}-100 text-${action.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-warm-700">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warm-900">本月营收概览</h3>
              <span className="text-sm text-warm-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                <span className="text-primary-600 font-medium">+{stats?.revenueGrowth || 0}%</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-warm-900">¥{stats?.monthlyRevenue?.toFixed(2) || "0.00"}</span>
              <span className="text-warm-500 text-sm">本月</span>
            </div>
            <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{ width: "68%" }} />
            </div>
            <p className="text-xs text-warm-400 mt-2">已完成月度目标的 68%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-warm-900">疫苗提醒</h3>
            <button
              onClick={() => navigate("/vaccine")}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {vaccineReminders.length > 0 ? (
              vaccineReminders.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors animate-slide-in-right"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-lg ${getStatusColor(item.status)} flex items-center justify-center flex-shrink-0`}>
                    {item.status === "overdue" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Syringe className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900 truncate">{item.petName}</p>
                    <p className="text-xs text-warm-500 truncate">{item.vaccineName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    <p className="text-xs text-warm-400 mt-1">{item.nextDueDate}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-warm-400 py-8 text-sm">暂无疫苗提醒</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-warm-900 flex items-center gap-2">
              <Bed className="w-5 h-5 text-secondary-500" />
              在院宠物
            </h3>
            <span className="text-sm text-warm-500">共 {stats?.hospitalizedPets || 0} 只</span>
          </div>
          <p className="text-warm-400 text-sm text-center py-8">暂无在院宠物</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-warm-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              今日预约
            </h3>
            <button className="text-sm text-primary-600 hover:text-primary-700">管理预约</button>
          </div>
          <p className="text-warm-400 text-sm text-center py-8">暂无今日预约</p>
        </div>
      </div>
    </div>
  );
}
