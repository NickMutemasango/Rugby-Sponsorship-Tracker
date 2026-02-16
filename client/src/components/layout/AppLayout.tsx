import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
