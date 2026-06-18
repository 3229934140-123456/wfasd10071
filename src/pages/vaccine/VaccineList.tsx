import { useEffect, useState } from "react";
import { Syringe, AlertTriangle, Calendar, Search, Plus } from "lucide-react";
import type { Vaccination } from "@/types";
import { useNavigate } from "react-router-dom";

export default function VaccineList() {
  const navigate = useNavigate();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [reminders, setReminders] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reminders");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vacRes, remRes] = await Promise.all([
        fetch("/api/vaccinations"),
        fetch("/api/vaccinations/reminders"),
      ]);
      const vacData = await vacRes.json();
      const remData = await remRes.json();
      setVaccinations(vacData.data || []);
      setReminders(remData.data || []);
    } catch (error) {
      console.error("Failed to load vaccine data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-700";
      case "due":
        return "bg-warning-100 text-warning-700";
      case "upcoming":
        return "bg-primary-100 text-primary-700";
      default:
        return "bg-warm-100 text-warm-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "overdue":
        return "已过期";
      case "due":
        return "即将到期";
      case "upcoming":
        return "待接种";
      default:
        return "已完成";
    }
  };

  const filteredVaccinations = vaccinations.filter(
    (v) =>
      !searchTerm ||
      v.petName?.includes(searchTerm) ||
      v.vaccineName?.includes(searchTerm) ||
      v.ownerName?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">已过期</p>
              <p className="text-3xl font-bold mt-1">
                {reminders.filter((r) => r.status === "overdue").length}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">即将到期</p>
              <p className="text-3xl font-bold mt-1">
                {reminders.filter((r) => r.status === "due").length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">待接种</p>
              <p className="text-3xl font-bold mt-1">
                {reminders.filter((r) => r.status === "upcoming").length}
              </p>
            </div>
            <Syringe className="w-10 h-10 text-white/30" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-warm-200">
        {[
          { key: "reminders", label: "疫苗提醒" },
          { key: "all", label: "全部记录" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-warm-500 hover:text-warm-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "all" && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索宠物、疫苗、主人..."
              className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-warm-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">宠物</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">主人</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">疫苗名称</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">接种日期</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">下次到期</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {(activeTab === "reminders" ? reminders : filteredVaccinations).map((v) => (
                <tr key={v.id} className="hover:bg-warm-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-warm-900">{v.petName}</span>
                  </td>
                  <td className="px-6 py-4 text-warm-600">{v.ownerName}</td>
                  <td className="px-6 py-4 text-warm-700">{v.vaccineName}</td>
                  <td className="px-6 py-4 text-warm-500">{v.vaccinationDate}</td>
                  <td className="px-6 py-4 text-warm-600">
                    {v.nextDueDate || "-"}
                    {v.status === "overdue" && "daysUntilDue" in v && (
                      <span className="text-red-500 text-xs ml-2">
                        (过期{(v as any).daysUntilDue * -1}天)
                      </span>
                    )}
                    {v.status === "due" && "daysUntilDue" in v && (
                      <span className="text-warning-600 text-xs ml-2">
                        (还有{(v as any).daysUntilDue}天)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(v.status)}`}>
                      {getStatusText(v.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(activeTab === "reminders" ? reminders : filteredVaccinations).length === 0 && (
            <div className="text-center py-16">
              <Syringe className="w-12 h-12 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-500">暂无疫苗记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
