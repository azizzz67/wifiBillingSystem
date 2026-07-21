import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrutalistButton from '../components/BrutalistButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { endpoints } from '../services/api';

const emptyForm = { name: '', phone: '', email: '', address: '', package: 'BASIC', status: 'ACTIVE', payment: 'PAID' };

export default function Customers() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(true);
    const pageSize = 5;

    useEffect(() => {
        endpoints.customers().then(({ data }) => setItems(data.data)).catch(() => setApiError('Gagal memuat database pelanggan.')).finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => items.filter((customer) => {
        const matchesSearch = `${customer.name} ${customer.id} ${customer.package}`.toLowerCase().includes(search.toLowerCase());
        return matchesSearch && (status === 'ALL' || customer.status === status);
    }), [items, search, status]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

    const openForm = (customer = null) => {
        setErrors({}); setModal(customer ? { type: 'edit', customer } : { type: 'add' });
        setForm(customer || emptyForm);
    };
    const save = async () => {
        const nextErrors = {};
        if (form.name.trim().length < 3) nextErrors.name = 'Nama minimal 3 karakter.';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Email tidak valid.';
        if (form.phone.trim().length < 9) nextErrors.phone = 'Nomor telepon tidak valid.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        try {
            const response = modal.type === 'edit' ? await endpoints.updateCustomer(modal.customer.id, form) : await endpoints.createCustomer(form);
            if (modal.type === 'edit') setItems(items.map((item) => item.id === modal.customer.id ? response.data.data : item));
            else setItems([response.data.data, ...items]);
            setModal(null); setApiError('');
        } catch (error) {
            const validation = error.response?.data?.errors || {};
            setErrors(Object.fromEntries(Object.entries(validation).map(([key, messages]) => [key, messages[0]])));
            if (!Object.keys(validation).length) setApiError('Perubahan gagal disimpan ke database.');
        }
    };
    const remove = async () => { try { await endpoints.deleteCustomer(modal.customer.id); setItems(items.filter((item) => item.id !== modal.customer.id)); setModal(null); } catch { setApiError('Pelanggan gagal dihapus dari database.'); setModal(null); } };

    const columns = [
        { key: 'id', label: 'CUSTOMER ID' },
        { key: 'name', label: 'NAME', render: (row) => <div className="customer-cell"><span>{row.initials}</span><div><strong>{row.name}</strong><small>{row.email}</small></div></div> },
        { key: 'package', label: 'PACKAGE', render: (row) => <div><strong>{row.package}</strong><small className="table-subtext">{row.speed}</small></div> },
        { key: 'status', label: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'payment', label: 'PAYMENT', render: (row) => <StatusBadge status={row.payment} /> },
        { key: 'action', label: 'ACTION', render: (row) => <div className="table-actions"><button title="View" onClick={() => navigate(`/customers/${row.id}`)}><Eye /></button><button title="Edit" onClick={() => openForm(row)}><Pencil /></button><button title="Delete" className="danger-action" onClick={() => setModal({ type: 'delete', customer: row })}><Trash2 /></button></div> },
    ];

    return (
        <div className="page customers-page">
            <div className="page-heading customer-heading">
                <div><span className="eyebrow">SYSTEM / USERS</span><h1>CUSTOMER<br />DATABASE</h1><p>Manage end-user access, bandwidth packages, and subscription health.</p></div>
                <BrutalistButton onClick={() => openForm()}><Plus /> ADD CUSTOMER</BrutalistButton>
            </div>
            {apiError && <div className="api-alert">{apiError}</div>}
            <section className="mini-stats">
                <div><span>TOTAL CUSTOMERS</span><strong>{items.length}</strong></div><div className="mini-green"><span>ACTIVE SESSIONS</span><strong>{items.filter((x) => x.status === 'ACTIVE').length}</strong></div><div className="mini-blue"><span>BANDWIDTH (AVG)</span><strong>42 Mb/s</strong></div><div className="mini-yellow"><span>PENDING TASKS</span><strong>12</strong></div>
            </section>
            <section className="table-panel brutal-panel">
                <header className="table-toolbar"><strong>ACTIVE RECORDS: SEGMENT_01</strong><div><label className="table-search"><Search size={17} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search customer..." /></label><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option>ALL</option><option>ACTIVE</option><option>EXPIRED</option></select></div></header>
                <DataTable columns={columns} rows={visible} empty={loading ? 'MEMUAT DATABASE...' : 'DATA TIDAK DITEMUKAN'} />
                <footer className="pagination"><span>DISPLAYING {visible.length} OF {filtered.length} ENTRIES</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}>PREV</button>{Array.from({ length: totalPages }, (_, i) => <button className={page === i + 1 ? 'current' : ''} key={i} onClick={() => setPage(i + 1)}>{i + 1}</button>)}<button disabled={page === totalPages} onClick={() => setPage(page + 1)}>NEXT</button></div></footer>
            </section>
            <Modal open={modal?.type === 'add' || modal?.type === 'edit'} title={modal?.type === 'edit' ? 'EDIT CUSTOMER' : 'ADD CUSTOMER'} onClose={() => setModal(null)} footer={<><BrutalistButton color="white" onClick={() => setModal(null)}>CANCEL</BrutalistButton><BrutalistButton onClick={save}>SAVE CUSTOMER</BrutalistButton></>}>
                <div className="form-grid">
                    <FormField label="FULL NAME" value={form.name} error={errors.name} onChange={(value) => setForm({ ...form, name: value })} />
                    <FormField label="EMAIL" value={form.email} error={errors.email} onChange={(value) => setForm({ ...form, email: value })} />
                    <FormField label="PHONE" value={form.phone} error={errors.phone} onChange={(value) => setForm({ ...form, phone: value })} />
                    <label>PACKAGE<select value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })}><option>BASIC</option><option>STANDARD</option><option>PREMIUM</option></select></label>
                    <label>STATUS<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>ACTIVE</option><option>EXPIRED</option></select></label>
                    <label>PAYMENT<select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}><option>PAID</option><option>UNPAID</option></select></label>
                    <label className="full-field">ADDRESS<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
                </div>
            </Modal>
            <Modal open={modal?.type === 'delete'} title="DELETE CUSTOMER?" tone="red" onClose={() => setModal(null)} footer={<><BrutalistButton color="white" onClick={() => setModal(null)}>CANCEL</BrutalistButton><BrutalistButton color="red" onClick={remove}>DELETE</BrutalistButton></>}><p>Data <strong>{modal?.customer?.name}</strong> akan dihapus dari daftar lokal.</p></Modal>
        </div>
    );
}

function FormField({ label, value, error, onChange }) {
    return <label>{label}<input value={value} onChange={(e) => onChange(e.target.value)} className={error ? 'input-error' : ''} />{error && <small className="field-error">{error}</small>}</label>;
}
