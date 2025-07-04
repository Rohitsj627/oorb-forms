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
  Settings,
  Menu,
  Bot,
  Image as ImageIcon
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
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-md lg:hidden">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-normal text-gray-900">Create Form</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                R
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Form Options */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            {/* Blank Form */}
            <div 
              onClick={onCreateForm}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-20 bg-gray-100 rounded border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                  <FileText className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Blank Form</h3>
                  <p className="text-sm text-gray-600">
                    Start with a blank form and add your own questions
                  </p>
                </div>
              </div>
            </div>

            {/* Create by AI */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-20 bg-purple-50 rounded border-2 border-purple-200 flex items-center justify-center group-hover:border-purple-500 transition-colors">
                  <Bot className="w-8 h-8 text-purple-400 group-hover:text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Create by AI</h3>
                  <p className="text-sm text-gray-600">
                    Let AI help you create a form based on your description
                  </p>
                </div>
              </div>
            </div>

            {/* Use Template */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-20 bg-green-50 rounded border-2 border-green-200 flex items-center justify-center group-hover:border-green-500 transition-colors">
                  <ImageIcon className="w-8 h-8 text-green-400 group-hover:text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Use Template</h3>
                  <p className="text-sm text-gray-600">
                    Choose from pre-built templates for common use cases
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{forms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-semibold text-gray-900">{totalResponses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">{totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Published Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{activeForms}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Forms Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900">Your Forms</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedFolder(null);
                  setShowFolderModal(true);
                }}
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </button>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Forms Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Folders */}
            {filteredFolders.map((folder) => (
              <div
                key={folder._id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => toggleFolder(folder._id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: folder.color + '20' }}
                  >
                    <Folder 
                      className="w-8 h-8" 
                      style={{ color: folder.color }}
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate w-full">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {folder.formCount} forms
                  </p>
                </div>
                <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFolder(folder);
                      setShowFolderModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder._id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Standalone Forms */}
            {filteredStandaloneForms.map((form) => (
              <div
                key={form._id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onEditForm(form._id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate w-full">
                    {form.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(form.status)}`}>
                      {form.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{form.responses} responses</span>
                    <span>{form.views} views</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewResponses(form._id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="View responses"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    {form.status === 'published' && form.shareUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyShareLink(form.shareUrl!);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Copy share link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteForm(form._id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredFolders.length === 0 && filteredStandaloneForms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms or folders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first form'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={onCreateForm}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Form
                </button>
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