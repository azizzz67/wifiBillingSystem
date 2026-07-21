import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Packages from './pages/Packages';
import Billing from './pages/Billing';
import Complaints from './pages/Complaints';
import Reports from './pages/Reports';

export default function NetworkFlowApp() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
