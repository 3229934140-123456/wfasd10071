import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Search, Plus, Pill } from "lucide-react";

export default function MedicalForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const petId = searchParams.get("petId");

  const [formData, setFormData] = useState({
    petId: "",
    chiefComplaint: "",
    examination: "",
    diagnosis: "",
    treatment: "",
    weight: "",
    temperature: "",
  });
  const [searchPet, setSearchPet] = useState("");
  const [petOptions, setPetOptions] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPetSearch, setShowPetSearch] = useState(false);

  useEffect(() => {
    if (petId) {
      loadPetInfo(parseInt(petId));
      setFormData((prev) => ({ ...prev, petId }));
    }
  }, [petId]);

  useEffect(() => {
    if (searchPet.length >= 1) {
      searchPets();
    } else {
      setPetOptions([]);
    }
  }, [searchPet]);

  const loadPetInfo = async (id: number) => {
    try {
      const res = await fetch(`/api/pets/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedPet(data.data);
      }
    } catch (error) {
      console.error("Failed to load pet:", error);
    }
  };

  const searchPets = async () => {
    try {
      const res = await fetch(`/api/pets?search=${encodeURIComponent(searchPet)}`);
      const data = await res.json();
      setPetOptions(data.data || []);
    } catch (error) {
      console.error("Failed to search pets:", error);
    }
  };

  const selectPet = (pet: any) => {
    setSelectedPet(pet);
    setFormData((prev) => ({ ...prev, petId: pet.id.toString() }));
    setSearchPet("");
    setShowPetSearch(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petId) {
      alert("请选择宠物");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: parseInt(formData.petId),
          chiefComplaint: formData.chiefComplaint,
          examination: formData.examination,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          status: "in-progress",
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/medical/${data.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create record:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-warm-600" />
        </button>
        <h2 className="text-xl font-bold text-warm-900">新增就诊记录</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-warm-900 mb-4">选择宠物</h3>
          {selectedPet ? (
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
              <div>
                <p className="font-medium text-warm-900">{selectedPet.name}</p>
                <p className="text-sm text-warm-500">
                  {selectedPet.breed || "未知品种"} · {selectedPet.ownerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPet(null);
                  setFormData((prev) => ({ ...prev, petId: "" }));
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                更换
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                <input
                  type="text"
                  value={searchPet}
                  onChange={(e) => setSearchPet(e.target.value)}
                  onFocus={() => setShowPetSearch(true)}
                  placeholder="搜索宠物名、主人名或电话..."
                  className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              {showPetSearch && petOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-card border border-warm-100 max-h-60 overflow-y-auto z-10">
                  {petOptions.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => selectPet(pet)}
                      className="w-full px-4 py-3 text-left hover:bg-warm-50 flex items-center gap-3 border-b border-warm-50 last:border-0"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 text-lg">🐾</span>
                      </div>
                      <div>
                        <p className="font-medium text-warm-900">{pet.name}</p>
                        <p className="text-sm text-warm-500">{pet.ownerName} · {pet.ownerPhone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-warm-900 mb-4">体格检查</h3>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                体温 (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="请输入体温"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              主诉
            </label>
            <textarea
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              placeholder="请输入宠物的主要症状和就诊原因..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              检查结果
            </label>
            <textarea
              value={formData.examination}
              onChange={(e) => setFormData({ ...formData, examination: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              placeholder="体格检查、实验室检查、影像学检查等结果..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              诊断
            </label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="请输入诊断结论"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              治疗方案
            </label>
            <textarea
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              placeholder="治疗建议、护理注意事项等..."
            />
          </div>
        </div>

        <div className="flex gap-3">
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
                保存病历
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
