import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, LogIn, User, LogOut, LayoutDashboard, ToyBrick, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Sync search input with URL search params
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput.trim() });
      navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
      navigate('/');
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    searchParams.delete('search');
    setSearchParams(searchParams);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-indigo-600 flex-shrink-0">
          <ToyBrick className="h-8 w-8 text-indigo-600" />
          <span className="hidden sm:block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ToyStore
          </span>
        </Link>

        {/* Search Bar (Amazon Style) */}
        <form 
          onSubmit={handleSearch}
          className={`flex-grow max-w-2xl relative transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-indigo-500 rounded-lg' : ''}`}
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for toys, games, and more..."
              className="w-full bg-gray-50 border-gray-200 pl-10 pr-10 h-10 rounded-lg focus-visible:ring-0 focus:border-indigo-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 p-1 hover:bg-gray-200 rounded-full text-gray-400"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-4 ml-auto">
          {!user?.is_admin && (
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-indigo-50 text-gray-700">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-2">
              {user?.is_admin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="hidden lg:flex gap-2 text-indigo-600">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="hidden md:block font-medium truncate max-w-[100px]">
                    {user?.full_name.split(' ')[0]}
                  </span>
                </Button>
              </Link>

              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-red-500">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
