import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clsx } from 'clsx';
import {
  Sun,
  Moon,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  BookmarkIcon,
  LayoutDashboard,
  Zap,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toggleDarkMode, setMobileMenuOpen } from '../../store/slices/uiSlice';
import { clearCredentials } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useCategories } from '../../features/categories/categoriesApi';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, mobileMenuOpen } = useSelector((state: RootState) => state.ui);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync dark mode with html class on init
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate('/');
  };

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800/80'
          : 'bg-white dark:bg-slate-950'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 shadow-sm group-hover:shadow-glow transition-all">
              <Zap size={16} className="text-white fill-current" />
            </div>
            <span className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white">
              DISPATCH
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                )
              }
              end
            >
              Home
            </NavLink>

            {/* Categories Dropdown */}
            <DropdownMenu.Root open={categoriesOpen} onOpenChange={setCategoriesOpen}>
              <DropdownMenu.Trigger asChild>
                <button
                  className={clsx(
                    'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  Categories
                  <ChevronDown size={14} className={clsx('transition-transform', categoriesOpen && 'rotate-180')} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 p-2 animate-slide-down"
                  sideOffset={8}
                  align="start"
                >
                  {categories.slice(0, 10).map((cat) => (
                    <DropdownMenu.Item key={cat._id} asChild>
                      <Link
                        to={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors outline-none"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                        <span className="ml-auto text-xs text-slate-400">{cat.articleCount}</span>
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all w-44 focus:w-56"
                />
              </div>
            </form>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth */}
            {isAuthenticated && user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Avatar
                      src={user.profile?.avatar}
                      fallback={user.profile?.displayName || user.username}
                      size="sm"
                      ring
                    />
                    <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-50 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 p-2 animate-slide-down"
                    sideOffset={8}
                    align="end"
                  >
                    <div className="px-3 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.profile?.displayName || user.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    {[
                      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                      { to: '/dashboard?tab=bookmarks', icon: BookmarkIcon, label: 'Bookmarks' },
                      { to: '/dashboard?tab=profile', icon: User, label: 'Profile' },
                    ].map(({ to, icon: Icon, label }) => (
                      <DropdownMenu.Item key={to} asChild>
                        <Link
                          to={to}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors outline-none"
                        >
                          <Icon size={16} />
                          {label}
                        </Link>
                      </DropdownMenu.Item>
                    ))}
                    <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                    <DropdownMenu.Item asChild>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors outline-none"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-brand-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </form>

            <NavLink
              to="/"
              className={({ isActive }) =>
                clsx(
                  'flex px-3 py-2.5 rounded-xl text-sm font-medium',
                  isActive
                    ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                )
              }
              onClick={() => dispatch(setMobileMenuOpen(false))}
              end
            >
              Home
            </NavLink>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => dispatch(setMobileMenuOpen(false))}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="md" fullWidth onClick={() => { navigate('/login'); dispatch(setMobileMenuOpen(false)); }}>
                  Sign In
                </Button>
                <Button size="md" fullWidth onClick={() => { navigate('/signup'); dispatch(setMobileMenuOpen(false)); }}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
