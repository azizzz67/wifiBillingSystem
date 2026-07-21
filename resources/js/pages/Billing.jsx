import { Download, Filter, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import BrutalistButton from '../components/BrutalistButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { rupiah } from '../data/formatters';
import { endpoints } from '../services/api';

export default function Billing() {
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [open, setOpen] = useState(false);
    const [customerId, setCustomerId] = useState('');
    const [error, setError] = useState('');
    useEffect(() => { Promise.all([endpoints.billing(), endpoints.customers()]).then(([billingResponse, customerResponse]) => { setItems(billingResponse.data.data); setCustomers(customerResponse.data.data); setCustomerId(customerResponse.data.data[0]?.id || ''); }).catch(() => setError('Gagal memuat data billing dari database.')); }, []);
    const visible = useMemo(() => items.filter((item) => filter === 'ALL' || item.status === filter), [items, filter]);
    const generate = async () => { try { const response = await endpoints.createInvoice({ customer_id: customerId, period: 'AUG 2026', due_date: '2026-08-10' }); setItems([response.data.data, ...items]); setOpen(false); setError(''); } catch (requestError) { setError(requestError.response?.data?.message || 'Invoice gagal dibuat.'); } };
    const columns = [
        { key: 'id', label: 'INVOICE ID', render: (row) => <strong>#{row.id}</strong> },
        { key: 'customer', label: 'CUSTOMER', render: (row) => <div><strong>{row.customer}</strong><small className="table-subtext">{row.email}</small></div> },
        { key: 'package', label: 'PACKAGE', render: (row) => <span className="outline-label">{row.package.toUpperCase()}</span> },
        { key: 'period', label: 'PERIOD' },
        { key: 'amount', label: 'AMOUNT', render: (row) => <strong>{rupiah(row.amount)}</strong> },
        { key: 'status', label: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
    ];
    return (
        <div className="page billing-page">
            <div className="page-heading"><div><span className="eyebrow">FINANCE / INVOICES</span><h1>MONTHLY BILLING</h1><p>Manage generated invoices, customer payouts, and subscription statuses for the current fiscal period.</p></div><BrutalistButton onClick={() => setOpen(true)}><Plus /> GENERATE INVOICE</BrutalistButton></div>
            {error && <div className="api-alert">{error}</div>}
            <section className="billing-stats"><StatCard label="TOTAL REVENUE" value={rupiah(items.filter((x) => x.status === 'PAID').reduce((sum, x) => sum + x.amount, 0))} helper="+12% vs last month" color="blue" /><StatCard label="UNPAID BALANCE" value={rupiah(items.filter((x) => x.status === 'UNPAID').reduce((sum, x) => sum + x.amount, 0))} helper={`Due for ${items.filter((x) => x.status === 'UNPAID').length} accounts`} color="white" /><StatCard label="ACTIVE SUBSCRIPTIONS" value="220" helper="NET GROWTH +14" color="green" /></section>
            <section className="table-panel brutal-panel"><header className="table-toolbar"><strong>RECENT INVOICE LOGS</strong><div><button className="icon-button"><Filter /></button><button className="icon-button"><Download /></button><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>ALL</option><option>PAID</option><option>UNPAID</option></select></div></header><DataTable columns={columns} rows={visible} /></section>
            <div className="billing-footer-panels"><div><span>AUTOMATED BILLING STATUS</span><strong>NEXT RUN: AUG 01, 2026</strong><i /> ACTIVE</div><div><span>PENDING PAYOUTS</span><strong>3 Transactions Awaiting Auth</strong><button>REVIEW ALL</button></div></div>
            <Modal open={open} title="GENERATE INVOICE" onClose={() => setOpen(false)} footer={<><BrutalistButton color="white" onClick={() => setOpen(false)}>CANCEL</BrutalistButton><BrutalistButton onClick={generate}>GENERATE NOW</BrutalistButton></>}><div className="form-grid"><label className="full-field">CUSTOMER<select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.id} — {customer.name}</option>)}</select></label><label>BILLING PERIOD<input value="AUG 2026" readOnly /></label><label>DUE DATE<input type="date" defaultValue="2026-08-10" /></label></div></Modal>
        </div>
    );
}
