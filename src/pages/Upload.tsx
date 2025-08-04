
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ExcelUploadForm from '@/components/ExcelUploadForm';
import { ModernCard } from '@/components/ModernCard';
import { Upload as UploadIcon } from 'lucide-react';

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleUploadSuccess = (fileName: string) => {
    setUploadedFiles(prev => [...prev, fileName]);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 mb-6 sm:mb-8">
            <ExcelUploadForm />
          </div>

          {/* Uploaded Files History */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Arquivos Enviados</h3>
              <p className="text-gray-600 text-sm mb-3 sm:mb-4">Histórico de uploads recentes</p>
              
              <div className="space-y-2">
                {uploadedFiles.map((fileName, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-emerald-600">✅</span>
                      <span className="text-sm font-medium text-emerald-800 break-all">{fileName}</span>
                    </div>
                    <span className="text-xs text-emerald-600 whitespace-nowrap ml-2">Processado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Upload;
