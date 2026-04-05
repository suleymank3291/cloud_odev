"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Home, CheckSquare, PlusCircle, BarChart3, Tag,
  ChevronDown, ChevronsRight, Moon, Sun, TrendingUp,
  Activity, AlertCircle, Bell, User, RefreshCw, Trash2,
  Edit3, Search, Filter, X, Check,
} from "lucide-react";
import { getTasks, getStats, createTask, updateTask, deleteTask, type Task, type Stats, type Category, type Priority, type Status } from "@/lib/api";

// ─── Renk haritaları ──────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  "iş":      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "kişisel": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "okul":    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  "sağlık":  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};
const PRIORITY_COLORS: Record<string, string> = {
  "kritik": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "yüksek": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "orta":   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  "düşük":  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};
const STATUS_COLORS: Record<string, string> = {
  "yapılacak":    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  "devam-ediyor": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "tamamlandı":   "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};
const CATEGORY_BAR: Record<string, string> = {
  "iş": "bg-blue-500", "kişisel": "bg-purple-500",
  "okul": "bg-yellow-500", "sağlık": "bg-green-500",
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`} />
);

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ label, colorClass }: { label: string; colorClass: string }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colorClass}`}>{label}</span>
);

// ─── Root Export ─────────────────────────────────────────────────────────────
export const Example = () => {
  const [isDark, setIsDark] = useState(false);
  const [page, setPage]   = useState("Dashboard");

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? "dark" : ""}`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Sidebar selected={page} setSelected={setPage} />
        <div className="flex-1 overflow-auto">
          <Header isDark={isDark} setIsDark={setIsDark} page={page} />
          <div className="p-6">
            {page === "Dashboard"     && <DashboardPage />}
            {page === "Görevlerim"    && <TaskListPage />}
            {page === "Yeni Görev"    && <NewTaskPage onSuccess={() => setPage("Görevlerim")} />}
            {page === "İstatistikler" && <StatsPage />}
            {page === "Kategoriler"   && <CategoriesPage />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ selected, setSelected }: { selected: string; setSelected: (s: string) => void }) => {
  const [open, setOpen] = useState(true);
  const items = [
    { icon: Home, label: "Dashboard" },
    { icon: CheckSquare, label: "Görevlerim", notif: 0 },
    { icon: PlusCircle, label: "Yeni Görev" },
    { icon: BarChart3, label: "İstatistikler" },
    { icon: Tag, label: "Kategoriler" },
  ];
  return (
    <nav className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ${open ? "w-64" : "w-16"}
      border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm flex flex-col`}>
      {/* Logo */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            {open && <div>
              <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">TaskFlow</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">Görev Yöneticisi</span>
            </div>}
          </div>
          {open && <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>
      {/* Nav items */}
      <div className="space-y-1 flex-1">
        {items.map(({ icon: Icon, label }) => {
          const isSelected = selected === label;
          return (
            <button key={label} onClick={() => setSelected(label)}
              className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
                isSelected
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              }`}>
              <div className="grid h-full w-12 place-content-center"><Icon className="h-4 w-4" /></div>
              {open && <span className="text-sm font-medium">{label}</span>}
            </button>
          );
        })}
      </div>
      {/* Toggle */}
      <button onClick={() => setOpen(!open)}
        className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 mt-2">
        <div className="flex items-center p-3">
          <div className="grid size-10 place-content-center">
            <ChevronsRight className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </div>
          {open && <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Gizle</span>}
        </div>
      </button>
    </nav>
  );
};

// ─── Header ──────────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  Dashboard: "Dashboard", Görevlerim: "Görevlerim", "Yeni Görev": "Yeni Görev",
  İstatistikler: "İstatistikler", Kategoriler: "Kategoriler",
};
const Header = ({ isDark, setIsDark, page }: { isDark: boolean; setIsDark: (v: boolean) => void; page: string }) => (
  <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{PAGE_TITLES[page]}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Görevlerine genel bakış</p>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={() => setIsDark(!isDark)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [s, t] = await Promise.all([getStats(), getTasks()]);
      setStats(s);
      setTasks([...t].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total    = stats?.total ?? 0;
  const completed = stats?.byStatus?.["tamamlandı"] ?? 0;
  const ongoing   = stats?.byStatus?.["devam-ediyor"] ?? 0;
  const critical  = stats?.criticalCount ?? 0;

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* Yenile */}
      <div className="flex justify-end">
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
        </button>
      </div>

      {/* Stat Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? Array.from({length:4}).map((_,i) => <SkeletonCard key={i} />) : <>
          <StatCard icon={<CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400"/>} iconBg="bg-blue-50 dark:bg-blue-900/20" label="Toplam Görev" value={String(total)} sub={`%${stats?.completionRate ?? "0"} tamamlandı`} subColor="text-blue-600 dark:text-blue-400" trend={<TrendingUp className="h-4 w-4 text-blue-400"/>}/>
          <StatCard icon={<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400"/>} iconBg="bg-green-50 dark:bg-green-900/20" label="Tamamlanan" value={String(completed)} sub={total>0?`${Math.round((completed/total)*100)}% oran`:"—"} subColor="text-green-600 dark:text-green-400" trend={<TrendingUp className="h-4 w-4 text-green-400"/>}/>
          <StatCard icon={<Activity className="h-5 w-5 text-orange-600 dark:text-orange-400"/>} iconBg="bg-orange-50 dark:bg-orange-900/20" label="Devam Eden" value={String(ongoing)} sub={`${stats?.deadlineThisWeek??0} bu hafta deadline`} subColor="text-orange-600 dark:text-orange-400" trend={<Activity className="h-4 w-4 text-orange-400"/>}/>
          <StatCard icon={<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400"/>} iconBg="bg-red-50 dark:bg-red-900/20" label="Kritik Öncelikli" value={String(critical)} sub="Acil ilgi gerekiyor" subColor="text-red-600 dark:text-red-400" trend={<AlertCircle className="h-4 w-4 text-red-400"/>}/>
        </>}
      </div>

      {/* Alt Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Son Eklenen Görevler</h3>
          {loading ? <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="flex gap-3"><Skeleton className="h-4 flex-1"/><Skeleton className="h-5 w-14 rounded-full"/><Skeleton className="h-5 w-14 rounded-full"/></div>)}</div>
          : tasks.length===0 ? <p className="text-sm text-gray-500 text-center py-6">Henüz görev yok.</p>
          : <div className="space-y-2">{tasks.map(t=><TaskRow key={t.id} task={t}/>)}</div>}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Kategoriye Göre Dağılım</h3>
            {loading ? <div className="space-y-4">{Array.from({length:4}).map((_,i)=><div key={i}><div className="flex justify-between mb-1"><Skeleton className="h-4 w-16"/><Skeleton className="h-4 w-12"/></div><Skeleton className="h-2 w-full rounded-full"/></div>)}</div>
            : (["iş","kişisel","okul","sağlık"] as const).map(cat=>{
              const count = stats?.byCategory?.[cat]??0;
              const pct = total>0?Math.round((count/total)*100):0;
              return <div key={cat} className="mb-3"><div className="flex justify-between mb-1"><span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{cat.charAt(0).toUpperCase()+cat.slice(1)}</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span></div><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className={`${CATEGORY_BAR[cat]} h-2 rounded-full transition-all duration-500`} style={{width:`${pct}%`}}/></div></div>;
            })}
          </div>
          <UpcomingDeadlinesCard />
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: GÖREVLERİM
// ══════════════════════════════════════════════════════════════════════════════
const TaskListPage = () => {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string|null>(null);
  const [search,  setSearch]  = useState("");
  const [filterCat,  setFilterCat]  = useState<string>("");
  const [filterPri,  setFilterPri]  = useState<string>("");
  const [filterStat, setFilterStat] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setTasks(await getTasks()); }
    catch (e) { setError(e instanceof Error ? e.message : "Hata"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat  && t.category !== filterCat)  return false;
    if (filterPri  && t.priority !== filterPri)  return false;
    if (filterStat && t.status   !== filterStat) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    load();
  };

  const handleToggleStatus = async (task: Task) => {
    const next: Status = task.status === "yapılacak" ? "devam-ediyor"
      : task.status === "devam-ediyor" ? "tamamlandı" : "yapılacak";
    await updateTask(task.id, { status: next });
    load();
  };

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ara..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"/>
        </div>
        <SelectFilter value={filterCat} onChange={setFilterCat} placeholder="Tüm kategoriler" options={["iş","kişisel","okul","sağlık"]}/>
        <SelectFilter value={filterPri} onChange={setFilterPri} placeholder="Tüm öncelikler" options={["düşük","orta","yüksek","kritik"]}/>
        <SelectFilter value={filterStat} onChange={setFilterStat} placeholder="Tüm durumlar" options={["yapılacak","devam-ediyor","tamamlandı"]}/>
        {(search||filterCat||filterPri||filterStat) && (
          <button onClick={()=>{setSearch("");setFilterCat("");setFilterPri("");setFilterStat("");}}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
            <X className="h-4 w-4"/>Temizle
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">{filtered.length} görev</span>
      </div>

      {/* Liste */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({length:6}).map((_,i)=><div key={i} className="flex gap-3 items-center"><Skeleton className="h-5 flex-1"/><Skeleton className="h-5 w-16 rounded-full"/><Skeleton className="h-5 w-16 rounded-full"/><Skeleton className="h-8 w-8 rounded"/></div>)}</div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">Görev bulunamadı.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Görev</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Öncelik</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3 text-left">Deadline</th>
                <th className="px-4 py-3 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{task.title}</div>
                    {task.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{task.description}</div>}
                  </td>
                  <td className="px-4 py-3"><Badge label={task.category} colorClass={CATEGORY_COLORS[task.category]??""}/></td>
                  <td className="px-4 py-3"><Badge label={task.priority} colorClass={PRIORITY_COLORS[task.priority]??""}/></td>
                  <td className="px-4 py-3">
                    <button onClick={()=>handleToggleStatus(task)} title="Durumu ilerlet"
                      className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 ${STATUS_COLORS[task.status]??""}`}>
                      {task.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString("tr-TR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={()=>handleDelete(task.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="h-4 w-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: YENİ GÖREV
// ══════════════════════════════════════════════════════════════════════════════
const NewTaskPage = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState({
    title: "", description: "", category: "iş" as Category,
    priority: "orta" as Priority, status: "yapılacak" as Status,
    tags: "", deadline: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setErrors(["'Başlık' alanı zorunludur."]); return; }
    setSaving(true); setErrors([]);
    try {
      await createTask({
        title: form.title.trim(),
        description: form.description || undefined,
        category: form.category,
        priority: form.priority,
        status: form.status,
        tags: form.tags ? form.tags.split(",").map(t=>t.trim()).filter(Boolean) : [],
        deadline: form.deadline || undefined,
      });
      setSuccess(true);
      setTimeout(() => onSuccess(), 1200);
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Bir hata oluştu."]);
    } finally { setSaving(false); }
  };

  const inputClass = "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Yeni Görev Ekle</h2>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-300">
            <Check className="h-4 w-4"/> Görev oluşturuldu! Yönlendiriliyorsunuz...
          </div>
        )}
        {errors.length > 0 && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3"><ul className="text-sm text-red-600 dark:text-red-400 space-y-1">{errors.map((e,i)=><li key={i}>• {e}</li>)}</ul></div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Başlık <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e=>set("title",e.target.value)} className={inputClass} placeholder="Görev başlığı..." required/>
          </div>
          <div>
            <label className={labelClass}>Açıklama</label>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Opsiyonel açıklama..."/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Kategori</label>
              <select value={form.category} onChange={e=>set("category",e.target.value)} className={inputClass}>
                {["iş","kişisel","okul","sağlık"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Öncelik</label>
              <select value={form.priority} onChange={e=>set("priority",e.target.value)} className={inputClass}>
                {["düşük","orta","yüksek","kritik"].map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Durum</label>
              <select value={form.status} onChange={e=>set("status",e.target.value)} className={inputClass}>
                {["yapılacak","devam-ediyor","tamamlandı"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Deadline</label>
              <input type="datetime-local" value={form.deadline} onChange={e=>set("deadline",e.target.value)} className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Etiketler <span className="text-gray-400 font-normal">(virgülle ayır)</span></label>
              <input value={form.tags} onChange={e=>set("tags",e.target.value)} className={inputClass} placeholder="önemli, toplantı"/>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || success}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
              {saving ? "Kaydediliyor..." : "Görevi Ekle"}
            </button>
            <button type="button" onClick={()=>setForm({title:"",description:"",category:"iş",priority:"orta",status:"yapılacak",tags:"",deadline:""})}
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Temizle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: İSTATİSTİKLER
// ══════════════════════════════════════════════════════════════════════════════
const StatsPage = () => {
  const [stats, setStats] = useState<Stats|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(s=>{setStats(s);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  const statItems = [
    { label:"Toplam Görev", value: stats?.total??0, icon:<CheckSquare className="h-5 w-5 text-blue-500"/>, bg:"bg-blue-50 dark:bg-blue-900/20"},
    { label:"Tamamlanan",   value: stats?.byStatus?.["tamamlandı"]??0, icon:<TrendingUp className="h-5 w-5 text-green-500"/>, bg:"bg-green-50 dark:bg-green-900/20"},
    { label:"Devam Eden",   value: stats?.byStatus?.["devam-ediyor"]??0, icon:<Activity className="h-5 w-5 text-orange-500"/>, bg:"bg-orange-50 dark:bg-orange-900/20"},
    { label:"Yapılacak",    value: stats?.byStatus?.["yapılacak"]??0, icon:<Filter className="h-5 w-5 text-gray-500"/>, bg:"bg-gray-100 dark:bg-gray-800"},
    { label:"Kritik Görev", value: stats?.criticalCount??0, icon:<AlertCircle className="h-5 w-5 text-red-500"/>, bg:"bg-red-50 dark:bg-red-900/20"},
    { label:"Bu Hafta Deadline", value: stats?.deadlineThisWeek??0, icon:<Bell className="h-5 w-5 text-purple-500"/>, bg:"bg-purple-50 dark:bg-purple-900/20"},
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map(({label,value,icon,bg}) => (
          <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            {loading ? <><Skeleton className="h-9 w-9 rounded-lg mb-3"/><Skeleton className="h-4 w-24 mb-2"/><Skeleton className="h-8 w-12"/></> : <>
              <div className={`p-2 ${bg} rounded-lg w-fit mb-3`}>{icon}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </>}
          </div>
        ))}
      </div>

      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Statüse Göre Dağılım</h3>
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([k,v])=>(
                <div key={k}><div className="flex justify-between mb-1"><span className="text-sm text-gray-600 dark:text-gray-400">{k}</span><span className="text-sm font-medium">{v}</span></div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full ${k==="tamamlandı"?"bg-green-500":k==="devam-ediyor"?"bg-blue-500":"bg-gray-400"}`} style={{width:`${stats.total>0?Math.round((v/stats.total)*100):0}%`}}/></div></div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Kategoriye Göre Dağılım</h3>
            <div className="space-y-3">
              {Object.entries(stats.byCategory).map(([k,v])=>(
                <div key={k}><div className="flex justify-between mb-1"><span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{k}</span><span className="text-sm font-medium">{v}</span></div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full ${CATEGORY_BAR[k]??"bg-gray-400"}`} style={{width:`${stats.total>0?Math.round((v/stats.total)*100):0}%`}}/></div></div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tamamlanma Oranı</h3>
            <div className="flex items-end gap-4">
              <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">{stats.completionRate}</p>
              <p className="text-sm text-gray-500 mb-1">{stats.byStatus["tamamlandı"]??0} / {stats.total} görev tamamlandı</p>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all duration-700" style={{width:stats.completionRate}}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: KATEGORİLER
// ══════════════════════════════════════════════════════════════════════════════
const CategoriesPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getTasks().then(t=>{setTasks(t);setLoading(false);}).catch(()=>setLoading(false)); }, []);

  const categories: Category[] = ["iş","kişisel","okul","sağlık"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map(cat => {
        const catTasks = tasks.filter(t=>t.category===cat);
        return (
          <div key={cat} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800`}>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${CATEGORY_BAR[cat]}`}/>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{cat.charAt(0).toUpperCase()+cat.slice(1)}</h3>
              </div>
              <span className="text-sm text-gray-500">{catTasks.length} görev</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? Array.from({length:3}).map((_,i)=><div key={i} className="p-4 flex gap-3"><Skeleton className="h-4 flex-1"/><Skeleton className="h-5 w-16 rounded-full"/></div>)
              : catTasks.length===0 ? <p className="text-sm text-gray-400 text-center py-6">Bu kategoride görev yok.</p>
              : catTasks.map(t=>(
                <div key={t.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{t.title}</span>
                  <Badge label={t.priority} colorClass={PRIORITY_COLORS[t.priority]??""}/>
                  <Badge label={t.status} colorClass={STATUS_COLORS[t.status]??""}/>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
const TaskRow = ({ task }: { task: Task }) => (
  <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
    <span className="flex-1 min-w-[120px] text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</span>
    <Badge label={task.category} colorClass={CATEGORY_COLORS[task.category]??""}/>
    <Badge label={task.priority} colorClass={PRIORITY_COLORS[task.priority]??""}/>
    <Badge label={task.status}   colorClass={STATUS_COLORS[task.status]??""}/>
    {task.deadline && <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(task.deadline).toLocaleDateString("tr-TR")}</span>}
  </div>
);

const StatCard = ({icon,iconBg,label,value,sub,subColor,trend}:{icon:React.ReactNode;iconBg:string;label:string;value:string;sub:string;subColor:string;trend:React.ReactNode}) => (
  <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3"><div className={`p-2 ${iconBg} rounded-lg`}>{icon}</div>{trend}</div>
    <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1 text-sm">{label}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>
  </div>
);

const SkeletonCard = () => (
  <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3">
    <div className="flex justify-between"><Skeleton className="h-9 w-9 rounded-lg"/><Skeleton className="h-4 w-4 rounded"/></div>
    <Skeleton className="h-4 w-24"/><Skeleton className="h-8 w-16"/><Skeleton className="h-3 w-32"/>
  </div>
);

const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5"/>
    <p className="text-sm text-red-700 dark:text-red-300 flex-1">{message}</p>
    <button onClick={onRetry} className="text-xs font-medium text-red-600 underline hover:no-underline">Tekrar dene</button>
  </div>
);

const SelectFilter = ({value,onChange,placeholder,options}:{value:string;onChange:(v:string)=>void;placeholder:string;options:string[]}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">{placeholder}</option>
    {options.map(o=><option key={o} value={o}>{o}</option>)}
  </select>
);

const UpcomingDeadlinesCard = () => {
  const [items, setItems] = useState<Task[]>([]);
  useEffect(() => {
    getTasks().then(all=>{
      const now=new Date(), end=new Date(now); end.setDate(end.getDate()+7);
      setItems(all.filter(t=>t.deadline&&t.status!=="tamamlandı"&&new Date(t.deadline)>=now&&new Date(t.deadline)<=end).sort((a,b)=>new Date(a.deadline!).getTime()-new Date(b.deadline!).getTime()).slice(0,5));
    }).catch(()=>{});
  },[]);
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Bu Hafta Deadline</h3>
      {items.length===0?<p className="text-sm text-gray-400 text-center py-3">Bu hafta deadline yok.</p>
      :<div className="space-y-3">{items.map(t=>(
        <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
          <p className="text-sm truncate max-w-[55%] text-gray-700 dark:text-gray-300">{t.title}</p>
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full whitespace-nowrap">
            {new Date(t.deadline!).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}
          </span>
        </div>
      ))}</div>}
    </div>
  );
};

export default Example;
