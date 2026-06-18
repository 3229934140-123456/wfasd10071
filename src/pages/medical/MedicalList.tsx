import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Stethoscope, PawPrint, Calendar, Clock } from "lucide-react";
import type { MedicalRecord } from "@/types";

export default function MedicalList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadRecords();
  }, [statusFilter]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      let url = "/api/medical-records";
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (params.toString()) {
        url += "?" + params.toString();
      }
      const res = await fetch(url);
      const data = await res.json();
      setRecords(data.data || []);
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-primary-100 text-primary-700";
      default:
        return "bg-warm-100 text-warm-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "in-progress":
        return "进行中";
      default:
        return "待接诊";
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      !searchTerm ||
      r.petName?.includes(searchTerm) ||
      r.ownerName?.includes(searchTerm) ||
      r.diagnosis?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索宠物名、主人、诊断..."
              className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
        </div>
        <button
          onClick={() => navigate("/medical/new")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          新增就诊
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-warm-500" />
        {[
          { value: "all", label: "全部" },
          { value: "pending", label: "待接诊" },
          { value: "in-progress", label: "进行中" },
          { value: "completed", label: "已完成" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? "bg-primary-100 text-primary-700"
                : "bg-white text-warm-600 hover:bg-warm-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
        <span className="text-sm text-warm-400 ml-auto">共 {filteredRecords.length} 条记录</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-warm-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">宠物</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">主人</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">就诊时间</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">主治医生</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">诊断</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium text-warm-900">{record.petName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-warm-600">{record.ownerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-warm-600 text-sm">
                        <Calendar className="w-4 h-4 text-warm-400" />
                        {record.visitDate?.split("T")[0] || record.visitDate?.substring(0, 10)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-warm-600">{record.doctorName || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="text-warm-700 line-clamp-1 max-w-xs">
                        {record.diagnosis || "待诊断"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/medical/${record.id}`)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRecords.length === 0 && (
            <div className="text-center py-16">
              <Stethoscope className="w-12 h-12 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-500">暂无就诊记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
