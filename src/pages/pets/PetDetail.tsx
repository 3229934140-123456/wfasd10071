import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  PawPrint,
  Calendar,
  Scale,
  Syringe,
  Edit,
  Plus,
  FileText,
  Stethoscope,
} from "lucide-react";
import { usePetStore } from "@/store/petStore";
import type { Pet, Vaccination, MedicalRecord } from "@/types";

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPet, vaccinations, medicalRecords, fetchPetById, fetchVaccinations, fetchMedicalRecords, loading } =
    usePetStore();
  const [activeTab, setActiveTab] = useState("records");

  useEffect(() => {
    if (id) {
      fetchPetById(parseInt(id));
      fetchVaccinations(parseInt(id));
      fetchMedicalRecords(parseInt(id));
    }
  }, [id]);

  const getSpeciesLabel = (species: string) => {
    switch (species) {
      case "dog":
        return "狗狗";
      case "cat":
        return "猫咪";
      default:
        return "其他";
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "未知";
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (years === 0) {
      return `${months + 12}个月`;
    }
    if (months < 0) {
      return `${years - 1}岁${months + 12}个月`;
    }
    return `${years}岁${months}个月`;
  };

  const getVaccineStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200";
      case "due":
        return "bg-warning-100 text-warning-700 border-warning-200";
      case "upcoming":
        return "bg-primary-100 text-primary-700 border-primary-200";
      default:
        return "bg-warm-100 text-warm-600 border-warm-200";
    }
  };

  const getVaccineStatusText = (status: string) => {
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

  if (loading && !currentPet) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const pet = currentPet as Pet;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-warm-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-warm-900">宠物详情</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <PawPrint className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{pet?.name}</h1>
                <p className="text-white/80 text-sm mt-1">
                  {getSpeciesLabel(pet?.species || "")} · {pet?.breed || "未知品种"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/pets/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              编辑
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-warm-500 text-sm mb-1">性别</p>
            <p className="font-medium text-warm-900">
              {pet?.gender === "male" ? "公" : "母"}
            </p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">年龄</p>
            <p className="font-medium text-warm-900">{calculateAge(pet?.birthDate || "")}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">体重</p>
            <p className="font-medium text-warm-900">{pet?.weight} kg</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">绝育状态</p>
            <p className="font-medium text-warm-900">{pet?.neutered ? "已绝育" : "未绝育"}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">主人姓名</p>
            <p className="font-medium text-warm-900">{pet?.ownerName}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">联系电话</p>
            <p className="font-medium text-warm-900">{pet?.ownerPhone}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">出生日期</p>
            <p className="font-medium text-warm-900">{pet?.birthDate || "未知"}</p>
          </div>
          <div>
            <p className="text-warm-500 text-sm mb-1">建档时间</p>
            <p className="font-medium text-warm-900">{pet?.createdAt?.split("T")[0]}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-warm-200">
        {[
          { key: "records", label: "就诊记录", icon: FileText },
          { key: "vaccine", label: "疫苗接种", icon: Syringe },
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

      {activeTab === "records" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-warm-500 text-sm">共 {medicalRecords.length} 条就诊记录</p>
            <button
              onClick={() => navigate(`/medical/new?petId=${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增就诊
            </button>
          </div>

          {medicalRecords.length > 0 ? (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-warm-200" />
              <div className="space-y-4">
                {medicalRecords.map((record: MedicalRecord, index: number) => (
                  <Link
                    key={record.id}
                    to={`/medical/${record.id}`}
                    className="relative pl-14 block group"
                  >
                    <div className="absolute left-4 w-5 h-5 bg-white border-4 border-primary-500 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-primary-500" />
                            <span className="font-medium text-warm-900">
                              {record.diagnosis || "待诊断"}
                            </span>
                          </div>
                          <p className="text-sm text-warm-500 mt-1">
                            {record.visitDate?.split("T")[0]} · {record.doctorName || "未分配医生"}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            record.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : record.status === "in-progress"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-warm-100 text-warm-600"
                          }`}
                        >
                          {record.status === "completed"
                            ? "已完成"
                            : record.status === "in-progress"
                            ? "进行中"
                            : "待接诊"}
                        </span>
                      </div>
                      {record.chiefComplaint && (
                        <p className="text-sm text-warm-600 line-clamp-2">
                          主诉：{record.chiefComplaint}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <FileText className="w-12 h-12 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-500">暂无就诊记录</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "vaccine" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-warm-500 text-sm">共 {vaccinations.length} 条疫苗记录</p>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              登记接种
            </button>
          </div>

          {vaccinations.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-warm-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-warm-600">疫苗名称</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-warm-600">接种日期</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-warm-600">下次到期</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-warm-600">状态</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-warm-600">生产厂家</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {vaccinations.map((v: Vaccination) => (
                    <tr key={v.id} className="hover:bg-warm-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-warm-900">{v.vaccineName}</span>
                      </td>
                      <td className="px-6 py-4 text-warm-600 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-warm-400" />
                          {v.vaccinationDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-warm-600 text-sm">
                        {v.nextDueDate || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${getVaccineStatusColor(v.status)}`}>
                          {getVaccineStatusText(v.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-warm-500 text-sm">
                        {v.manufacturer || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Syringe className="w-12 h-12 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-500">暂无疫苗接种记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
