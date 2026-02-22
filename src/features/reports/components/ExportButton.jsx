import { Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportToCSV';

/**
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of row objects to export
 * @param {string} props.fileName - Download filename (e.g. "attendance_report")
 * @param {string[]} [props.headers] - Column keys in order
 * @param {Record<string, string>} [props.headerLabels] - Map key -> display label
 * @param {string} [props.label] - Button label
 * @param {string} [props.className] - Button class
 */
export default function ExportButton({
  data,
  fileName,
  headers,
  headerLabels,
  label = 'Export CSV',
  className = '',
}) {
  const handleExport = () => {
    exportToCSV(data ?? [], fileName, { headers, headerLabels });
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className={
        className ||
        'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 print:hidden'
      }
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}
