
import React from 'react';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { FileText, TableIcon, Download } from 'lucide-react';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  headers: Array<{ label: string; key: string }>;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ data, filename, headers }) => {
  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
        <Download className="w-4 h-4" />
        <span>Exportar:</span>
      </div>
      
      <CSVLink
        data={data}
        headers={headers}
        filename={`${filename}.csv`}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <FileText className="w-4 h-4" />
        <span>CSV</span>
      </CSVLink>

      <button
        onClick={handleExcelExport}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <TableIcon className="w-4 h-4" />
        <span>Excel</span>
      </button>
    </div>
  );
};
