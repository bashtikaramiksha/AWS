"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import AuthWrapper from "@/app/components/AuthWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: "Hosted zones",
      href: "/hosted-zones",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: "Traffic policies",
      href: "/traffic-policies",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      name: "Health checks",
      href: "/health-checks",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "Resolver",
      href: "/resolver",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Profiles",
      href: "/profiles",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <AuthWrapper>
      {/* AWS Console Header */}
      <header className="bg-[#1b2530] text-white flex items-center justify-between h-12 px-4 shadow-sm z-50 fixed w-full top-0 select-none">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 mr-2">
            <span className="font-extrabold text-xl tracking-wider text-white">aws</span>
          </Link>
          <div className="h-6 w-px bg-gray-700"></div>
          <div className="font-semibold text-sm text-gray-200">Route 53</div>
          <span className="bg-[#414f5c] text-[10px] text-gray-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
            Global
          </span>
        </div>

        {/* AWS Search Bar Mock */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for services, features, marketplace products, and docs"
              className="w-full bg-[#2c3947] text-sm text-gray-300 placeholder-gray-500 pl-10 pr-4 py-1 rounded border border-[#4a5a6a] focus:outline-none focus:bg-white focus:text-gray-900 focus:border-[#ff9900]"
              disabled
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center space-x-5 text-sm text-gray-300">
          <div className="flex items-center space-x-1 cursor-default hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="font-medium text-xs">Global</span>
          </div>
          <div className="h-4 w-px bg-gray-700"></div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-200">Admin User</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-12 min-h-screen">
        {/* AWS-styled Left Navigation Sidebar */}
        <aside className="w-64 bg-[#f2f3f3] border-r border-[#eaeded] fixed h-full overflow-y-auto select-none">
          <div className="px-4 py-4 border-b border-[#eaeded]">
            <h2 className="text-sm font-bold text-gray-900 tracking-wide">Route 53</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">DNS and Traffic Management</p>
          </div>
          <nav className="p-2 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? "bg-[#ff9900]/10 text-[#e47911] border-l-2 border-[#e47911] rounded-l-none"
                      : "text-gray-600 hover:bg-[#e1e4e6] hover:text-gray-900"
                  }`}
                >
                  <span className={isActive ? "text-[#e47911]" : "text-gray-400"}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Global service indicator */}
          <div className="absolute bottom-16 left-0 right-0 px-4 py-3 border-t border-[#eaeded] mx-2 text-[10px] text-gray-500 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-gray-700">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Global Service</span>
            </div>
            <p className="leading-relaxed">
              Route 53 does not require region selection. Configurations apply globally.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-8 bg-[#fafafa]">
          {children}
        </main>
      </div>
    </AuthWrapper>
  );
}
