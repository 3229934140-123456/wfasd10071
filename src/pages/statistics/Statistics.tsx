import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Pill,
  Activity,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { DiseaseStats, PrescriptionStats, RevisitRateStats } from "@/types";

export default function Statistics() {
  const [diseases, setDiseases] = useState<DiseaseStats[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionStats[]>([]);
  const [revisitRates, setRevisitRates] = useState<RevisitRateStats[]>([]);
  const [monthlyVisits, setMonthlyVisits] = useState<Array<{ month: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [diseaseRes, prescRes, revisitRes, visitsRes] = await Promise.all([
        fetch("/api/statistics/diseases"),
        fetch("/api/statistics/prescriptions"),
        fetch("/api/statistics/revisit-rate"),
        fetch("/api/statistics/monthly-visits"),
      ]);
      const diseaseData = await diseaseRes.json();
      const prescData = await prescRes.json();
      const revisitData = await revisitRes.json();
      const visitsData = await visitsRes.json();
      setDiseases(diseaseData.data || []);
      setPrescriptions(prescData.data || []);
      setRevisitRates(revisitData.data || []);
      setMonthlyVisits(visitsData.data || []);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxDiseaseCount = Math.max(...diseases.map((d) => d.count), 1);
  const maxPrescCount = Math.max(...prescriptions.map((p) => p.count), 1);
  const maxVisitCount = Math.max(...monthlyVisits.map((v) => v.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-warm-500 text-sm">本月就诊</p>
              <p className="text-2xl font-bold text-warm-900">
                {monthlyVisits.length > 0 ? monthlyVisits[monthlyVisits.length - 1].count : 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-warm-500 text-sm">常用药品数</p>
              <p className="text-2xl font-bold text-warm-900">{prescriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-warm-500 text-sm">处方金额</p>
              <p className="text-2xl font-bold text-warm-900">
                ¥{prescriptions.reduce((sum, p) => sum + p.totalAmount, 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-warm-500 text-sm">病种数</p>
              <p className="text-2xl font-bold text-warm-900">{diseases.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-warm-900">月度就诊趋势</h3>
          </div>
          <div className="h-64 flex items-end gap-3">
            {monthlyVisits.map((item, index) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-primary-500"
                  style={{
                    height: `${(item.count / maxVisitCount) * 180}px`,
                    minHeight: "4px",
                  }}
                />
                <p className="text-xs text-warm-500 mt-2">
                  {item.month.split("-")[1]}月
                </p>
                <p className="text-sm font-medium text-warm-700">{item.count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-secondary-500" />
            <h3 className="font-semibold text-warm-900">病种分布</h3>
          </div>
          <div className="space-y-4">
            {diseases.slice(0, 6).map((disease, index) => (
              <div key={disease.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-warm-700">{disease.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-warm-900">
                      {disease.count}例
                    </span>
                    <span className="text-xs text-warm-400">
                      {disease.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-700"
                    style={{ width: `${(disease.count / maxDiseaseCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <Pill className="w-5 h-5 text-warning-500" />
            <h3 className="font-semibold text-warm-900">常用药品排行</h3>
          </div>
          <div className="space-y-3">
            {prescriptions.slice(0, 6).map((item, index) => (
              <div
                key={item.medicineName}
                className="flex items-center gap-4 p-3 bg-warm-50 rounded-xl"
              >
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center text-warning-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-warm-900 truncate">
                    {item.medicineName}
                  </p>
                  <p className="text-xs text-warm-500">{item.count} 次使用</p>
                </div>
                <p className="text-warm-700 font-medium">
                  ¥{item.totalAmount.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-warm-900">复诊率分析</h3>
          </div>
          <div className="space-y-4">
            {revisitRates.slice(0, 6).map((item) => (
              <div key={item.disease} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-warm-700">{item.disease}</span>
                  <span className="text-sm font-medium text-green-600">
                    {item.revisitRate}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-warm-400">
                  <span>总 {item.totalVisits} 次</span>
                  <span>·</span>
                  <span>复诊 {item.revisitCount} 次</span>
                </div>
                <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                    style={{ width: `${Math.min(item.revisitRate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
