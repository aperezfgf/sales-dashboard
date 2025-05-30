
import React from 'react';

interface CsvUploaderProps {
  onUpload: (files: FileList) => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onUpload }) => {
  return (
    <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
      <p className="text-sm text-gray-600 mb-2">Upload new CSV files to update your sales history</p>
      <input
        type="file"
        accept=".csv"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            onUpload(e.target.files);
          }
        }}
        className="text-sm"
      />
    </div>
  );
};
