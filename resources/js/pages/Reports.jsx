import { AlertTriangle, FileDown, Gauge, Radio, Sheet, Wifi } from 'lucide-react';
import BrutalistButton from '../components/BrutalistButton';
import { useEffect, useState } from 'react';
import { rupiah } from '../data/formatters';
import { endpoints } from '../services/api';

export default function Reports() {
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => { endpoints.reports().then(({ data }) => setReport(data.data)).catch(() => setError('Gagal memuat laporan database.')); }, []);
    const download = (type) => {
        const content = type === 'Excel'
            ? `metric,value\nRevenue,${report?.billing.revenue ?? 0}\nUnpaid,${report?.billing.unpaid ?? 0}\nActive Customers,${report?.customers.active ?? 0}`
            : `NETWORK FLOW REPORT\nRevenue: ${rupiah(report?.billing.revenue ?? 0)}\nUnpaid: ${rupiah(report?.billing.unpaid ?? 0)}\nActive customers: ${report?.customers.active ?? 0}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `network-flow-report.${type === 'Excel' ? 'csv' : 'txt'}`; link.click(); URL.revokeObjectURL(link.href);
    };
    return (
        <div className="page reports-page">
            <div className="page-heading report-heading"><div><span className="eyebrow">INTELLIGENCE / PERFORMANCE</span><h1>REPORTS &amp;<br />ANALYTICS</h1><p>Visualizing system performance, financial flow, and customer engagement metrics.</p></div><div><BrutalistButton onClick={() => download('PDF')}><FileDown /> EXPORT PDF</BrutalistButton><BrutalistButton color="green" onClick={() => download('Excel')}><Sheet /> EXPORT EXCEL</BrutalistButton></div></div>
            {error && <div className="api-alert">{error}</div>}
            <section className="report-grid"><article className="report-revenue brutal-panel"><header>REVENUE REPORT (CURRENT MONTH) <span>LIVE</span></header><div className="revenue-total"><strong>{rupiah(report?.billing.revenue ?? 0)}</strong><span>LIVE FROM DATABASE</span></div><svg viewBox="0 0 700 250" role="img" aria-label="Revenue growth chart"><path className="area" d="M0 210 L70 190 L140 230 L210 140 L280 160 L350 70 L420 95 L490 12 L560 60 L630 0 L700 30 L700 250 L0 250Z" /><path className="line" d="M0 210 L70 190 L140 230 L210 140 L280 160 L350 70 L420 95 L490 12 L560 60 L630 0 L700 30" /></svg><div className="chart-labels"><span>WK 1</span><span>WK 2</span><span>WK 3</span><span>WK 4</span></div></article><article className="growth-card brutal-panel"><header>CUSTOMER GROWTH</header><div><span>TOTAL ACTIVE USERS</span><strong>{report?.customers.active ?? 0}</strong></div><div className="growth-bars">{[38, 54, 49, 72, 95].map((height, i) => <i key={i} style={{ height: `${height}%` }}><span>{['JAN', 'FEB', 'MAR', 'APR', 'MAY'][i]}</span></i>)}</div></article></section>
            <section className="report-lower"><article className="payment-stats brutal-panel"><header>PAYMENT STATISTICS</header><table><thead><tr><th>METHOD</th><th>TRANSACTIONS</th><th>VOLUME</th></tr></thead><tbody><tr><td><i className="dot-blue" /> Bank Transfer</td><td>4,203</td><td>Rp21,0jt</td></tr><tr><td><i className="dot-yellow" /> Digital Wallet</td><td>3,892</td><td>Rp18,4jt</td></tr><tr><td><i className="dot-green" /> Virtual Account</td><td>432</td><td>Rp3,4jt</td></tr></tbody></table></article><article className="complaint-stats brutal-panel"><header>COMPLAINT STATISTICS</header><div className="resolution"><span>AVERAGE RESOLUTION TIME</span><strong>4.2 HOURS</strong></div>{[['CONNECTION DROPS', 72, 'red'], ['BILLING ISSUES', 18, 'yellow'], ['HARDWARE FAULTS', 10, 'black']].map(([label, value, color]) => <div className="complaint-meter" key={label}><span>{label}<b>{value}%</b></span><i><em className={`meter-${color}`} style={{ width: `${value}%` }} /></i></div>)}</article></section>
            <section className="health-grid"><div><Radio /><span>NODES ONLINE</span><strong>1,024 / 1,024</strong></div><div><Gauge /><span>AVG. LATENCY</span><strong>24 MS</strong></div><div><Wifi /><span>DATA PROCESSED</span><strong>8.4 TB</strong></div><div><AlertTriangle /><span>CRITICAL ALERTS</span><strong>0</strong></div></section>
        </div>
    );
}
