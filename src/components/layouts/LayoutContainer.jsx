import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBook,
  FaBuilding,
  FaCalendarAlt,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaCogs,
  FaFingerprint,
  FaLayerGroup,
  FaSignOutAlt,
  FaTasks,
  FaTimes,
  FaUserCircle,
  FaUserTie,
  FaUsersCog,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

const BrandMark = ({ compact = false, onNavigate }) => (
  <Link
    to="/"
    onClick={onNavigate}
    className={`flex min-w-0 items-center ${compact ? "justify-center" : "gap-3"}`}
    title="Dashboard"
  >
    <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-slate-900 text-white shadow-sm">
      <FaFingerprint className="text-lg" />
    </div>
    {!compact && (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">FRII</p>
        <p className="truncate text-xs font-medium text-slate-500">
          Teacher Platform
        </p>
      </div>
    )}
  </Link>
);

const UserPanel = ({ user, compact = false }) => {
  if (compact) {
    return (
      <div
        className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600"
        title={`${user?.name || "User"} (${user?.role || "role"})`}
      >
        <FaUserCircle size={22} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-white text-slate-600">
          <FaUserCircle size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {user?.name || "User"}
          </p>
          <p className="text-xs font-medium capitalize text-slate-500">
            {user?.role || "role"}
          </p>
        </div>
      </div>
    </div>
  );
};

const NavLinkItem = ({ item, active, onNavigate, compact = false }) => {
  const Icon = item.icon;

  if (compact) {
    return (
      <Link
        to={item.path}
        onClick={onNavigate}
        title={item.name}
        className={`relative grid h-10 w-10 place-items-center rounded-lg text-sm transition-colors ${
          active
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
        }`}
      >
        {active && (
          <span className="absolute -left-4 h-6 w-1 rounded-r-full bg-teal-600" />
        )}
        <Icon />
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      <span
        className={`grid h-8 w-8 flex-none place-items-center rounded-lg ${
          active ? "bg-white/10 text-white" : "bg-white text-slate-500"
        }`}
      >
        <Icon size={14} />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
      {active && <span className="h-2 w-2 rounded-full bg-teal-300" />}
    </Link>
  );
};

const NavGroup = ({ item, isActive, onNavigate, compact = false }) => {
  const Icon = item.icon;
  const active = item.children.some((child) => isActive(child.path));

  if (compact) {
    return (
      <div className="space-y-2">
        <div
          title={item.name}
          className={`grid h-10 w-10 place-items-center rounded-lg text-sm ${
            active ? "bg-slate-900 text-white" : "text-slate-500"
          }`}
        >
          <Icon />
        </div>
        <div className="space-y-1 border-l border-slate-200 pl-1">
          {item.children.map((child) => (
            <NavLinkItem
              key={child.name}
              item={child}
              active={isActive(child.path)}
              onNavigate={onNavigate}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
          active ? "bg-slate-100 text-slate-950" : "text-slate-600"
        }`}
      >
        <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-white text-slate-500">
          <Icon size={14} />
        </span>
        <span>{item.name}</span>
      </div>
      <div className="ml-4 space-y-1 border-l border-slate-200 pl-4">
        {item.children.map((child) => (
          <NavLinkItem
            key={child.name}
            item={child}
            active={isActive(child.path)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};

const NavigationList = ({ navItems, isActive, onNavigate, compact = false }) => (
  <nav className={compact ? "space-y-3" : "space-y-1.5"}>
    {navItems.map((item) =>
      item.children ? (
        <NavGroup
          key={item.name}
          item={item}
          isActive={isActive}
          onNavigate={onNavigate}
          compact={compact}
        />
      ) : (
        <NavLinkItem
          key={item.name}
          item={item}
          active={isActive(item.path)}
          onNavigate={onNavigate}
          compact={compact}
        />
      )
    )}
  </nav>
);

const AppSidebar = ({
  navItems,
  isActive,
  onNavigate,
  onLogout,
  onCollapse,
  user,
}) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center justify-between gap-3">
      <BrandMark onNavigate={onNavigate} />
      <button
        type="button"
        onClick={onCollapse}
        className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
        title="Collapse menu"
        aria-label="Collapse sidebar"
      >
        <FaChevronLeft className="text-xs" />
      </button>
    </div>

    <div className="mt-8">
      <p className="mb-3 px-3 text-xs font-semibold text-slate-500">
        Workspace
      </p>
      <NavigationList
        navItems={navItems}
        isActive={isActive}
        onNavigate={onNavigate}
      />
    </div>

    <div className="mt-auto space-y-3 border-t border-slate-100 pt-5">
      <UserPanel user={user} />
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white">
          <FaSignOutAlt size={14} />
        </span>
        Log out
      </button>
    </div>
  </div>
);

const IconRail = ({ navItems, isActive, onNavigate, onLogout, onExpand, user }) => (
  <div className="flex h-full flex-col items-center">
    <BrandMark compact onNavigate={onNavigate} />

    <button
      type="button"
      onClick={onExpand}
      className="mt-4 grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
      title="Expand menu"
      aria-label="Expand sidebar"
    >
      <FaChevronRight className="text-xs" />
    </button>

    <div className="mt-7">
      <NavigationList
        navItems={navItems}
        isActive={isActive}
        onNavigate={onNavigate}
        compact
      />
    </div>

    <div className="mt-auto flex flex-col items-center gap-3">
      <UserPanel user={user} compact />
      <button
        type="button"
        onClick={onLogout}
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
        title="Log out"
        aria-label="Log out"
      >
        <FaSignOutAlt />
      </button>
    </div>
  </div>
);

const MobileTopBar = ({ pageTitle, onOpen }) => (
  <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-sm lg:hidden">
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onOpen}
        className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-800 transition-colors hover:bg-slate-100"
        aria-label="Open menu"
      >
        <FaBars />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950">
          {pageTitle}
        </p>
        <p className="text-xs font-medium text-slate-500">FRII workspace</p>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
        <FaFingerprint />
      </div>
    </div>
  </header>
);

const MobileDrawer = ({
  open,
  navItems,
  isActive,
  onNavigate,
  onClose,
  onLogout,
  user,
}) => (
  <>
    <div
      className={`fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm transition-opacity lg:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    />

    <aside
      className={`fixed inset-y-0 left-0 z-[60] w-[min(88vw,336px)] border-r border-slate-200 bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] shadow-2xl transition-transform duration-300 lg:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Mobile navigation"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <BrandMark onNavigate={onNavigate} />
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-8">
          <p className="mb-3 px-3 text-xs font-semibold text-slate-500">
            Navigation
          </p>
          <NavigationList
            navItems={navItems}
            isActive={isActive}
            onNavigate={onNavigate}
          />
        </div>

        <div className="mt-auto space-y-3 border-t border-slate-100 pt-5">
          <UserPanel user={user} />
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
          >
            <FaSignOutAlt />
            Log out
          </button>
        </div>
      </div>
    </aside>
  </>
);

const findActiveTitle = (navItems, pathname) => {
  for (const item of navItems) {
    if (item.children) {
      const child = item.children.find(
        (entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`)
      );
      if (child) return child.name;
    }

    if (pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path))) {
      return item.name;
    }
  }

  return "Workspace";
};

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
    const items = [];
    const canRateReportTeachers = ["admin", "head_teacher", "incharge"].includes(
      user?.role
    );

    if (canRateReportTeachers) {
      items.push(
        { name: "Dashboard", path: "/", icon: FaLayerGroup },
        { name: "Teachers", path: "/teachers", icon: FaUserTie },
        { name: "Performance", path: "/performance-report", icon: FaChartBar }
      );
    }

    if (user?.role === "admin") {
      items.splice(1, 0, {
        name: "Settings",
        icon: FaCogs,
        children: [
          { name: "Branch/Shift", path: "/setup/branch", icon: FaBuilding },
          { name: "Class", path: "/setup/class", icon: FaLayerGroup },
          { name: "Subject", path: "/setup/subject", icon: FaBook },
          { name: "Duty Type", path: "/setup/responsibility", icon: FaTasks },
        ],
      });
      items.push(
        { name: "Routine", path: "/routine", icon: FaCalendarAlt },
        { name: "Assign Duty", path: "/assign", icon: FaClipboardList },
        { name: "Report", path: "/report", icon: FaChartBar },
        { name: "Users", path: "/users", icon: FaUsersCog }
      );
    } else if (user?.role === "incharge") {
      items.push({ name: "Routine", path: "/routine", icon: FaCalendarAlt });
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

  const pageTitle = useMemo(
    () => findActiveTitle(navItems, location.pathname),
    [navItems, location.pathname]
  );

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
    <div className="app-shell min-h-screen bg-slate-50 text-slate-900">
      {sidebarCollapsed ? (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[80px] border-r border-slate-200 bg-white px-5 py-6 lg:block">
          <IconRail
            navItems={navItems}
            isActive={isActive}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onExpand={() => updateSidebarCollapsed(false)}
            user={user}
          />
        </aside>
      ) : (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-slate-200 bg-white px-5 py-6 lg:block">
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

      <MobileTopBar pageTitle={pageTitle} onOpen={() => setDrawerOpen(true)} />

      <MobileDrawer
        open={drawerOpen}
        navItems={navItems}
        isActive={isActive}
        onNavigate={handleNavigate}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      <main
        className={`min-h-screen pb-[env(safe-area-inset-bottom)] transition-[padding] duration-300 ${
          sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"
        }`}
      >
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
};

export default LayoutContainer;
