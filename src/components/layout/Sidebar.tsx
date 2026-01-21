import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  FolderKanban,
  FileText,
  MessageSquare,
  Mail,
  Settings,
  BookOpen,
  Activity,
  CreditCard,
  Plug,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  HardHat,
  Briefcase,
  Receipt,
  Calculator,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';

interface NavItem {
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  {
    label: 'Contacts',
    icon: Users,
    children: [
      { label: 'All Contacts', path: '/contacts', icon: Users },
      { label: 'Companies', path: '/companies', icon: Building2 },
      { label: 'Clients', path: '/contacts/clients', icon: UserCheck },
      { label: 'Contractors', path: '/contacts/contractors', icon: HardHat },
      { label: 'Consultants', path: '/contacts/consultants', icon: Briefcase },
    ],
  },
  { label: 'Opportunities', path: '/opportunities', icon: Target },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  {
    label: 'Estimating',
    path: '/estimating/dashboard',
    icon: Calculator,
    children: [
      { label: 'Estimate Builder', path: '/estimating', icon: Calculator },
      { label: 'Estimate Builder AI', path: '/estimate-builder-ai', icon: Calculator },
    ],
  },
  {
    label: 'Financial',
    icon: CreditCard,
    children: [
      { label: 'Invoices', path: '/invoices', icon: FileText },
      { label: 'Estimates', path: '/financial/estimates', icon: Receipt },
    ],
  },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Email', path: '/email', icon: Mail },
  { label: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
  { label: 'Activity Log', path: '/activity', icon: Activity },
  { label: 'Roadmap', path: '/roadmap', icon: Map },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'General Settings', path: '/settings', icon: Settings },
      { label: 'Roles & Permissions', path: '/permissions', icon: Settings },
      { label: 'Integrations', path: '/integrations', icon: Plug },
    ],
  },
];

function NavItemComponent({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCollapsed } = useSidebarStore();
  const [isExpanded, setIsExpanded] = useState(() => {
    // Auto-expand if any child is exactly active or if parent path is exactly active
    if (item.children) {
      const hasActiveChild = item.children.some((child) => child.path && location.pathname === child.path);
      const isParentActive = item.path && location.pathname === item.path;
      return hasActiveChild || isParentActive || false;
    }
    return false;
  });

  // Check if any child is EXACTLY active (not just starts with)
  const hasActiveChild = item.children?.some(
    (child) => child.path && location.pathname === child.path
  );
  
  // Check if the parent item's path is EXACTLY active (not just starts with)
  // This ensures that when on the parent path, children are NOT highlighted
  const isParentActive = item.path && location.pathname === item.path;

  if (item.children) {
    // When collapsed, show only icon with tooltip
    if (isCollapsed) {
      return (
        <Tooltip content={item.label} position="right">
          <button
            onClick={() => {
              // Navigate to parent path if it exists, otherwise expand sidebar
              if (item.path) {
                navigate(item.path);
              } else {
                setCollapsed(false);
                setIsExpanded(true);
              }
            }}
            className={cn(
              'flex w-full items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              hasActiveChild || isParentActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
          </button>
        </Tooltip>
      );
    }

    return (
      <div>
        <NavLink
          to={item.path || '#'}
          onClick={(e) => {
            // If clicking the chevron, toggle expansion instead of navigating
            if ((e.target as HTMLElement).closest('.chevron-container')) {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            } else if (!item.path) {
              // If no path, just toggle expansion
              e.preventDefault();
              setIsExpanded(!isExpanded);
            } else {
              // If navigating, ensure dropdown is expanded
              if (!isExpanded) {
                setIsExpanded(true);
              }
            }
            // Otherwise, let NavLink handle navigation
          }}
          className={() =>
            cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              // Only highlight parent if it's exactly active AND no child is active
              (isParentActive && !hasActiveChild)
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-muted-foreground'
            )
          }
        >
          <div className="flex items-center gap-3 flex-1">
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
          <div
            className="chevron-container cursor-pointer flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </NavLink>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              // Check if this child is exactly active (not just starts with)
              // Also ensure parent path is not active when checking child
              const isChildExactlyActive = child.path && location.pathname === child.path && !isParentActive;
              return (
                <NavLink
                  key={child.path}
                  to={child.path || '#'}
                  className={() =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isChildExactlyActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-muted-foreground'
                    )
                  }
                >
                  <ChildIcon className="h-4 w-4" />
                  <span>{child.label}</span>
                  {child.badge && (
                    <span className="ml-auto rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
                      {child.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!item.path) return null;

  const Icon = item.icon;

  // When collapsed, show only icon with tooltip
  if (isCollapsed) {
    return (
      <Tooltip content={item.label} position="right">
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            cn(
              'relative flex w-full items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-muted-foreground'
            )
          }
        >
          <Icon className="h-5 w-5" />
          {item.badge && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-600" />
          )}
        </NavLink>
      </Tooltip>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
            : 'text-muted-foreground'
        )
      }
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen border-r bg-background transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header Section with Logo and Toggle */}
      <div className="flex items-center justify-between h-16 border-b px-4 flex-shrink-0">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">ConstructOS</h1>
        )}
        <Tooltip content={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} position="right">
          <Button variant="ghost" size="sm" onClick={toggle} className="h-8 w-8 p-0 ml-auto">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 p-4 overflow-y-auto flex-1">
        {navItems.map((item) => (
          <NavItemComponent key={item.label || item.path} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>
    </aside>
  );
}
