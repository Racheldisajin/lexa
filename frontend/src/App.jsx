import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import API_URL from './config';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Signatures from './pages/Signatures';
import Certificates from './pages/Certificates';
import Teams from './pages/Teams';
import Integrations from './pages/Integrations';
import Templates from './pages/Templates';
import UsersAndRoles from './pages/UsersAndRoles';
import AuditTrail from './pages/AuditTrail';
import Settings from './pages/Settings';

// Mock data functions (tetap ada agar tidak error jika ada referensi, tapi state utama diambil dari API)
const getMockNotifications = () => [
    { id: 1, title: 'Dokumen Ditandatangani', message: 'Budi telah menandatangani NDA Project Phoenix', time: '5m lalu' },
    { id: 2, title: 'Peringatan Sertifikat', message: 'Sertifikat SSL Server akan kadaluarsa dalam 5 hari', time: '2j lalu' }
];

function DashboardLayout() {
    const { user, loading, upgradePlan } = useAuth();
    const [currentTab, setCurrentTab] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        documents: { total: 0, signed: 0, pending: 0, draft: 0, rejected: 0, pendingForMe: 0 },
        certificates: { total: 0, valid: 0, expired: 0, expiringSoon: 0, nextExpiry: '' }
    });
    const [recentDocs, setRecentDocs] = useState([]);
    const [activities, setActivities] = useState([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Documents
            const docsRes = await fetch(`${API_URL}/api/documents`, {
                credentials: 'include' // PERBAIKAN
            });
            let sortedDocs = [];
            if (docsRes.ok) {
                const docs = await docsRes.json();
                sortedDocs = [...docs].sort((a, b) => b.id - a.id);
            }

            // Calculate stats
            const signed = sortedDocs.filter(d => d.status === 'signed').length;
            const pending = sortedDocs.filter(d => d.status === 'pending').length;
            const draft = sortedDocs.filter(d => d.status === 'draft').length;
            const rejected = sortedDocs.filter(d => d.status === 'rejected').length;
            const total = sortedDocs.length;
            
            const pendingForMe = sortedDocs.filter(d => {
                if (d.status !== 'pending') return false;
                if (d.target_signers) {
                    return d.target_signers.some(ts => ts.email?.toLowerCase() === user?.email?.toLowerCase() && ts.status === 'pending');
                }
                return d.target_signer_email?.toLowerCase() === user?.email?.toLowerCase();
            }).length;

            // 2. Fetch Certificates
            const certsRes = await fetch(`${API_URL}/api/certificates`, {
                credentials: 'include' // PERBAIKAN
            });
            let storedCerts = [];
            if (certsRes.ok) {
                storedCerts = await certsRes.json();
            }
            const certTotal = storedCerts.length;
            const certValid = storedCerts.filter(c => c.status === 'valid').length;
            const certExpired = storedCerts.filter(c => c.status === 'expired').length;
            const certExpiringSoon = storedCerts.filter(c => c.status === 'expiring_soon' || c.status === 'expiring').length;

            const dynamicStats = {
                documents: { total, signed, pending, draft, rejected, pendingForMe },
                certificates: {
                    total: certTotal,
                    valid: certValid,
                    expired: certExpired,
                    expiringSoon: certExpiringSoon,
                    nextExpiry: storedCerts.find(c => c.status === 'valid')?.name || '-'
                }
            };

            // 3. Fetch Activities
            const actsRes = await fetch(`${API_URL}/api/activities`, {
                credentials: 'include' // PERBAIKAN
            });
            let storedActs = [];
            if (actsRes.ok) {
                const acts = await actsRes.json();
                storedActs = acts.map(act => ({
                    id: act.id,
                    action: act.action,
                    description: `${act.user_name || 'System'} melakukan ${act.action}: ${act.description}`,
                    time: act.time || 'WIB',
                    ip_address: act.ip_address || '127.0.0.1'
                }));
            }

            setStats(dynamicStats);
            setRecentDocs(sortedDocs.slice(0, 5));
            setActivities(storedActs);
            setNotifications(getMockNotifications());
        } catch (err) {
            console.error('Error fetching dashboard data from backend:', err.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user, currentTab]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleUpgrade = (plan) => {
        setTimeout(() => {
            upgradePlan(plan);
            setShowUpgradeModal(false);
            fetchDashboardData();
        }, 500);
    };

    // PERBAIKAN: Menghapus dokumen via API, bukan localStorage
    const handleDeleteDocument = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/documents/${id}`, { 
                method: 'DELETE',
                credentials: 'include' // PERBAIKAN
            });
            if (response.ok) {
                fetchDashboardData(); // Refresh data setelah berhasil dihapus
            } else {
                alert('Gagal menghapus dokumen dari database.');
            }
        } catch (err) {
            console.error('Error deleting document:', err.message);
            alert('Gagal menghubungi server.');
        }
    };

    const renderActiveTabContent = () => {
        switch (currentTab) {
            case 'dashboard':
                return (
                    <Dashboard 
                        stats={stats} 
                        recentDocs={recentDocs} 
                        activities={activities} 
                        onNavigateToTab={setCurrentTab} 
                        onDeleteDoc={handleDeleteDocument}
                    />
                );
            case 'documents':
                return <Documents />;
            case 'signatures':
                return <Signatures />;
            case 'certificates':
                return <Certificates />;
            case 'templates':
                return <Templates />;
            case 'users':
                return <UsersAndRoles />;
            case 'teams':
                return <Teams />;
            case 'audit':
                return <AuditTrail />;
            case 'integrations':
                return <Integrations />;
            case 'settings':
                return <Settings />;
            default:
                return <Navigate to="/" replace />;
        }
    };

    return (
        <div className="flex bg-slate-50 h-screen overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            
            <Sidebar 
                currentTab={currentTab} 
                setCurrentTab={(tab) => {
                    setCurrentTab(tab);
                    setIsSidebarOpen(false);
                }} 
                isOpen={isSidebarOpen}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <Navbar 
                    currentTab={currentTab} 
                    notifications={notifications} 
                    setNotifications={setNotifications} 
                    onUpgradeClick={() => setShowUpgradeModal(true)}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <main className="flex-1 overflow-y-auto bg-slate-50/50 w-full">
                    {renderActiveTabContent()}
                </main>
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                        <h3 className="text-xl font-bold text-slate-950 font-outfit mb-2 text-center">Upgrade Paket Akun LEXA</h3>
                        <p className="text-xs text-slate-500 mb-6 text-center font-sans">Pilih paket yang sesuai dengan kebutuhan penandatanganan digital Anda.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Secure Plan */}
                            <div className="border border-indigo-200 hover:border-indigo-400 p-5 rounded-2xl flex flex-col justify-between transition-colors text-left">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-950 font-outfit">LEXA Secure Plan</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-sans">Cocok untuk penandatanganan dokumen personal tersertifikasi.</p>
                                </div>
                                <button 
                                    onClick={() => handleUpgrade('secure')}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl mt-4 transition-colors cursor-pointer font-sans"
                                >
                                    Pilih Secure Plan
                                </button>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="border border-amber-200 hover:border-amber-400 p-5 rounded-2xl flex flex-col justify-between transition-colors text-left">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-950 font-outfit">LEXA Enterprise Plan</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-sans">Penandatanganan tak terbatas dengan kolaborasi tim & akses API Key.</p>
                                </div>
                                <button 
                                    onClick={() => handleUpgrade('enterprise')}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 rounded-xl mt-4 transition-colors cursor-pointer font-sans"
                                >
                                    Pilih Enterprise Plan
                                </button>
                            </div>
                        </div>

                        <div className="text-center font-sans">
                            <button 
                                onClick={() => setShowUpgradeModal(false)}
                                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={<DashboardLayout />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}