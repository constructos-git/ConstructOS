import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Sun,
  StickyNote,
  Calendar,
  MessageSquare,
  Mail,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useNotesStore } from '@/stores/notesStore';
import { supabase } from '@/lib/supabase';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import GlobalSearch from './GlobalSearch';

export default function Header() {
  const { setMode, getEffectiveTheme } = useTheme();
  const { setIsOpen: setNotesOpen } = useNotesStore();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('User');
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || 'User');
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'User');
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || 'User');
        setUserName(
          session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleThemeToggle = () => {
    // Always toggle between light and dark only
    const effectiveTheme = getEffectiveTheme();
    if (effectiveTheme === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  const getThemeIcon = () => {
    const effectiveTheme = getEffectiveTheme();
    if (effectiveTheme === 'light') {
      return <Moon className="h-5 w-5" />;
    }
    return <Sun className="h-5 w-5" />;
  };

  const getThemeTooltip = () => {
    const effectiveTheme = getEffectiveTheme();
    if (effectiveTheme === 'light') {
      return 'Switch to Dark Mode';
    }
    return 'Switch to Light Mode';
  };

  return (
    <header
      className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflow: 'visible',
        zIndex: 1000,
        position: 'sticky'
      }}
    >
      <div
        className="flex h-16 items-center justify-between px-6"
        style={{ width: '100%', maxWidth: '100%', position: 'relative' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notes */}
          <Tooltip content="Notes">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotesOpen(true)}
              className="h-9 w-9 p-0"
            >
              <StickyNote className="h-5 w-5" />
            </Button>
          </Tooltip>

          {/* Calendar */}
          <Tooltip content="Calendar">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calendar')}
              className="h-9 w-9 p-0"
            >
              <Calendar className="h-5 w-5" />
            </Button>
          </Tooltip>

          {/* Chat */}
          <Tooltip content="Chat">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/messages')}
              className="h-9 w-9 p-0"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Tooltip>

          {/* Email */}
          <Tooltip content="Email">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/email')}
              className="h-9 w-9 p-0"
            >
              <Mail className="h-5 w-5" />
            </Button>
          </Tooltip>

          {/* Divider */}
          <div className="mx-2 h-6 w-px bg-border" />

          {/* Theme Toggle */}
          <Tooltip content={getThemeTooltip()}>
            <Button variant="ghost" size="sm" onClick={handleThemeToggle} className="h-9 w-9 p-0">
              {getThemeIcon()}
            </Button>
          </Tooltip>

          {/* User Dropdown */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
                  <User className="h-4 w-4" />
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            }
            align="right"
          >
            <div className="p-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <div className="border-t" />
              <button
                onClick={() => {
                  navigate('/settings');
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/login');
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
