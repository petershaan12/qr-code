import React from "react";
import { Link } from "react-router";
import { Bell, Menu, PanelLeftOpen } from "lucide-react";
import Sidebar from "./Sidebar";
import { useUIStore } from "@/store/useStore";

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    user?: {
        name: string;
        role: string;
        email?: string;
    };
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle, user }) => {
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);

    return (
        <div className="flex h-screen bg-base-200">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-base-100 border-b border-base-300 px-4 md:px-8 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {!sidebarOpen && (
                            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-base-200" title="Open Sidebar">
                                <PanelLeftOpen className="w-5 h-5 text-base-content/60 hidden lg:block" />
                                <Menu className="w-5 h-5 text-base-content/60 lg:hidden" />
                            </button>
                        )}
                        {sidebarOpen && (
                            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-base-200 lg:hidden" title="Open Menu">
                                <Menu className="w-5 h-5 text-base-content/60" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-lg font-bold text-base-content">{title}</h1>
                            {subtitle && <p className="text-sm text-base-content/50 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-base-200 transition-colors" title="Notifications">
                            <Bell className="w-5 h-5 text-base-content/50" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <Link to="/account" className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <span className="text-red-600 font-semibold text-sm">
                                    {user?.name?.charAt(0) || "A"}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-bold text-base-content/90 leading-tight">{user?.name || "Admin"}</p>
                                <p className="text-xs text-base-content/60 font-medium">{user?.email || "admin@armysecurity.com"}</p>
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
