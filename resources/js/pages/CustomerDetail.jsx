import { ArrowLeft, Download, Gauge, Router, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BrutalistButton from '../components/BrutalistButton';
import StatusBadge from '../components/StatusBadge';
import { rupiah } from '../data/formatters';
import { endpoints } from '../services/api';

export default function CustomerDetail() {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => { endpoints.customer(id).then(({ data }) => setCustomer(data.data)).catch(() => setError('Data pelanggan tidak ditemukan.')); }, [id]);
    if (!customer) return <div className="page"><div className="api-alert">{error || 'MEMUAT PROFIL PELANGGAN...'}</div></div>;
    const history = customer.invoices?.slice(0, 3) || [];
    return (
        <div className="page detail-page">
            <div className="detail-title"><Link to="/customers"><ArrowLeft /></Link><h1>CUSTOMER PROFILE / <span>#{customer.id}</span></h1></div>
            <section className="detail-grid">
                <div>
                    <article className="profile-card brutal-panel">
                        <header><span>BASIC IDENTITY</span><UserRound /></header>
                        <div className="profile-content"><div className="avatar-large">{customer.initials}</div><div className="identity-grid"><div><span>FULL NAME</span><strong>{customer.name}</strong></div><div><span>PHONE NUMBER</span><strong>{customer.phone}</strong></div><div><span>EMAIL ADDRESS</span><strong>{customer.email}</strong></div><div className="identity-address"><span>RESIDENTIAL ADDRESS</span><p>{customer.address}</p></div></div></div>
                    </article>
                    <article className="history-card brutal-panel">
                        <header><h2>PAYMENT HISTORY</h2><button><Download size={16} /> DOWNLOAD ALL</button></header>
                        <table><thead><tr><th>INV. ID</th><th>PERIOD</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{history.map((item) => <tr key={item.id}><td>#{item.id}</td><td>{item.period}</td><td>{rupiah(item.amount)}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table>
                    </article>
                </div>
                <div>
                    <article className="network-card brutal-panel">
                        <header><span>NETWORK STATUS</span><ShieldCheck /></header>
                        <div className="network-info"><div><span>ACTIVE PACKAGE</span><strong>{customer.package.toUpperCase()} {customer.speed}</strong></div><StatusBadge status={customer.status} /><div><span>MONTHLY FEE</span><strong>{rupiah(customer.price)}</strong></div><div><span>NEXT BILLING</span><strong>AUG 01</strong></div></div>
                        <div className="signal-box"><div><span>LIVE SIGNAL STRENGTH</span><div className="signal-bars"><i /><i /><i /><i /><i /></div></div><strong>-45dBm</strong><Gauge /></div>
                    </article>
                    <article className="complaint-history brutal-panel">
                        <header>COMPLAINT HISTORY <Router /></header>
                        {(customer.complaints || []).slice(0, 3).map((item) => <div key={item.id}><time>{item.date}</time><p>{item.issue}<StatusBadge status={item.status === 'DONE' ? 'PAID' : item.status} /></p></div>)}
                        <Link to="/complaints">VIEW ALL REPORTS</Link>
                    </article>
                </div>
            </section>
            <div className="detail-actions"><BrutalistButton>SUSPEND SERVICE</BrutalistButton><BrutalistButton color="blue">UPGRADE PACKAGE</BrutalistButton><BrutalistButton color="white">RESET ONT</BrutalistButton></div>
        </div>
    );
}
