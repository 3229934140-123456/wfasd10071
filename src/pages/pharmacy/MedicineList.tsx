import { useEffect, useState } from "react";
import { Package, Search, Plus, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import type { Medicine } from "@/types";

export default function MedicineList() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [stockInQty, setStockInQty] = useState("");

  useEffect(() => {
    loadMedicines();
  }, [showLowStockOnly]);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const url = showLowStockOnly ? "/api/medicines/low-stock" : "/api/medicines";
      const res = await fetch(url);
      const data = await res.json();
      setMedicines(data.data || []);
    } catch (error) {
      console.error("Failed to load medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      !searchTerm ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockIn = async () => {
    if (!selectedMedicine || !stockInQty) return;

    try {
      const res = await fetch(`/api/medicines/${selectedMedicine.id}/stock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: parseInt(stockInQty) }),
      });
      if (res.ok) {
        setShowStockInModal(false);
        setStockInQty("");
        setSelectedMedicine(null);
        loadMedicines();
      }
    } catch (error) {
      console.error("Failed to stock in:", error);
    }
  };

  const lowStockCount = medicines.filter((m) => m.stockQuantity <= m.warningThreshold).length;

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
              placeholder="搜索药品名称、厂家..."
              className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              showLowStockOnly
                ? "bg-warning-100 text-warning-700"
                : "bg-white text-warm-600 hover:bg-warm-50"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            库存预警 ({lowStockCount})
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            <Plus className="w-5 h-5" />
            新增药品
          </button>
        </div>
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
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">药品名称</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">规格</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">分类</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">库存</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">预警值</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">单价</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-warm-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredMedicines.map((medicine) => {
                  const isLowStock = medicine.stockQuantity <= medicine.warningThreshold;
                  return (
                    <tr key={medicine.id} className="hover:bg-warm-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isLowStock ? "bg-warning-100" : "bg-primary-100"
                          }`}>
                            <Package className={`w-5 h-5 ${isLowStock ? "text-warning-600" : "text-primary-600"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-warm-900">{medicine.name}</p>
                            <p className="text-xs text-warm-400">{medicine.manufacturer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-warm-600 text-sm">{medicine.specification}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 bg-warm-100 text-warm-600 rounded-full">
                          {medicine.category || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${isLowStock ? "text-warning-600" : "text-warm-900"}`}>
                          {medicine.stockQuantity} {medicine.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-warm-500 text-sm">
                        {medicine.warningThreshold} {medicine.unit}
                      </td>
                      <td className="px-6 py-4 text-warm-700 font-medium">
                        ¥{medicine.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-warning-100 text-warning-700">
                            <AlertTriangle className="w-3 h-3" />
                            库存不足
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                            <TrendingUp className="w-3 h-3" />
                            充足
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setShowStockInModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          入库
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredMedicines.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-500">暂无药品</p>
            </div>
          )}
        </div>
      )}

      {showStockInModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-semibold text-warm-900 mb-4">药品入库</h3>
            <p className="text-warm-600 mb-4">
              药品：<span className="font-medium text-warm-900">{selectedMedicine.name}</span>
            </p>
            <p className="text-sm text-warm-500 mb-4">
              当前库存：{selectedMedicine.stockQuantity} {selectedMedicine.unit}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-warm-700 mb-2">
                入库数量
              </label>
              <input
                type="number"
                value={stockInQty}
                onChange={(e) => setStockInQty(e.target.value)}
                className="w-full px-4 py-2.5 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="请输入入库数量"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStockInModal(false);
                  setSelectedMedicine(null);
                  setStockInQty("");
                }}
                className="flex-1 px-4 py-2.5 border border-warm-200 text-warm-700 rounded-xl font-medium hover:bg-warm-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleStockIn}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                确认入库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
