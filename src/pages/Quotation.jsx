import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Quotation.css';

const INITIAL_QUOTES = [
  { id: 1, client: 'شركة أ', amount: 5000, status: 'pending', date: '2024-01-15' },
  { id: 2, client: 'شركة ب', amount: 7500, status: 'approved', date: '2024-01-20' },
  { id: 3, client: 'شركة ج', amount: 3200, status: 'rejected', date: '2024-01-25' },
];

const STATUS_LABELS = {
  all: 'الكل',
  pending: 'قيد الانتظار',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
};

export default function Quotation() {
  const [quotations, setQuotations] = useState(() => {
    try {
      const stored = localStorage.getItem('zoom_quotations');
      return stored ? JSON.parse(stored) : INITIAL_QUOTES;
    } catch {
      return INITIAL_QUOTES;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ client: '', amount: '', status: 'pending', date: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('zoom_quotations', JSON.stringify(quotations));
  }, [quotations]);

  const filteredQuotations = useMemo(() => quotations.filter((quote) => {
    const matchesClient = quote.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesClient && matchesStatus;
  }), [quotations, searchTerm, statusFilter]);

  const getStatusText = (status) => STATUS_LABELS[status] || status;

  const downloadCSV = (text, fileName) => {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const header = 'client,amount,date,status';
    const rows = quotations.map((quote) => (
      [quote.client, quote.amount, quote.date, quote.status].join(',')
    ));
    downloadCSV([header, ...rows].join('\n'), 'quotations.csv');
    setMessage('تم تصدير العروض بنجاح.');
  };

  const handleImportClick = () => {
    setMessage('');
    fileInputRef.current?.click();
  };

  const handleCSVFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;
      if (typeof content !== 'string') return;
      const lines = content.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length <= 1) {
        setMessage('الملف لا يحتوي على بيانات صالحة.');
        return;
      }

      const [header, ...dataRows] = lines;
      const columns = header.split(',').map((col) => col.trim().toLowerCase());
      const imported = dataRows.map((row) => {
        const cells = row.split(',').map((cell) => cell.trim());
        const record = { client: '', amount: 0, date: '', status: 'pending' };
        cells.forEach((value, index) => {
          if (columns[index] === 'client') record.client = value;
          if (columns[index] === 'amount') record.amount = Number(value);
          if (columns[index] === 'date') record.date = value;
          if (columns[index] === 'status') record.status = value;
        });
        return record;
      }).filter((item) => item.client && item.date && item.amount > 0);

      if (!imported.length) {
        setMessage('لم يتم استيراد أي عروض. تأكد من تنسيق الملف.');
        return;
      }

      setQuotations((current) => {
        const nextId = current.length ? Math.max(...current.map((q) => q.id)) + 1 : 1;
        return [
          ...current,
          ...imported.map((quote, index) => ({
            id: nextId + index,
            ...quote,
          })),
        ];
      });
      setMessage(`تم استيراد ${imported.length} عرضًا بنجاح.`);
      event.target.value = '';
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.client.trim() || !form.amount || !form.date) return;

    setQuotations((current) => [
      ...current,
      {
        id: current.length ? Math.max(...current.map((q) => q.id)) + 1 : 1,
        client: form.client.trim(),
        amount: Number(form.amount),
        status: form.status,
        date: form.date,
      },
    ]);

    setForm({ client: '', amount: '', status: 'pending', date: '' });
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      setQuotations((current) => current.filter((quote) => quote.id !== id));
      setDeleteConfirm(null);
      return;
    }
    setDeleteConfirm(id);
  };

  return (
    <div className="quotation-page">
      <div className="page-header">
        <div>
          <h2>العروض السعرية</h2>
          <p>أنشئ عروض جديدة، وفرزها، وإدارة حالة كل عرض بسهولة.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => document.getElementById('quotation-form').scrollIntoView({ behavior: 'smooth' })}
        >
          إنشاء عرض جديد
        </button>
      </div>

      <form id="quotation-form" className="quotation-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            اسم العميل
            <input
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="مثال: شركة النهار"
            />
          </label>
          <label>
            المبلغ (جنيه)
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="5000"
            />
          </label>
          <label>
            التاريخ
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label>
            الحالة
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">قيد الانتظار</option>
              <option value="approved">موافق عليه</option>
              <option value="rejected">مرفوض</option>
            </select>
          </label>
        </div>
        <div className="quotation-form-actions">
          <button type="submit" className="btn btn-primary btn-wide">حفظ العرض</button>
          <button type="button" className="btn btn-secondary btn-wide" onClick={handleExport}>تصدير CSV</button>
          <button type="button" className="btn btn-secondary btn-wide" onClick={handleImportClick}>استيراد CSV</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleCSVFile}
          />
        </div>
      </form>

      {message && <div className="message-bar">{message}</div>}

      <div className="quotation-controls">
        <input
          type="text"
          placeholder="بحث باسم العميل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-select"
        >
          <option value="all">الكل</option>
          <option value="pending">قيد الانتظار</option>
          <option value="approved">موافق عليه</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>

      {filteredQuotations.length === 0 ? (
        <div className="empty-state">
          لا توجد عروض تطابق البحث أو الفلتر الحالي.
        </div>
      ) : (
        <div className="quotation-table">
          <table>
            <thead>
              <tr>
                <th>العميل</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((quote) => (
                <tr key={quote.id}>
                  <td>{quote.client}</td>
                  <td>{quote.amount.toLocaleString('ar-EG')} ج.م</td>
                  <td>{quote.date}</td>
                  <td>
                    <span className={`status ${quote.status}`}>
                      {getStatusText(quote.status)}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button type="button" className="btn btn-secondary">عرض</button>
                    <button type="button" className="btn btn-secondary">تعديل</button>
                    <button
                      type="button"
                      className={`btn ${deleteConfirm === quote.id ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => handleDelete(quote.id)}
                    >
                      {deleteConfirm === quote.id ? 'تأكيد حذف' : 'حذف'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
