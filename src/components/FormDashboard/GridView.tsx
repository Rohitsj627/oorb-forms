import React from 'react';
import FileItem from './FileItem';
import { FormItem, FolderItem } from './types';
import { useFormData } from './FormDataContext';

interface GridViewProps {
  onEditForm: (id: string) => void;
  onViewResponses: (id: string) => void;
  onDeleteForm: (id: string) => void;
  onCopyShareLink: (shareUrl: string) => void;
  onDeleteFolder: (id: string) => void;
}

const GridView: React.FC<GridViewProps> = ({ 
  onEditForm, 
  onViewResponses,
  onDeleteForm,
  onCopyShareLink,
  onDeleteFolder
}) => {
  const { filteredFolders, filteredStandaloneForms } = useFormData();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
      {filteredFolders.map((folder) => (
        <FileItem
          key={`folder-${folder._id}`}
          item={folder}
          type="folder"
          onDelete={onDeleteFolder}
        />
      ))}

      {filteredStandaloneForms.map((form) => (
        <FileItem
          key={`form-${form._id}`}
          item={form}
          type="form"
          onEdit={onEditForm}
          onViewResponses={onViewResponses}
          onDelete={onDeleteForm}
          onCopyShareLink={onCopyShareLink}
        />
      ))}
    </div>
  );
};

export default GridView;