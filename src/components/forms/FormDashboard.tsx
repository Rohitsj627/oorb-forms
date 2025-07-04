import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Share2,
  BarChart3,
  Users,
  Calendar,
  FileText,
  Download,
  Send,
  Folder,
  FolderPlus,
  Settings
} from 'lucide-react';
import { formAPI, exportAPI, folderAPI } from '../../services/api';
import FolderModal from './FolderModal';
import toast from 'react-hot-toast';

interface FormItem {
  _id: string;
  title: string;
  description: string;
  responses: number;
  views: number;
  createdAt: string;
  status: 'published' | 'draft' | 'closed';
  shareUrl?: string;
  folderId?: string;
}

interface FolderItem {
  _id: string;
  name: string;
  description: string;
  color: string;
  formCount: number;
  createdAt: string;
}

interface FormDashboardProps {
  onCreateForm: () => void;
  onEditForm: (id: string) => void;
  onViewResponses: (id: string) => void;
}

const FormDashboard: React.FC<FormDashboardProps> = ({ 
  onCreateForm, 
  onEditForm,
  onViewResponses 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [forms, setForms] = useState<FormItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [formsResponse, foldersResponse] = await Promise.all([
        formAPI.getForms(),
        folderAPI.getFolders()
      ]);
      setForms(formsResponse.data);
      setFolders(foldersResponse.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (folderData: { name: string; description: string; color: string }) => {
    try {
      const response = await folderAPI.createFolder(folderData);
      setFolders([response.data, ...folders]);
      toast.success('Folder created successfully');
    } catch (error) {
      toast.error('Failed to create folder');
      console.error('Error creating folder:', error);
    }
  };

  const updateFolder = async (folderData: { name: string; description: string; color: string }) => {
    if (!selectedFolder) return;
    
    try {
      const response = await folderAPI.updateFolder(selectedFolder._id, folderData);
      setFolders(folders.map(f => f._id === selectedFolder._id ? response.data : f));
      toast.success('Folder updated successfully');
    } catch (error) {
      toast.error('Failed to update folder');
      console.error('Error updating folder:', error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      return;
    }

    try {
      await folderAPI.deleteFolder(folderId);
      setFolders(folders.filter(f => f._id !== folderId));
      toast.success('Folder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete folder');
      console.error('Error deleting folder:', error);
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      await formAPI.deleteForm(formId);
      setForms(forms.filter(form => form._id !== formId));
      toast.success('Form deleted successfully');
    } catch (error) {
      toast.error('Failed to delete form');
      console.error('Error deleting form:', error);
    }
  };

  const copyShareLink = (shareUrl: string) => {
    const shareLink = `${window.location.origin}/form/${shareUrl}`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard!');
  };

  const downloadExcel = (formId: string) => {
    exportAPI.downloadExcel(formId);
    toast.success('Excel download started');
  };

  const downloadCSV = (formId: string) => {
    exportAPI.downloadCSV(formId);
    toast.success('CSV download started');
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const standaloneForms = forms.filter(form => !form.folderId);
  const filteredStandaloneForms = standaloneForms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || form.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResponses = forms.reduce((sum, form) => sum + form.responses, 0);
  const totalViews = forms.reduce((sum, form) => sum + form.views, 0);
  const activeForms = forms.filter(form => form.status === 'published').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your forms and folders</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setSelectedFolder(null);
                  setShowFolderModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </button>
              <button
                onClick={onCreateForm}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{totalResponses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Folders</p>
                <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search forms and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Folders */}
          {filteredFolders.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Folders</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredFolders.map((folder) => {
                  const folderForms = forms.filter(form => form.folderId === folder._id);
                  const isExpanded = expandedFolders.has(folder._id);
                  
                  return (
                    <div key={folder._id}>
                      <div className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <button
                              onClick={() => toggleFolder(folder._id)}
                              className="flex items-center space-x-3"
                            >
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: folder.color + '20' }}
                              >
                                <Folder 
                                  className="w-5 h-5" 
                                  style={{ color: folder.color }}
                                />
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{folder.name}</h3>
                                <p className="text-gray-600">{folder.description}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {folder.formCount} forms • Created {new Date(folder.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedFolder(folder);
                                setShowFolderModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                              title="Edit folder"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => deleteFolder(folder._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Delete folder"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Folder Forms */}
                      {isExpanded && folderForms.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-200">
                          {folderForms.map((form) => (
                            <div key={form._id} className="px-12 py-4 border-b border-gray-200 last:border-b-0">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-base font-medium text-gray-900">{form.title}</h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(form.status)}`}>
                                      {form.status}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-2">{form.description}</p>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <BarChart3 className="w-4 h-4" />
                                      <span>{form.responses} responses</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Eye className="w-4 h-4" />
                                      <span>{form.views} views</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => onEditForm(form._id)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                                    title="Edit form"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  
                                  <button
                                    onClick={() => onViewResponses(form._id)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                                    title="View responses"
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                  </button>
                                  
                                  {form.status === 'published' && form.shareUrl && (
                                    <button
                                      onClick={() => copyShareLink(form.shareUrl!)}
                                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                                      title="Copy share link"
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  {form.responses > 0 && (
                                    <div className="relative group">
                                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                                        <Download className="w-4 h-4" />
                                      </button>
                                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                        <button
                                          onClick={() => downloadExcel(form._id)}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                          Download Excel
                                        </button>
                                        <button
                                          onClick={() => downloadCSV(form._id)}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                          Download CSV
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={() => deleteForm(form._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                    title="Delete form"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standalone Forms */}
          {filteredStandaloneForms.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Standalone Forms</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredStandaloneForms.map((form) => (
                  <div key={form._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{form.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(form.status)}`}>
                            {form.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{form.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="w-4 h-4" />
                            <span>{form.responses} responses</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{form.views} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditForm(form._id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                          title="Edit form"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => onViewResponses(form._id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                          title="View responses"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        
                        {form.status === 'published' && form.shareUrl && (
                          <button
                            onClick={() => copyShareLink(form.shareUrl!)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                            title="Copy share link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {form.responses > 0 && (
                          <div className="relative group">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                              <Download className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={() => downloadExcel(form._id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Download Excel
                              </button>
                              <button
                                onClick={() => downloadCSV(form._id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Download CSV
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => deleteForm(form._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete form"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredFolders.length === 0 && filteredStandaloneForms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms or folders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first form or folder'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedFolder(null);
                      setShowFolderModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Folder
                  </button>
                  <button
                    onClick={onCreateForm}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Form
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Folder Modal */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
          setSelectedFolder(null);
        }}
        onSubmit={selectedFolder ? updateFolder : createFolder}
        title={selectedFolder ? 'Edit Folder' : 'Create New Folder'}
        initialData={selectedFolder ? {
          name: selectedFolder.name,
          description: selectedFolder.description,
          color: selectedFolder.color
        } : undefined}
      />
    </div>
  );
};

export default FormDashboard;