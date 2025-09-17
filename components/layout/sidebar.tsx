'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  Plus,
  BarChart3,
  Users,
  Settings,
  Bell
} from 'lucide-react';
import { User } from '@/lib/auth';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onMenuClose?: () => void;
}

const navigation = {
  student: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'File Complaint', href: '/complaints/new', icon: Plus },
    { name: 'My Complaints', href: '/complaints', icon: FileText },
  ],
  coordinator: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Assigned Complaints', href: '/complaints', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ],
  hod: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Department Complaints', href: '/complaints', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Team Management', href: '/team', icon: Users },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'All Complaints', href: '/complaints', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
};

export default function Sidebar({ isMobileMenuOpen, onMenuClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as User;

  if (!user) return null;

  const userNavigation = navigation[user.role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
          onClick={onMenuClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {userNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={onMenuClose}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Role indicator */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className={cn(
                "flex-shrink-0 w-3 h-3 rounded-full mr-3",
                user.role === 'student' && "bg-blue-500",
                user.role === 'coordinator' && "bg-green-500",
                user.role === 'hod' && "bg-purple-500",
                user.role === 'admin' && "bg-red-500"
              )} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {user.role === 'hod' ? 'Head of Department' : user.role}
                </p>
                {user.department && (
                  <p className="text-xs text-gray-500">{user.department}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}