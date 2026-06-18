import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, PawPrint, Plus, Trash2, Syringe, Bug } from "lucide-react";
import { usePetStore } from "@/store/petStore";
import { useEffect } from "react";

interface VacRecordInput {
  type: "vaccine" | "deworming";
  vaccineName: string;
  vaccinationDate: string;
  nextDueDate: string;
  manufacturer: string;
}

export default function PetForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { createPet, updatePet, currentPet, fetchPetById } = usePetStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    ownerName: "",
    ownerPhone: "",
    name: "",
    species: "dog",
    breed: "",
    gender: "male",
    birthDate: "",
    weight: "",
    neutered: false,
  });
  const [vacRecords, setVacRecords] = useState<VacRecordInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      fetchPetById(parseInt(id));
    }
  }, [isEdit, id]);

  useEffect(() => {
    if (isEdit && currentPet) {
      setFormData({
        ownerName: currentPet.ownerName || "",
        ownerPhone: currentPet.ownerPhone || "",
        name: currentPet.name,
        species: currentPet.species,
        breed: currentPet.breed || "",
        gender: currentPet.gender,
        birthDate: currentPet.birthDate || "",
        weight: currentPet.weight?.toString() || "",
        neutered: currentPet.neutered,
      });
    }
  }, [isEdit, currentPet]);

  const addVacRecord = (type: "vaccine" | "deworming") => {
    setVacRecords([
      ...vacRecords,
      { type, vaccineName: "", vaccinationDate: "", nextDueDate: "", manufacturer: "" },
    ]);
  };

  const updateVacRecord = (index: number, field: keyof VacRecordInput, value: string) => {
    const updated = [...vacRecords];
    updated[index] = { ...updated[index], [field]: value };
    setVacRecords(updated);
  };

  const removeVacRecord = (index: number) => {
    setVacRecords(vacRecords.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEdit && id) {
        await updatePet(parseInt(id), {
          name: formData.name,
          species: formData.species as "dog" | "cat" | "other",
          breed: formData.breed,
          gender: formData.gender as "male" | "female",
          birthDate: formData.birthDate,
          weight: parseFloat(formData.weight),
          neutered: formData.neutered,
        });
        navigate(`/pets/${id}`);
      } else {
        const validVacRecords = vacRecords.filter(
          (v) => v.vaccineName && v.vaccinationDate
        );
        const pet = await createPet({
          ...formData,
          species: formData.species as "dog" | "cat" | "other",
          gender: formData.gender as "male" | "female",
          weight: parseFloat(formData.weight) || 0,
          vaccinations: validVacRecords,
        });
        navigate(`/pets/${pet.id}`);
      }
    } catch (err: any) {
      setError(err.message || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-warm-600" />
        </button>
        <h2 className="text-xl font-bold text-warm-900">
          {isEdit ? "编辑宠物档案" : "新增宠物档案"}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <PawPrint className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-warm-900 mb-4 pb-2 border-b border-warm-100">
              主人信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  主人姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="请输入主人姓名"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="请输入联系电话"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-warm-900 mb-4 pb-2 border-b border-warm-100">
              宠物信息
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    宠物名字 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="请输入宠物名字"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    物种
                  </label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                  >
                    <option value="dog">狗狗</option>
                    <option value="cat">猫咪</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    品种
                  </label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="如：金毛、英短"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    性别
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                  >
                    <option value="male">公</option>
                    <option value="female">母</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    出生日期
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="请输入体重"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="neutered"
                  checked={formData.neutered}
                  onChange={(e) => setFormData({ ...formData, neutered: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="neutered" className="text-sm text-warm-700">
                  是否已绝育
                </label>
              </div>
            </div>
          </div>

          {!isEdit && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-warm-100">
                <h3 className="text-sm font-semibold text-warm-900">
                  疫苗/驱虫史 <span className="text-warm-400 font-normal">（可选，建档时一并录入）</span>
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addVacRecord("vaccine")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <Syringe className="w-3.5 h-3.5" />
                    疫苗
                  </button>
                  <button
                    type="button"
                    onClick={() => addVacRecord("deworming")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-lg text-xs font-medium hover:bg-secondary-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <Bug className="w-3.5 h-3.5" />
                    驱虫
                  </button>
                </div>
              </div>

              {vacRecords.length === 0 ? (
                <p className="text-sm text-warm-400 text-center py-6 bg-warm-50 rounded-xl">
                  暂未录入疫苗/驱虫记录，可点击上方按钮添加
                </p>
              ) : (
                <div className="space-y-3">
                  {vacRecords.map((record, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        record.type === "vaccine"
                          ? "border-primary-100 bg-primary-50/30"
                          : "border-secondary-100 bg-secondary-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                          record.type === "vaccine"
                            ? "bg-primary-100 text-primary-700"
                            : "bg-secondary-100 text-secondary-700"
                        }`}>
                          {record.type === "vaccine" ? <Syringe className="w-3 h-3" /> : <Bug className="w-3 h-3" />}
                          {record.type === "vaccine" ? "疫苗" : "驱虫"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVacRecord(index)}
                          className="text-warm-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs text-warm-500 mb-1">
                            {record.type === "vaccine" ? "疫苗名称" : "驱虫药名称"} *
                          </label>
                          <input
                            type="text"
                            value={record.vaccineName}
                            onChange={(e) => updateVacRecord(index, "vaccineName", e.target.value)}
                            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            placeholder={record.type === "vaccine" ? "如：犬四联疫苗" : "如：大宠爱"}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-warm-500 mb-1">接种/驱虫日期 *</label>
                          <input
                            type="date"
                            value={record.vaccinationDate}
                            onChange={(e) => updateVacRecord(index, "vaccinationDate", e.target.value)}
                            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-warm-500 mb-1">下次到期日</label>
                          <input
                            type="date"
                            value={record.nextDueDate}
                            onChange={(e) => updateVacRecord(index, "nextDueDate", e.target.value)}
                            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-warm-500 mb-1">生产厂家</label>
                          <input
                            type="text"
                            value={record.manufacturer}
                            onChange={(e) => updateVacRecord(index, "manufacturer", e.target.value)}
                            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            placeholder="如：辉瑞、硕腾"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-warm-200 text-warm-700 rounded-xl font-medium hover:bg-warm-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? "保存修改" : "创建档案"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
