import { useEffect, useState } from "react";
import { Bed, Calendar, Clock, PawPrint, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Hospitalization } from "@/types";

export default function HospitalizationList() {
  const navigate = useNavigate();
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("admitted");

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/hospitalizations${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`
      );
      const data = await res.json();
      setHospitalizations(data.data || []);
    } catch (error) {
      console.error("Failed to load hospitalizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "admitted"
      ? "bg-primary-100 text-primary-700"
      : "bg-warm-100 text-warm-600";
  };

  const getStatusText = (status: string) => {
    return status === "admitted" ? "住院中" : "已出院";
  };

  const calcDaysHospitalized = (admitDate: string) => {
    const admit = new Date(admitDate);
    const now = new Date();
    const diff = Math.ceil((now.getTime() - admit.getTime()) / (1000 * 60 * 60 * 24));
    return diff || 1;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { value: "admitted", label: "住院中" },
            { value: "discharged", label: "已出院" },
            { value: "all", label: "全部" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? "bg-primary-100 text-primary-700"
                  : "bg-white text-warm-600 hover:bg-warm-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {}}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200"
        >
          <Plus className="w-5 h-5" />
          办理住院
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitalizations.map((h, index) => (
            <div
              key={h.id}
              onClick={() => navigate(`/hospitalization/${h.id}`)}
              className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-warm-900">{h.petName}</h3>
                    <p className="text-sm text-warm-500">{h.petSpecies === "dog" ? "狗狗" : "猫咪"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(h.status)}`}>
                  {getStatusText(h.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-warm-600">
                  <Bed className="w-4 h-4 text-warm-400" />
                  <span>{h.ward || "未分配病房"}</span>
                </div>
                <div className="flex items-center gap-2 text-warm-600">
                  <Calendar className="w-4 h-4 text-warm-400" />
                  <span>入院：{h.admitDate?.split("T")[0] || h.admitDate?.substring(0, 10)}</span>
                </div>
                <div className="flex items-center gap-2 text-warm-600">
                  <Clock className="w-4 h-4 text-warm-400" />
                  <span>已住院 {calcDaysHospitalized(h.admitDate)} 天</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-warm-100">
                <p className="text-sm text-warm-700 line-clamp-2">{h.diagnosis}</p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-warm-400">
                  主人：{h.ownerName}
                </span>
                <span className="text-xs text-primary-600 font-medium">
                  查看详情 →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && hospitalizations.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Bed className="w-16 h-16 text-warm-200 mx-auto mb-4" />
          <p className="text-warm-500">暂无住院记录</p>
        </div>
      )}
    </div>
  );
}
