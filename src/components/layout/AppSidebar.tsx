"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, ShieldCheck, BookOpen, Users, Settings, QuoteIcon, GitFork, BarChartHorizontalBig } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/shared/Logo';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/habits', label: 'Hábitos', icon: BarChart3 },
  { href: '/ranks', label: 'Rangos', icon: ShieldCheck },
  { href: '/quotes', label: 'Citas', icon: QuoteIcon },
  // { href: '/profile', label: 'Perfil', icon: Users }, // Placeholder for profile if needed as main nav
  // { href: '/settings', label: 'Configuración', icon: Settings }, // Placeholder
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible={open ? "icon" : "offcanvas"} variant="sidebar" side="left">
        <SidebarHeader className="flex items-center justify-between p-4">
          <Logo size="small" className={cn(open ? "block" : "hidden group-data-[collapsible=icon]:hidden")}/>
          <div className={cn(open ? "block" : "hidden group-data-[collapsible=icon]:hidden")}>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <GitFork className="h-5 w-5" />
            </Button>
          </div>
           <div className={cn(!open ? "block" : "hidden", "group-data-[collapsible=icon]:block")}>
             <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
                <BarChartHorizontalBig className="h-5 w-5" />
             </Button>
           </div>
        </SidebarHeader>
        <SidebarContent className="flex-1">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                    tooltip={{children: item.label, side: "right", align: "center"}}
                  >
                    <a>
                      <item.icon className="h-5 w-5" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* Can add elements to footer later */}
        </SidebarFooter>
    </Sidebar>
  );
}
