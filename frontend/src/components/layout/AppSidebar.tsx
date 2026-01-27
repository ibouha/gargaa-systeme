"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  Truck,
  LogOut,
  AlertTriangle,
  Wallet,
  FileText,
} from 'lucide-react';
import Image from 'next/image';
import logo from "../../../public/logogaraapro.png"

const menuItems = [
  {
    title: 'Tableau de Bord',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Gestion des Clients',
    url: '/dashboard/clients',
    icon: Users,
  },
  {
    title: 'Gestion des Expéditions',
    url: '/dashboard/expeditions',
    icon: Truck,
  },
  {
    title: 'Gestion des Chauffeurs',
    url: '/dashboard/chauffeurs',
    icon: Users,
  },
  {
    title: 'Gestion des Frais',
    url: '/dashboard/frais',
    icon: Wallet,
  },
  {
    title: 'Gestion des Devis',
    url: '/dashboard/devis',
    icon: FileText,
  },
  {
    title: 'Alertes Paiement',
    url: '/dashboard/alertes',
    icon: AlertTriangle,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="gargaa transport" className="w-full h-full" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url} onClick={handleLinkClick}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {user?.nom_complet?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.nom_complet}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

