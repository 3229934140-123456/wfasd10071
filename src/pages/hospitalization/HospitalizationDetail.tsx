import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bed,
  Thermometer,
  Smile,
  Frown,
  Meh,
  Utensils,
  Plus,
  Send,
  Clock,
  Calendar,
} from "lucide-react";
import type { Hospitalization, DailyRecord } from "@/types";

export default function HospitalizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hospitalization, setHospitalization] = useState<Hospitalization | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    appetite: "normal",
    spirit: "normal",
    temperature: "38.5",
    notes: "",
    notifyOwner: false,
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/hospitalizations/${id}`);
      const data = await res.json();
      setHospitalization(data.data);
    } catch (error) {
      console.error("Failed to load hospitalization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/hospitalizations/${id}/daily-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appetite: newRecord.appetite,
          spirit: newRecord.spirit,
          temperature: parseFloat(newRecord.temperature),
          notes: newRecord.notes,
          notifiedOwner: newRecord.notifyOwner,
          recordDate: new Date().toISOString().split("T")[0],
          recordTime: new Date().toTimeString().substring(0, 5),
        }),
      });
      if (res.ok) {
        setShowAddRecord(false);
        setNewRecord({
          appetite: "normal",
          spirit: "normal",
          temperature: "38.5",
          notes: "",
          notifyOwner: false,
        });
        loadData();
      }
    } catch (error) {
      console.error("Failed to add record:", error);
    }
  };

  const getAppetiteIcon = (appetite: string) => {
    switch (appetite) {
      case "good":
        return <Utensils className="w-5 h-5 text-green-500" />;
      case "normal":
        return <Utensils className="w-5 h-5 text-primary-500" />;
      case "poor":
        return <Utensils className="w-5 h-5 text-warning-500" />;
      default:
        return <Utensils className="w-5 h-5 text-red-500" />;
    }
  };

  const getAppetiteText = (appetite: string) => {
    switch (appetite) {
      case "good":
        return "好";
      case "normal":
        return "一般";
      case "poor":
        return "差";
      default:
        return "无食欲";
    }
  };

  const getSpiritIcon = (spirit: string) => {
    switch (spirit) {
      case "good":
        return <Smile className="w-5 h-5 text-green-500" />;
      case "normal":
        return <Meh className="w-5 h-5 text-primary-500" />;
      default:
        return <Frown className="w-5 h-5 text-warning-500" />;
    }
  };

  const getSpiritText = (spirit: string) => {
    switch (spirit) {
      case "good":
        return "良好";
      case "normal":
        return "一般";
      default:
        return "萎靡";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const dailyRecords = hospitalization?.dailyRecords || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-warm-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-warm-900">住院详情</h2>
            <p className="text-sm text-warm-500">{hospitalization?.petName}</p>
          </div>
        </div>
        {hospitalization?.status === "admitted" && (
          <button
            onClick={() => setShowAddRecord(!showAddRecord)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            <Plus className="w-5 h-5" />
            记录状态
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-warm-500 text-sm mb-1">病房</p>
            <p className="font-medium text-warm-900">{hospitalization?.ward || "未分配"}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">入院时间</p>
            <p className="font-medium text-warm-900">
              {hospitalization?.admitDate?.split("T")[0] || hospitalization?.admitDate?.substring(0, 10)}
            </p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">主人</p>
            <p className="font-medium text-warm-900">{hospitalization?.ownerName}</p>
            <p className="text-xs text-warm-400">{hospitalization?.ownerPhone}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">状态</p>
            <span className={`inline-block text-sm px-3 py-1 rounded-full ${
              hospitalization?.status === "admitted"
                ? "bg-primary-100 text-primary-700"
                : "bg-warm-100 text-warm-600"
            }`}>
              {hospitalization?.status === "admitted" ? "住院中" : "已出院"}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-warm-100">
          <p className="text-warm-500 text-sm mb-1">诊断</p>
          <p className="text-warm-700">{hospitalization?.diagnosis}</p>
        </div>
      </div>

      {showAddRecord && (
        <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up">
          <h3 className="font-semibold text-warm-900 mb-4">添加日常记录</h3>
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  饮食情况
                </label>
                <select
                  value={newRecord.appetite}
                  onChange={(e) => setNewRecord({ ...newRecord, appetite: e.target.value })}
                  className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="good">好</option>
                  <option value="normal">一般</option>
                  <option value="poor">差</option>
                  <option value="none">无食欲</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  精神状态
                </label>
                <select
                  value={newRecord.spirit}
                  onChange={(e) => setNewRecord({ ...newRecord, spirit: e.target.value })}
                  className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="good">良好</option>
                  <option value="normal">一般</option>
                  <option value="depressed">萎靡</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                体温 (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={newRecord.temperature}
                onChange={(e) => setNewRecord({ ...newRecord, temperature: e.target.value })}
                className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                备注
              </label>
              <textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                placeholder="其他情况说明..."
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifyOwner"
                checked={newRecord.notifyOwner}
                onChange={(e) => setNewRecord({ ...newRecord, notifyOwner: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="notifyOwner" className="text-sm text-warm-700">
                通知宠物主人
              </label>
              <Send className="w-4 h-4 text-primary-500" />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddRecord(false)}
                className="flex-1 px-4 py-2.5 border border-warm-200 text-warm-700 rounded-xl font-medium hover:bg-warm-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                保存记录
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-warm-900 mb-4">日常护理记录</h3>
        {dailyRecords.length > 0 ? (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-warm-200" />
            <div className="space-y-4">
              {dailyRecords.map((record: DailyRecord, index: number) => (
                <div key={record.id} className="relative pl-14">
                  <div className="absolute left-4 w-5 h-5 bg-white border-4 border-secondary-500 rounded-full" />
                  <div className="bg-white rounded-xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-warm-400" />
                        <span className="font-medium text-warm-900">{record.recordDate}</span>
                        {record.recordTime && (
                          <>
                            <Clock className="w-4 h-4 text-warm-400 ml-2" />
                            <span className="text-warm-500 text-sm">{record.recordTime}</span>
                          </>
                        )}
                      </div>
                      {record.notifiedOwner && (
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          已通知主人
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        {getAppetiteIcon(record.appetite)}
                        <span className="text-sm text-warm-600">饮食：{getAppetiteText(record.appetite)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSpiritIcon(record.spirit)}
                        <span className="text-sm text-warm-600">精神：{getSpiritText(record.spirit)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-warm-600">体温：{record.temperature}°C</span>
                      </div>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-warm-500 bg-warm-50 rounded-lg p-3">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Bed className="w-12 h-12 text-warm-200 mx-auto mb-3" />
            <p className="text-warm-500">暂无护理记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
