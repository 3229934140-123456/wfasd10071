import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useEffect, useState } from "react";

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "首页仪表盘", subtitle: "今日诊所运营概览" },
  "/pets": { title: "宠物档案", subtitle: "管理所有宠物信息" },
  "/medical": { title: "就诊病历", subtitle: "查看和管理就诊记录" },
  "/vaccine": { title: "疫苗管理", subtitle: "疫苗接种记录与提醒" },
  "/hospitalization": { title: "住院护理", subtitle: "住院宠物日常管理" },
  "/pharmacy": { title: "药品库存", subtitle: "药品库存管理" },
  "/statistics": { title: "数据统计", subtitle: "诊所运营数据分析" },
};

export default function AppLayout() {
  const location = useLocation();
  const [pageInfo, setPageInfo] = useState<{ title: string; subtitle?: string }>({ title: "", subtitle: "" });

  useEffect(() => {
    const path = location.pathname;
    let found = pageTitles[path];
    if (!found) {
      for (const key of Object.keys(pageTitles)) {
        if (path.startsWith(key) && key !== "/") {
          found = pageTitles[key];
          break;
        }
      }
    }
    setPageInfo(found || { title: "", subtitle: "" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-warm-50">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
