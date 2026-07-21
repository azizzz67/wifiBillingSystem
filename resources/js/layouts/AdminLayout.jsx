import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminLayout() {
    const [menuOpen, setMenuOpen] = useState(false);
    if (!localStorage.getItem('network_flow_token')) return <Navigate to="/login" replace />;
    return (
        <div className="admin-shell">
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
            {menuOpen && <button className="sidebar-scrim" aria-label="Tutup menu" onClick={() => setMenuOpen(false)} />}
            <div className="admin-main">
                <Navbar onMenu={() => setMenuOpen(true)} />
                <main className="page-wrap"><Outlet /></main>
            </div>
        </div>
    );
}
