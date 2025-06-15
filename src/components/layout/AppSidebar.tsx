
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, User, TrendingUp, ClipboardList, ListChecks, Moon, Target, QuoteIcon, Settings, HelpCircle, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/shared/Logo';
import { 
  Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, useSidebar, SidebarSeparator, SidebarGroup, SidebarGroupLabel
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added AvatarImage
import { useData } from '@/contexts/DataContext'; 
import { useEffect, useState } from 'react'; // Added useEffect, useState

const menuPrincipalItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutGrid },
  { href: '/profile', label: 'Perfil', icon: User },
  { href: '/ranks', label: 'Rangos', icon: TrendingUp },
  { href: '/development', label: 'Desarrollo Personal', icon: ClipboardList }, 
  { href: '/habits', label: 'Hábitos', icon: ListChecks },
  { href: '/sleep', label: 'Sueño', icon: Moon }, 
  { href: '/goals', label: 'Metas', icon: Target }, 
  { href: '/quotes', label: 'Frases', icon: QuoteIcon },
];

const sistemaItems = [
  { href: '/settings', label: 'Ajustes', icon: Settings },
  { href: '/support', label: 'Ayuda y Soporte', icon: HelpCircle }, 
];

const PLACEHOLDER_AVATAR_PREFIX = 'https://placehold.co/';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, isMobile, setOpenMobile } = useSidebar();
  const { userName, currentRank, isLoading } = useData(); 
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const updateAvatar = () => {
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar && !storedAvatar.startsWith(PLACEHOLDER_AVATAR_PREFIX)) {
        setAvatarUrl(storedAvatar);
      } else {
        setAvatarUrl(null); // Use fallback if placeholder or no avatar
      }
    };

    updateAvatar(); // Initial load

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userAvatar') {
        updateAvatar();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userXP');
    localStorage.removeItem('habits');
    localStorage.removeItem('userAvatar'); // Clear avatar on logout
    
    if (isMobile) {
      setOpenMobile(false); 
    }
    router.push('/login');
  };

  const sidebarUserName = isLoading ? "Cargando..." : userName;
  const sidebarRankName = isLoading ? "" : (currentRank.name.split(" - ")[1] || currentRank.name);
  
  return (
    <Sidebar collapsible={open ? "icon" : "offcanvas"} variant="sidebar" side="left">
        <SidebarHeader className="flex items-center justify-start p-4">
          <Logo size="medium" className={cn(open ? "block" : "hidden group-data-[collapsible=icon]:hidden", "ml-1")}/>
        </SidebarHeader>
        
        <SidebarContent className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className={cn("group-data-[collapsible=icon]:px-2")}>MENU PRINCIPAL</SidebarGroupLabel>
            <SidebarMenu>
              {menuPrincipalItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                      tooltip={{children: item.label, side: "right", align: "center"}}
                    >
                      <span>
                        <item.icon className="h-5 w-5" />
                        <span className="truncate">{item.label}</span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel className={cn("group-data-[collapsible=icon]:px-2")}>SISTEMA</SidebarGroupLabel>
            <SidebarMenu>
              {sistemaItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={{children: item.label, side: "right", align: "center"}}
                    >
                      <span>
                        <item.icon className="h-5 w-5" />
                        <span className="truncate">{item.label}</span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-sidebar-border mt-auto">
          <div className={cn("flex items-center gap-3", open ? "flex-row" : "flex-col group-data-[collapsible=icon]:flex-col")}>
            <Avatar className={cn("h-10 w-10 bg-primary flex-shrink-0", open ? "" : "group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8")}>
              <AvatarImage src={avatarUrl || undefined} alt={sidebarUserName} data-ai-hint="user avatar" />
              <AvatarFallback className="text-primary-foreground text-lg">
                {sidebarUserName ? sidebarUserName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex-grow overflow-hidden", open ? "block" : "hidden group-data-[collapsible=icon]:hidden")}>
              <p className="text-sm font-semibold truncate text-sidebar-foreground">{sidebarUserName}</p>
              <p className="text-xs text-muted-foreground truncate">{sidebarRankName}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-400 mt-2",
              open ? "px-2" : "group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:rounded-md"
            )}
            onClick={handleLogout}
            aria-label="Cerrar Sesión"
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5" />
            <span className={cn(open ? "ml-2 truncate" : "sr-only group-data-[collapsible=icon]:sr-only")}>Cerrar Sesión</span>
          </Button>
        </SidebarFooter>
    </Sidebar>
  );
}
