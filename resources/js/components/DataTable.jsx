export default function DataTable({ columns, rows, empty = 'DATA TIDAK DITEMUKAN', rowKey = 'id' }) {
    return (
        <div className="table-scroll">
            <table className="data-table">
                <thead>
                    <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.length ? rows.map((row) => (
                        <tr key={row[rowKey]}>
                            {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
                        </tr>
                    )) : <tr><td className="empty-cell" colSpan={columns.length}>{empty}</td></tr>}
                </tbody>
            </table>
        </div>
    );
}
