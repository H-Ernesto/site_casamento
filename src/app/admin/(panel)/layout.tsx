import { requireAdmin } from "@/lib/session";
import { logout } from "../actions";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, wedding } = await requireAdmin();
  const s = wedding.settings;
  const coupleName = s ? `${s.groomName} & ${s.brideName}` : wedding.slug;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar
        coupleName={coupleName}
        username={user.username}
        logoutAction={logout}
      />
      <main className="flex-1 p-5 md:py-8 md:pr-8 md:pl-24 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

