import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Stethoscope,
  FileText,
  Pill,
  Thermometer,
  Scale,
  Edit,
  Plus,
} from "lucide-react";
import type { MedicalRecord, Prescription } from "@/types";

export default function MedicalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("record");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [recordRes, prescRes] = await Promise.all([
        fetch(`/api/medical-records/${id}`),
        fetch(`/api/medical-records/${id}/prescription`),
      ]);
      const recordData = await recordRes.json();
      const prescData = await prescRes.json();
      setRecord(recordData.data);
      setPrescription(prescData.data);
    } catch (error) {
      console.error("Failed to load data:", error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

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
            <h2 className="text-xl font-bold text-warm-900">就诊详情</h2>
            <p className="text-sm text-warm-500">
              {record?.petName} · {record?.visitDate?.split("T")[0] || record?.visitDate?.substring(0, 10)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(record?.status || "")}`}>
            {getStatusText(record?.status || "")}
          </span>
          {record?.status !== "completed" && (
            <button
              onClick={() => navigate(`/medical/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              编辑病历
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-warm-100">
          <div>
            <p className="text-warm-500 text-sm mb-1">宠物</p>
            <p className="font-medium text-warm-900">{record?.petName}</p>
            <p className="text-xs text-warm-400 mt-0.5">{record?.petSpecies} · {record?.petBreed}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">主人</p>
            <p className="font-medium text-warm-900">{record?.ownerName}</p>
            <p className="text-xs text-warm-400 mt-0.5">{record?.ownerPhone}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">主治医生</p>
            <p className="font-medium text-warm-900">{record?.doctorName || "未分配"}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-warm-500 text-sm mb-1">
                <Scale className="w-4 h-4 inline mr-1" />
                体重
              </p>
              <p className="font-medium text-warm-900">{record?.weight || "-"} kg</p>
            </div>
            <div>
              <p className="text-warm-500 text-sm mb-1">
                <Thermometer className="w-4 h-4 inline mr-1" />
                体温
              </p>
              <p className="font-medium text-warm-900">{record?.temperature || "-"} °C</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-warm-200">
        {[
          { key: "record", label: "病历详情", icon: FileText },
          { key: "prescription", label: "处方用药", icon: Pill },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-warm-500 hover:text-warm-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "record" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary-500" />
              主诉
            </h3>
            <p className="text-warm-700 whitespace-pre-wrap">
              {record?.chiefComplaint || "暂无记录"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary-500" />
              检查结果
            </h3>
            <p className="text-warm-700 whitespace-pre-wrap">
              {record?.examination || "暂无记录"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-warning-500" />
              诊断
            </h3>
            <p className="text-warm-700 whitespace-pre-wrap">
              {record?.diagnosis || "暂无诊断"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-500" />
              治疗方案
            </h3>
            <p className="text-warm-700 whitespace-pre-wrap">
              {record?.treatment || "暂无记录"}
            </p>
          </div>
        </div>
      )}

      {activeTab === "prescription" && (
        <div className="bg-white rounded-2xl shadow-card">
          {prescription ? (
            <div className="p-6">
              {prescription.notes && (
                <div className="mb-6 pb-6 border-b border-warm-100">
                  <p className="text-warm-500 text-sm mb-2">医师嘱咐</p>
                  <p className="text-warm-700">{prescription.notes}</p>
                </div>
              )}
              <div className="space-y-4">
                {prescription.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 bg-warm-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-warm-900">{item.medicineName}</h4>
                        <span className="text-sm text-warm-500">{item.specification}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-warm-600">
                        <span>用量：{item.dosage}</span>
                        <span>频次：{item.frequency}</span>
                        <span>疗程：{item.durationDays}天</span>
                      </div>
                      {item.instructions && (
                        <p className="text-sm text-warm-500 mt-2">
                          说明：{item.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-warm-100 text-right text-sm text-warm-500">
                开具时间：{prescription.createdAt?.split("T")[0] || prescription.createdAt}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Pill className="w-12 h-12 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-500 mb-4">暂无处方</p>
              {record?.status !== "completed" && (
                <button
                  onClick={() => navigate(`/medical/${id}/prescription/new`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  开具处方
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
