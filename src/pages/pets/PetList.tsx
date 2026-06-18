import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, PawPrint, Filter, Phone, Calendar } from "lucide-react";
import { usePetStore } from "@/store/petStore";
import type { Pet } from "@/types";

export default function PetList() {
  const navigate = useNavigate();
  const { pets, fetchPets, loading } = usePetStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");

  useEffect(() => {
    fetchPets(searchTerm);
  }, [searchTerm]);

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

  const getSpeciesColor = (species: string) => {
    switch (species) {
      case "dog":
        return "bg-amber-100 text-amber-700";
      case "cat":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-warm-100 text-warm-700";
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
    return `${years}岁`;
  };

  const filteredPets = speciesFilter === "all" 
    ? pets 
    : pets.filter((p) => p.species === speciesFilter);

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
              placeholder="搜索宠物名、主人名、电话..."
              className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white text-warm-900"
            />
          </div>
        </div>
        <button
          onClick={() => navigate("/pets/new")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          新增宠物
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-warm-500" />
        {[
          { value: "all", label: "全部" },
          { value: "dog", label: "狗狗" },
          { value: "cat", label: "猫咪" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSpeciesFilter(filter.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              speciesFilter === filter.value
                ? "bg-primary-100 text-primary-700"
                : "bg-white text-warm-600 hover:bg-warm-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
        <span className="text-sm text-warm-400 ml-auto">共 {filteredPets.length} 只宠物</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPets.map((pet: Pet, index: number) => (
            <div
              key={pet.id}
              onClick={() => navigate(`/pets/${pet.id}`)}
              className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <PawPrint className="w-7 h-7 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-warm-900 truncate">{pet.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getSpeciesColor(pet.species)} flex-shrink-0`}>
                      {getSpeciesLabel(pet.species)}
                    </span>
                  </div>
                  <p className="text-sm text-warm-500 truncate mt-0.5">{pet.breed || "未知品种"}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-warm-600">
                  <Phone className="w-4 h-4 text-warm-400" />
                  <span className="truncate">{pet.ownerName} · {pet.ownerPhone}</span>
                </div>
                <div className="flex items-center gap-4 text-warm-500">
                  <span className="flex items-center gap-1">
                    <span className="text-warm-400">年龄：</span>
                    {calculateAge(pet.birthDate)}
                  </span>
                  <span>{pet.weight}kg</span>
                </div>
              </div>

              {pet.lastVisitDate && (
                <div className="mt-4 pt-4 border-t border-warm-100 flex items-center gap-2 text-xs text-warm-400">
                  <Calendar className="w-3.5 h-3.5" />
                  上次就诊：{pet.lastVisitDate?.split("T")[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filteredPets.length === 0 && (
        <div className="text-center py-16">
          <PawPrint className="w-16 h-16 text-warm-200 mx-auto mb-4" />
          <p className="text-warm-500">暂无宠物档案</p>
          <button
            onClick={() => navigate("/pets/new")}
            className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            创建第一只宠物档案
          </button>
        </div>
      )}
    </div>
  );
}
