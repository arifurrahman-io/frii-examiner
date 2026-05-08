import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCalendarAlt,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaCogs,
  FaFingerprint,
  FaLayerGroup,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
  FaUserTie,
  FaUsersCog,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

const AppSidebar = ({
  navItems,
  isActive,
  onNavigate,
  onLogout,
  onCollapse,
  user,
}) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center justify-between gap-3 px-2">
      <Link to="/" onClick={onNavigate} className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-emerald-700 text-white shadow-sm">
          <FaFingerprint className="text-lg" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black tracking-tight text-emerald-950">
            FRII
          </p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Teacher Platform
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onCollapse}
        className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:text-emerald-700"
        title="Collapse menu"
      >
        <FaChevronLeft className="text-xs" />
      </button>
    </div>

    <div className="mt-9">
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        Workspace
      </p>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-emerald-800"
              }`}
            >
              <Icon className={active ? "text-emerald-700" : "text-slate-400"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>

    <div className="mt-auto border-t border-slate-100 pt-5">
      <div className="mb-5 flex items-center gap-3 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500">
          <FaUserCircle size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-800">
            {user?.name}
          </p>
          <p className="text-[10px] font-semibold uppercase text-emerald-700">
            {user?.role}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <FaSignOutAlt />
        Log out
      </button>
    </div>
  </div>
);

const IconRail = ({
  navItems,
  isActive,
  onNavigate,
  onLogout,
  collapsed,
  onExpand,
}) => (
  <div className="flex h-full flex-col items-center">
    <Link
      to="/"
      onClick={onNavigate}
      className="grid h-10 w-10 place-items-center rounded-xl text-emerald-700"
      title="Dashboard"
    >
      <FaFingerprint className="text-xl" />
    </Link>

    {collapsed && (
      <button
        type="button"
        onClick={onExpand}
        className="mt-4 grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:text-emerald-700"
        title="Expand menu"
      >
        <FaChevronRight className="text-xs" />
      </button>
    )}

    <div className={`${collapsed ? "mt-6" : "mt-8"} space-y-3`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={onNavigate}
            title={item.name}
            className={`grid h-9 w-9 place-items-center rounded-lg text-sm transition-colors ${
              active
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-400 hover:bg-slate-50 hover:text-emerald-700"
            }`}
          >
            <Icon />
          </Link>
        );
      })}
    </div>

    <button
      type="button"
      onClick={onLogout}
      className="mt-auto grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
      title="Log out"
    >
      <FaSignOutAlt />
    </button>
  </div>
);

const LayoutContainer = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = useMemo(() => {
    const items = [
      { name: "Dashboard", path: "/", icon: FaLayerGroup },
      { name: "Teachers", path: "/teachers", icon: FaUserTie },
      { name: "Routine", path: "/routine", icon: FaCalendarAlt },
    ];

    if (user?.role === "admin") {
      items.splice(1, 0, {
        name: "Setting",
        path: "/setup/branch",
        icon: FaCogs,
      });
      items.push(
        { name: "Assign Duty", path: "/assign", icon: FaClipboardList },
        { name: "Report", path: "/report", icon: FaChartBar },
        { name: "Users", path: "/users", icon: FaUsersCog }
      );
    } else if (user?.role === "incharge") {
      items.push({
        name: "Assign Duty",
        path: "/assign",
        icon: FaClipboardList,
      });
    }

    return items;
  }, [user]);

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    navigate("/login");
  };

  const handleNavigate = () => setDrawerOpen(false);

  const updateSidebarCollapsed = (nextValue) => {
    setSidebarCollapsed(nextValue);
    try {
      localStorage.setItem("sidebarCollapsed", String(nextValue));
    } catch {
      // Local storage can be unavailable in private modes; the UI still works.
    }
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-900">
      {sidebarCollapsed ? (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] border-r border-slate-200 bg-white px-4 py-6 lg:block">
          <IconRail
            navItems={navItems}
            isActive={isActive}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            onExpand={() => updateSidebarCollapsed(false)}
          />
        </aside>
      ) : (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[224px] border-r border-slate-200 bg-[#fafafa] px-5 py-7 lg:block">
          <AppSidebar
            navItems={navItems}
            isActive={isActive}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onCollapse={() => updateSidebarCollapsed(true)}
            user={user}
          />
        </aside>
      )}

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-emerald-800 shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      <div
        className={`fixed inset-0 z-50 bg-slate-950/35 transition-opacity lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-[min(86vw,300px)] border-r border-slate-200 bg-white p-5 shadow-xl transition-transform duration-300 lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500"
          aria-label="Close menu"
        >
          <FaTimes />
        </button>
        <AppSidebar
          navItems={navItems}
          isActive={isActive}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onCollapse={() => setDrawerOpen(false)}
          user={user}
        />
      </aside>

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[224px]"
        }`}
      >
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
};

export default LayoutContainer;
