import { useMemo, useState } from 'react';

function DynamicTableField({ field, value = [], onChange, disabled }) {
  const columns = field.metadata?.columns || [];
  const pageSize = Number(field.metadata?.pageSize || 5);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(columns[0]?.key || '');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredRows = useMemo(() => {
    const searched = value.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
    const sorted = [...searched].sort((left, right) => {
      const l = left[sortKey] || '';
      const r = right[sortKey] || '';
      if (sortOrder === 'asc') {
        return String(l).localeCompare(String(r), undefined, { numeric: true });
      }
      return String(r).localeCompare(String(l), undefined, { numeric: true });
    });
    return sorted;
  }, [search, sortKey, sortOrder, value]);

  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const updateCell = (rowIndex, key, cellValue) => {
    const next = value.map((row, index) => (index === rowIndex ? { ...row, [key]: cellValue } : row));
    onChange(next);
  };

  const addRow = () => {
    onChange([...value, Object.fromEntries(columns.map((column) => [column.key, '']))]);
  };

  const removeRow = (rowIndex) => onChange(value.filter((_, index) => index !== rowIndex));

  return (
    <div className="border rounded-3 p-3 bg-white">
      <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center mb-3">
        <input className="form-control" placeholder="Search rows" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="d-flex gap-2">
          <select className="form-select" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
            {columns.map((column) => (
              <option key={column.key} value={column.key}>{column.label}</option>
            ))}
          </select>
          <select className="form-select" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <button className="btn btn-outline-primary" disabled={disabled} onClick={addRow} type="button">Add Row</button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              {columns.map((column) => <th key={column.key}>{column.label}</th>)}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, pageIndex) => {
              const rowIndex = (page - 1) * pageSize + pageIndex;
              return (
                <tr key={`row-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <input
                        className="form-control form-control-sm"
                        disabled={disabled}
                        type={column.type === 'number' ? 'number' : 'text'}
                        value={row[column.key] || ''}
                        onChange={(event) => updateCell(rowIndex, column.key, event.target.value)}
                      />
                    </td>
                  ))}
                  <td><button className="btn btn-sm btn-outline-danger" disabled={disabled} onClick={() => removeRow(rowIndex)} type="button">Delete</button></td>
                </tr>
              );
            })}
            {!paginatedRows.length && (
              <tr>
                <td className="text-center text-muted py-4" colSpan={columns.length + 1}>No rows added.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">{filteredRows.length} rows</div>
        <div className="btn-group btn-group-sm">
          <button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Prev</button>
          <button className="btn btn-outline-secondary disabled" type="button">Page {page} / {totalPages}</button>
          <button className="btn btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">Next</button>
        </div>
      </div>
    </div>
  );
}

export default DynamicTableField;
