import { AlertTriangle, ArrowUpRight, Banknote, Radio, Users, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BrutalistButton from '../components/BrutalistButton';
import StatCard from '../components/StatCard';
import { rupiah } from '../data/formatters';
import { endpoints } from '../services/api';

export default function Dashboard() {
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => { endpoints.reports().then(({ data }) => setReport(data.data)).catch(() => setError('Gagal memuat ringkasan database.')); }, []);
    const total = report?.customers.total ?? 0;
    const active = report?.customers.active ?? 0;
    const unpaid = report?.customers.unpaid ?? 0;
    const activities = report?.activities ?? [];
    return (
        <div className="page dashboard-page">
            <div className="page-heading dashboard-heading">
                <div><span className="eyebrow">SYSTEM / OVERVIEW</span><h1>ADMIN DASHBOARD</h1><p>System status: <b className="online-label">ALL NODES ONLINE</b></p></div>
                <BrutalistButton color="white">EXPORT REPORT <ArrowUpRight size={18} /></BrutalistButton>
            </div>
            {error && <div className="api-alert">{error}</div>}
            <section className="stats-grid dashboard-stats">
                <StatCard label="TOTAL CUSTOMERS" value={total} helper="Live database records" color="blue" icon={Users} />
                <StatCard label="ACTIVE USERS" value={active} helper={`${total ? Math.round(active / total * 100) : 0}% Network Utilization`} color="green" icon={Wifi} />
                <StatCard label="UNPAID BILL" value={unpaid} helper="Action Required Immediately" color="red" icon={AlertTriangle} />
                <StatCard label="MONTHLY REVENUE" value={rupiah(report?.billing.revenue ?? 0)} helper="Paid invoices" color="yellow" icon={Banknote} />
            </section>
            <section className="dashboard-panels">
                <article className="brutal-panel revenue-panel">
                    <header><h2>REVENUE GROWTH (7D)</h2><span>LIVE DATA</span></header>
                    <div className="revenue-chart" aria-label="Grafik pertumbuhan pendapatan">
                        {[42, 61, 48, 78, 72, 91, 100].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><span>{index + 15} JUL</span></div>)}
                    </div>
                </article>
                <article className="brutal-panel split-panel">
                    <header><h2>STATUS SPLIT</h2><Radio /></header>
                    <div className="split-row"><span>ACTIVE</span><strong>220</strong><i><b style={{ width: '88%' }} /></i></div>
                    <div className="split-row"><span>INACTIVE</span><strong>20</strong><i><b className="split-yellow" style={{ width: '8%' }} /></i></div>
                    <div className="split-row"><span>SUSPENDED</span><strong>10</strong><i><b className="split-red" style={{ width: '4%' }} /></i></div>
                </article>
            </section>
            <section className="activity-panel brutal-panel">
                <header><div><span className="eyebrow">ACTIVITY LOG</span><h2>RECENT ACTIVITY</h2></div><Link to="/reports">VIEW ALL LOGS →</Link></header>
                <div className="activity-list">
                    {activities.map((item) => <div key={`${item.time}-${item.type}`}><time>{item.time}</time><span className={`activity-type type-${item.type.toLowerCase()}`}>{item.type}</span><p>{item.message}</p><strong>{item.meta}</strong></div>)}
                </div>
            </section>
        </div>
    );
}
