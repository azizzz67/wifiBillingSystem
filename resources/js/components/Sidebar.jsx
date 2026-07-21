import { BarChart3, CircleHelp, History, LayoutGrid, LogOut, RadioTower, ReceiptText, TicketPlus, Users, WalletCards, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { endpoints } from '../services/api';

const menu = [
    { label: 'Dashboard', to: '/', icon: LayoutGrid },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Access Points', to: '/billing', icon: RadioTower },
    { label: 'Plans', to: '/packages', icon: WalletCards },
    { label: 'Logs', to: '/reports', icon: History },
];

export default function Sidebar({ open, onClose }) {
    const navigate = useNavigate();
    return (
        <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
            <button className="sidebar-close" onClick={onClose} aria-label="Tutup menu"><X /></button>
            <div className="brand" onClick={() => navigate('/')} role="link" tabIndex={0}>
                <strong>NETWORK<br />FLOW</strong>
                <small>V.2.0.4</small>
            </div>
            <nav className="sidebar-nav">
                {menu.map(({ label, to, icon: Icon }) => (
                    <NavLink key={to} to={to} end={to === '/'} onClick={onClose}>
                        <Icon size={21} /><span>{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-bottom">
                <button className="create-ticket" onClick={() => { navigate('/complaints'); onClose(); }}><TicketPlus size={20} /> CREATE TICKET</button>
                <NavLink to="/billing" onClick={onClose}><ReceiptText size={20} /> Billing</NavLink>
                <NavLink to="/reports" onClick={onClose}><BarChart3 size={20} /> Reports</NavLink>
                <button><CircleHelp size={20} /> Support</button>
                <button className="logout-link" onClick={async () => { try { await endpoints.logout(); } finally { localStorage.removeItem('network_flow_token'); navigate('/login'); } }}><LogOut size={20} /> Logout</button>
            </div>
        </aside>
    );
}
