
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, SidebarOpenIcon } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar'; 
import Logo from '@/components/shared/Logo';
import { useRouter } from 'next/navigation';
// Removed useEffect, useState for local avatar state
import { useData } from '@/contexts/DataContext'; 

export function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const router = useRouter();
  const { userName, userAvatar, isLoading: isUserDataLoading, updateUserAvatar } = useData(); // Get userAvatar and updateUserAvatar

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    // localStorage.removeItem('userAvatar'); // Context handles this
    updateUserAvatar(null); // Clear avatar in context and localStorage
    router.push('/login');
  };

  const headerUserInitial = isUserDataLoading ? 'U' : (userName ? userName.charAt(0).toUpperCase() : 'U');
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <SidebarOpenIcon className="h-5 w-5" />
         </Button>
      )}
      
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar || undefined} alt="User Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>{headerUserInitial}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Configuración</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
