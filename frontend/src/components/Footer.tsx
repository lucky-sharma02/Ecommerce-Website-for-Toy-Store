import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-indigo-600">
              <ShoppingBag className="h-8 w-8" />
              <span>ToyStore</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Bringing magic into every home with our curated collection of toys, games, and collectibles since 2024.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <Facebook className="h-5 w-5 hover:text-indigo-600 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-indigo-600 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 hover:text-indigo-600 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/?category=Action%20Figures" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors text-nowrap">Action Figures</Link></li>
              <li><Link to="/?category=Board%20Games" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors text-nowrap">Board Games</Link></li>
              <li><Link to="/?category=Dolls" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors text-nowrap">Dolls</Link></li>
              <li><Link to="/?category=Educational" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors text-nowrap">Educational</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors text-nowrap">Shipping Policy</Link></li>
              <li><Link to="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors text-nowrap">Returns & Refunds</Link></li>
              <li><Link to="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors text-nowrap">Terms of Service</Link></li>
              <li><Link to="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors text-nowrap">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe for early access to sales and new arrivals.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">© 2024 ToyStore Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
