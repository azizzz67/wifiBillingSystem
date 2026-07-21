import { BarChart3, CheckCircle2, Gauge, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import BrutalistButton from '../components/BrutalistButton';
import Modal from '../components/Modal';
import { rupiah } from '../data/formatters';
import { endpoints } from '../services/api';

export default function Packages() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [error, setError] = useState('');
    useEffect(() => { endpoints.packages().then(({ data }) => setItems(data.data)).catch(() => setError('Gagal memuat paket dari database.')); }, []);
    const openEditor = (item = null) => { setEditing(item || { id: null }); setForm(item || { name: '', speed_mbps: '', price: '', device_limit: 1, support_label: '', color: 'blue', users: 0 }); };
    const save = async () => {
        const payload = { name: form.name, speed_mbps: Number(form.speed_mbps), price: Number(form.price), color: form.color, device_limit: Number(form.device_limit), support_label: form.support_label, is_popular: Boolean(form.popular), is_active: true };
        if (!payload.name || !payload.speed_mbps || payload.price <= 0 || !payload.support_label) { setError('Lengkapi seluruh data paket.'); return; }
        try { const response = editing.id ? await endpoints.updatePackage(editing.id, payload) : await endpoints.createPackage(payload); setItems(editing.id ? items.map((x) => x.id === editing.id ? response.data.data : x) : [...items, response.data.data]); setEditing(null); setError(''); } catch (requestError) { setError(requestError.response?.data?.message || 'Paket gagal disimpan ke database.'); }
    };
    return (
        <div className="page packages-page">
            <div className="page-heading"><div><span className="eyebrow">PRODUCT / SERVICE TIERS</span><h1>PLANS &amp; PACKAGES</h1><p>Configure and manage tiered internet service offerings with precise bandwidth allocation.</p></div><BrutalistButton onClick={() => openEditor()}><Plus /> NEW PLAN</BrutalistButton></div>
            {error && <div className="api-alert">{error}</div>}
            <section className="package-grid">
                {items.map((item) => <article key={item.id} className={`package-card package-${item.color}`}>
                    {item.popular && <b className="popular-tag">MOST<br />POPULAR</b>}
                    <header><h2>{item.name}</h2><p><Gauge /> {item.speed}</p></header>
                    <div className="package-body"><div className="package-price"><span>PRICE</span><strong>{rupiah(item.price)}</strong><small>/mo</small></div><ul><li><CheckCircle2 /> {item.devices}</li><li><CheckCircle2 /> Unlimited FUP</li><li><CheckCircle2 /> {item.support}</li></ul><BrutalistButton color={item.color === 'yellow' ? 'dark' : 'white'} onClick={() => openEditor(item)}>EDIT PACKAGE</BrutalistButton></div>
                </article>)}
            </section>
            <section className="package-bottom"><article className="bandwidth-panel brutal-panel"><header>LIVE BANDWIDTH DISTRIBUTION <BarChart3 /></header><div className="bandwidth-bars">{[38, 64, 51, 82, 29, 58, 47, 71].map((value, index) => <i key={index} className={`bar-${index % 3}`} style={{ height: `${value}%` }} />)}</div></article><article className="subscriber-card brutal-panel"><Users /><strong>{items.reduce((sum, item) => sum + item.users, 0)}</strong><span>ACTIVE SUBSCRIBERS</span></article></section>
            <Modal open={Boolean(editing)} title={items.some((x) => x.id === editing?.id) ? 'EDIT PACKAGE' : 'NEW PACKAGE'} onClose={() => setEditing(null)} footer={<><BrutalistButton color="white" onClick={() => setEditing(null)}>CANCEL</BrutalistButton><BrutalistButton onClick={save}>SAVE PLAN</BrutalistButton></>}>
                <div className="form-grid"><label>PLAN NAME<input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} /></label><label>SPEED (MBPS)<input type="number" value={form.speed_mbps || ''} onChange={(e) => setForm({ ...form, speed_mbps: e.target.value })} /></label><label>MONTHLY PRICE<input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label>COLOR<select value={form.color || 'blue'} onChange={(e) => setForm({ ...form, color: e.target.value })}><option value="blue">Blue</option><option value="yellow">Yellow</option><option value="green">Green</option></select></label><label>DEVICE LIMIT<input type="number" value={form.device_limit || ''} onChange={(e) => setForm({ ...form, device_limit: e.target.value })} /></label><label>SUPPORT<input value={form.support_label || ''} onChange={(e) => setForm({ ...form, support_label: e.target.value })} /></label></div>
            </Modal>
        </div>
    );
}
