import { Eye, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import BrutalistButton from '../components/BrutalistButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { endpoints } from '../services/api';

export default function Complaints() {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [technician, setTechnician] = useState('Rizky A.');
    const [error, setError] = useState('');
    useEffect(() => { endpoints.complaints().then(({ data }) => setItems(data.data)).catch(() => setError('Gagal memuat complaint dari database.')); }, []);
    const assign = async () => { try { const response = await endpoints.updateComplaint(selected.db_id, { technician, status: 'PROCESS' }); setItems(items.map((item) => item.id === selected.id ? response.data.data : item)); setSelected(null); setError(''); } catch { setError('Penugasan teknisi gagal disimpan.'); } };
    const columns = [
        { key: 'id', label: 'TICKET' }, { key: 'customer', label: 'CUSTOMER', render: (row) => <strong>{row.customer}</strong> }, { key: 'issue', label: 'ISSUE' }, { key: 'date', label: 'DATE' },
        { key: 'priority', label: 'PRIORITY', render: (row) => <StatusBadge status={row.priority} /> }, { key: 'status', label: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'action', label: 'ACTION', render: (row) => <div className="table-actions"><button onClick={() => setSelected(row)} title="View detail"><Eye /></button><button onClick={() => setSelected(row)} title="Assign technician"><UserCog /></button></div> },
    ];
    return (
        <div className="page complaints-page">
            <div className="page-heading"><div><span className="eyebrow">OPERATIONS / TICKETS</span><h1>COMPLAINTS</h1><p>Track network disruptions, prioritize field work, and resolve every customer issue.</p></div><div className="complaint-counters"><div><span>OPEN TICKETS</span><strong>{items.filter((x) => x.status === 'OPEN').length}</strong></div><div><span>URGENT</span><strong>{items.filter((x) => x.priority === 'HIGH').length}</strong></div></div></div>
            {error && <div className="api-alert">{error}</div>}
            <section className="table-panel brutal-panel"><header className="table-toolbar"><strong>ACTIVE COMPLAINT QUEUE</strong><span>UPDATED: JUST NOW</span></header><DataTable columns={columns} rows={items} /><footer className="pagination"><span>SHOWING {items.length} OF 128 ENTRIES</span><div><button>PREV</button><button className="current">1</button><button>NEXT</button></div></footer></section>
            <Modal open={Boolean(selected)} title="COMPLAINT DETAIL" onClose={() => setSelected(null)} footer={<><BrutalistButton color="white" onClick={() => setSelected(null)}>BACK TO QUEUE</BrutalistButton><BrutalistButton onClick={assign}>ASSIGN TECHNICIAN</BrutalistButton></>}>
                <div className="complaint-detail"><div><span>CUSTOMER NAME</span><h3>{selected?.customer}</h3><span>DESCRIPTION</span><p>{selected?.issue}. Tim network operation akan melakukan diagnosis jalur dan perangkat pelanggan.</p></div><div><span>TICKET INFORMATION</span><dl><dt>TICKET ID</dt><dd>{selected?.id}</dd><dt>PRIORITY</dt><dd>{selected && <StatusBadge status={selected.priority} />}</dd><dt>CURRENT STATUS</dt><dd>{selected && <StatusBadge status={selected.status} />}</dd></dl><label>ASSIGNED TECHNICIAN<select value={technician} onChange={(e) => setTechnician(e.target.value)}><option>Rizky A.</option><option>Dimas R.</option><option>Sari N.</option></select></label></div></div>
            </Modal>
        </div>
    );
}
