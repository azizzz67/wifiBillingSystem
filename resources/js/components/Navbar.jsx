import { Bell, Menu, Search, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { endpoints } from '../services/api';

const placeholders = {
    '/customers': 'Quick search customers...', '/packages': 'Search packages...', '/billing': 'Search invoices...',
    '/complaints': 'Search complaints...', '/reports': 'Search systems...',
};

export default function Navbar({ onMenu }) {
    const location = useLocation();
    const [user, setUser] = useState({ name: 'Admin Profile', email: 'Super Administrator' });
    useEffect(() => { endpoints.user().then(({ data }) => setUser(data)).catch(() => {}); }, []);
    const key = Object.keys(placeholders).find((path) => location.pathname.startsWith(path));
    return (
        <header className="navbar">
            <button className="mobile-menu" onClick={onMenu} aria-label="Buka menu"><Menu /></button>
            <label className="global-search">
                <Search size={20} />
                <input aria-label="Pencarian global" placeholder={placeholders[key] || 'Search customer or IP...'} />
            </label>
            <div className="navbar-actions">
                <button aria-label="Notifikasi"><Bell size={20} /></button>
                <button aria-label="Pengaturan"><Settings size={21} /></button>
                <div className="admin-profile">
                    <div><strong>{user.name}</strong><small>{user.email}</small></div>
                    <span>NF</span>
                </div>
            </div>
        </header>
    );
}
