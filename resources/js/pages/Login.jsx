import { ArrowRight, KeyRound, LockKeyhole, Mail, Router, ShieldCheck, Wifi } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: 'admin@networkflow.com', password: '', remember: true });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Masukkan email yang valid.';
        if (form.password.length < 6) nextErrors.password = 'Password minimal 6 karakter.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        setLoading(true);
        try {
            const { data } = await endpoints.login({ email: form.email, password: form.password });
            localStorage.setItem('network_flow_token', data.token);
            navigate('/');
        } catch (error) {
            setErrors({ email: error.response?.data?.message || error.response?.data?.errors?.email?.[0] || 'Login gagal. Periksa koneksi dan kredensial.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-intro">
                <span className="system-label">SYSTEM ACCESS V2.0.4</span>
                <h1>WIFI<br />MANAGEMENT<br /><mark>SYSTEM</mark></h1>
                <p>Manage your internet customers easily with high-energy network control.</p>
                <div className="network-art">
                    <span className="node node-a" /><span className="node node-b" /><span className="node node-c" /><span className="node node-d" />
                    <i className="line line-a" /><i className="line line-b" /><i className="line line-c" /><i className="line line-d" />
                    <div className="router-box"><Wifi /><Router /><strong>NETWORK FLOW</strong></div>
                    <em>ONLINE_CORE</em>
                </div>
            </section>
            <section className="login-side">
                <div className="login-watermark">WIFI_OS</div>
                <form className="login-card" onSubmit={submit} noValidate>
                    <header><h2>ADMIN LOGIN</h2><LockKeyhole /></header>
                    <label>EMAIL ADDRESS</label>
                    <div className={`input-box ${errors.email ? 'input-error' : ''}`}><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Mail size={19} /></div>
                    {errors.email && <small className="field-error">{errors.email}</small>}
                    <div className="password-label"><label>PASSWORD</label><button type="button">Forgot?</button></div>
                    <div className={`input-box ${errors.password ? 'input-error' : ''}`}><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><KeyRound size={19} /></div>
                    {errors.password && <small className="field-error">{errors.password}</small>}
                    <label className="check-label"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember this station</label>
                    <button className="login-submit" type="submit" disabled={loading}>{loading ? 'CONNECTING...' : 'LOGIN NOW'} <ArrowRight /></button>
                    <footer><div><span>NETWORK STATUS</span><strong><i /> Optimal</strong></div><div><span>ACTIVE NODES</span><strong>1,248 Units</strong></div><ShieldCheck /></footer>
                </form>
            </section>
        </main>
    );
}
