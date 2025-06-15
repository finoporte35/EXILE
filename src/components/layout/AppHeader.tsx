
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
import { useEffect, useState } from 'react'; // Added useEffect, useState
import { useData } from '@/contexts/DataContext'; // Added useData

const PLACEHOLDER_AVATAR_PREFIX = 'https://placehold.co/';

export function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const router = useRouter();
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState<string | null>(null);
  const { userName, isLoading: isUserDataLoading } = useData();

  useEffect(() => {
    const updateAvatar = () => {
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar && !storedAvatar.startsWith(PLACEHOLDER_AVATAR_PREFIX)) {
        setHeaderAvatarUrl(storedAvatar);
      } else {
        setHeaderAvatarUrl(null);
      }
    };
    updateAvatar();

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
    localStorage.removeItem('userAvatar'); // Clear avatar on logout
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
                <AvatarImage src={headerAvatarUrl || undefined} alt="User Avatar" data-ai-hint="user avatar" />
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
