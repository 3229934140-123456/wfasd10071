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
  Bell,
  BellOff,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { Hospitalization, DailyRecord } from "@/types";

interface OwnerFeed {
  petName: string;
  petSpecies: string;
  petBreed: string;
  ownerName: string;
  ward: string;
  diagnosis: string;
  status: string;
  records: DailyRecord[];
}

export default function HospitalizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hospitalization, setHospitalization] = useState<Hospitalization | null>(null);
  const [ownerFeed, setOwnerFeed] = useState<OwnerFeed | null>(null);
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"care" | "feed">("care");
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    appetite: "normal",
    spirit: "normal",
    temperature: "38.5",
    notes: "",
    notifyOwner: true,
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadOwnerFeed();
    }
  }, [id, feedFilter]);

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

  const loadOwnerFeed = async () => {
    try {
      const params = feedFilter !== "all" ? `?filter=${feedFilter}` : "";
      const res = await fetch(`/api/hospitalizations/${id}/owner-feed${params}`);
      const data = await res.json();
      setOwnerFeed(data.data);
    } catch (error) {
      console.error("Failed to load owner feed:", error);
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
          notifyOwner: true,
        });
        loadData();
        loadOwnerFeed();
      }
    } catch (error) {
      console.error("Failed to add record:", error);
    }
  };

  const toggleNotify = async (recordId: number, currentNotified: boolean) => {
    try {
      await fetch(`/api/hospitalizations/daily-records/${recordId}/notify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notified: !currentNotified }),
      });
      loadData();
      loadOwnerFeed();
    } catch (error) {
      console.error("Failed to toggle notify:", error);
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
  const feedRecords = ownerFeed?.records || [];
  const notifiedCount = dailyRecords.filter((r) => r.notifiedOwner).length;
  const unnotifiedCount = dailyRecords.length - notifiedCount;

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

      <div className="flex gap-2 border-b border-warm-200">
        {[
          { key: "care", label: "护理记录", icon: Bed },
          { key: "feed", label: "主人动态", icon: Bell },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as "care" | "feed")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === tab.key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-warm-500 hover:text-warm-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.key === "feed" && unnotifiedCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 bg-warning-500 text-white rounded-full">
                {unnotifiedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {showAddRecord && activeSection === "care" && (
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
            <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-3">
              <input
                type="checkbox"
                id="notifyOwner"
                checked={newRecord.notifyOwner}
                onChange={(e) => setNewRecord({ ...newRecord, notifyOwner: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="notifyOwner" className="text-sm text-warm-700 flex-1 cursor-pointer">
                推送给宠物主人（保存后主人端可查看此条状态更新）
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

      {activeSection === "care" && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-warm-500">共 {dailyRecords.length} 条护理记录</span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
              <Send className="w-3 h-3" /> 已通知 {notifiedCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-warm-100 text-warm-600 rounded-full">
              <BellOff className="w-3 h-3" /> 未通知 {unnotifiedCount}
            </span>
          </div>
          {dailyRecords.length > 0 ? (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-warm-200" />
              <div className="space-y-4">
                {dailyRecords.map((record: DailyRecord, index: number) => (
                  <div key={record.id} className="relative pl-14">
                    <div className={`absolute left-4 w-5 h-5 bg-white border-4 rounded-full ${
                      record.notifiedOwner ? "border-primary-500" : "border-warm-300"
                    }`} />
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
                        <button
                          onClick={() => toggleNotify(record.id, record.notifiedOwner)}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${
                            record.notifiedOwner
                              ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
                              : "bg-warm-100 text-warm-500 hover:bg-warm-200"
                          }`}
                        >
                          {record.notifiedOwner ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              已通知主人
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5" />
                              点击通知主人
                            </>
                          )}
                        </button>
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
      )}

      {activeSection === "feed" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-warm-900">主人可查看的动态</h3>
              </div>
              <div className="flex items-center gap-2 bg-warm-50 rounded-lg p-1">
                {[
                  { key: "all", label: "全部" },
                  { key: "notified", label: "已通知" },
                  { key: "unnotified", label: "未通知" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFeedFilter(f.key)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      feedFilter === f.key
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-warm-500 hover:text-warm-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-primary-50/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-warm-600">
                这是宠物主人在客户端能看到的动态列表。保存护理记录时勾选"推送给宠物主人"后，对应记录会出现在这里。
                未通知的记录主人端不可见，可点击护理记录中的按钮一键切换通知状态。
              </p>
            </div>

            {feedRecords.length > 0 ? (
              <div className="space-y-3">
                {feedRecords.map((record: DailyRecord) => (
                  <div
                    key={record.id}
                    className={`rounded-xl p-4 border ${
                      record.notifiedOwner
                        ? "border-primary-100 bg-primary-50/30"
                        : "border-warm-100 bg-warm-50/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-warm-400" />
                        <span className="font-medium text-warm-900">{record.recordDate}</span>
                        {record.recordTime && (
                          <span className="text-warm-500 text-sm">{record.recordTime}</span>
                        )}
                      </div>
                      {record.notifiedOwner ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                          <Send className="w-3 h-3" />
                          主人已可见
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-warm-100 text-warm-500 rounded-full">
                          <BellOff className="w-3 h-3" />
                          主人不可见
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-2">
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
                      <p className="text-sm text-warm-500 bg-white/60 rounded-lg p-2 mt-2">
                        {record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 text-warm-200 mx-auto mb-2" />
                <p className="text-warm-500 text-sm">
                  {feedFilter === "notified" ? "暂无已通知记录" : feedFilter === "unnotified" ? "暂无未通知记录" : "暂无动态"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
