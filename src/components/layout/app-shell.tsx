import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ThemePaletteApplier } from "@/components/theme-palette-applier";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemePaletteApplier />
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="order-1 flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
