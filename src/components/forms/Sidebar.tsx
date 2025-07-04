import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Clock, 
  User, 
  LogOut, 
  Plus,
  Folder,
  ChevronRight,
  Settings
} from 'lucide-react';
import { formAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface RecentForm {
  _id: string;
  title: string;
  updatedAt: string;
  status: string;
}

interface SidebarProps {
  onCreateForm: () => void;
  onEditForm: (id: string) => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onCreateForm, 
  onEditForm, 
  currentView,
  onNavigate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentForms, setRecentForms] = useState<RecentForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentForms();
  }, []);

  const loadRecentForms = async () => {
    try {
      const response = await formAPI.getRecentForms(5);
      setRecentForms(response.data.slice(0, 5)); // Get only first 5 forms
    } catch (error) {
      console.error('Error loading recent forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredForms = recentForms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">OORB Forms</h1>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200">
        <nav className="space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'dashboard' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={onCreateForm}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Form</span>
          </button>
        </nav>
      </div>

      {/* Recent Forms */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Recent Forms</h3>
          <Clock className="w-4 h-4 text-gray-400" />
        </div>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredForms.length > 0 ? (
          <div className="space-y-2">
            {filteredForms.map((form) => (
              <button
                key={form._id}
                onClick={() => onEditForm(form._id)}
                className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                      {form.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No forms found' : 'No recent forms'}
            </p>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Anonymous User</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;