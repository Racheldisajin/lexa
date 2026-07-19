import React, { useState } from 'react';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    File, 
    XCircle,
    Certificate,
    Warning,
    Calendar,
    ArrowUpRight,
    Plus,
    User,
    ShieldCheck,
    ArrowUp,
    ArrowDown,
    PencilSimple,
    UploadSimple,
    Pencil,
    Layout,
    UsersThree,
    Info,
    Key,
    MagnifyingGlass,
    CreditCard,
    DotsThreeVertical,
    Eye,
    Bell,
    CaretDown,
    DownloadSimple,
    Trash
} from '@phosphor-icons/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Filler
);

import { useAuth } from '../context/AuthContext';

export default function Dashboard({ stats, recentDocs, activities, onNavigateToTab, onDeleteDoc }) {
    const { user } = useAuth();
    const docStats = stats?.documents || { total: 124, signed: 89, pending: 18, draft: 12, rejected: 5 };
    const certStats = stats?.certificates || { total: 37, valid: 28, expired: 5, expiringSoon: 4, nextExpiry: 'PT LEXA INDONESIA - Code Signing' };

    const [timeFilter, setTimeFilter] = useState('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Donut Chart Data
    const donutData = {
        labels: ['Signed', 'Pending', 'Draft', 'Rejected'],
        datasets: [{
            data: [docStats.signed, docStats.pending, docStats.draft, docStats.rejected],
            backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const donutOptions = {
        cutout: '76%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 10,
                cornerRadius: 8,
                displayColors: true
            }
        },
        maintainAspectRatio: false
    };

    // Cert Donut Chart Data
    const certDonutData = {
        labels: ['Valid', 'Expiring Soon', 'Expired'],
        datasets: [{
            data: [certStats.valid, certStats.expiringSoon, certStats.expired],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
        }]
    };

    const certDonutOptions = {
        cutout: '76%',
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
    };

    // Line Chart Data
    const lineData = {
        labels: ['1 Mei', '8 Mei', '15 Mei', '22 Mei', '29 Mei'],
        datasets: [{
            label: 'Dokumen',
            data: [25, 45, 30, 48, 42],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
            borderWidth: 2,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4
        }]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { 
                beginAtZero: true, 
                suggestedMax: 60,
                ticks: { stepSize: 20, color: '#94a3b8', font: { size: 10 } },
                border: { display: false },
                grid: { color: 'rgba(226, 232, 240, 0.6)' }
            },
            x: { 
                ticks: { color: '#94a3b8', font: { size: 10 } },
                border: { display: false },
                grid: { display: false }
            }
        }
    };

    const docPercentages = {
        signed: docStats.total > 0 ? Math.round((docStats.signed / docStats.total) * 100) : 0,
        pending: docStats.total > 0 ? Math.round((docStats.pending / docStats.total) * 100) : 0,
        draft: docStats.total > 0 ? Math.round((docStats.draft / docStats.total) * 100) : 0,
        rejected: docStats.total > 0 ? Math.round((docStats.rejected / docStats.total) * 100) : 0,
    };

    const certPercentages = {
        valid: certStats.total > 0 ? Math.round((certStats.valid / certStats.total) * 100) : 0,
        expiringSoon: certStats.total > 0 ? Math.round((certStats.expiringSoon / certStats.total) * 100) : 0,
        expired: certStats.total > 0 ? Math.round((certStats.expired / certStats.total) * 100) : 0,
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans bg-slate-50/50">
            
            {/* Top Welcome Title & Search Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-outfit flex items-center space-x-1.5">
                        <span>Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}!</span>
                        <span className="animate-bounce">👋</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Kelola dokumen, tanda tangan digital, dan sertifikat Anda dengan aman.</p>
                </div>
                
                {/* Search, Notifications & Button Section */}
                <div className="flex items-center space-x-4 self-end lg:self-auto w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                        <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search documents, users, certificates..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-sans shadow-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 relative shadow-sm cursor-pointer transition-all">
                        <Bell size={18} className="text-slate-600" />
                        <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center">3</span>
                    </button>
                    <button 
                        onClick={() => onNavigateToTab('documents')}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full flex items-center space-x-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all shrink-0"
                    >
                        <Plus size={16} weight="bold" />
                        <span>New Document</span>
                    </button>
                </div>
            </div>

            {/* Pending Signatures Alert */}
            {stats?.documents?.pendingForMe > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                            <Warning size={24} weight="fill" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 font-outfit">Anda memiliki {stats?.documents?.pendingForMe} dokumen yang perlu ditandatangani</h4>
                            <p className="text-xs text-slate-500 mt-0.5 font-sans">Harap segera periksa menu Signatures untuk memberikan persetujuan Anda.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigateToTab('signatures')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                        Tinjau & Tandatangani
                    </button>
                </div>
            )}

            {/* 4 Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Total Documents */}
                <div className="bg-white rounded-3xl p-6 relative overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-outfit">Total Documents</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-outfit">{docStats.total}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-all duration-300">
                            <FileText size={24} weight="bold" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs relative z-10 justify-between">
                        <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                            <ArrowUp size={10} weight="bold" className="mr-0.5" /> 18% dari bulan lalu
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-10 opacity-60">
                        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-blue-500/10 fill-none stroke-blue-400 stroke-[1.25px]">
                            <path d="M0,15 Q25,5 50,15 T100,10" fill="none"></path>
                        </svg>
                    </div>
                </div>

                {/* Card 2: Signed Documents */}
                <div className="bg-white rounded-3xl p-6 relative overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-outfit">Signed Documents</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-outfit">{docStats.signed}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-all duration-300">
                            <PencilSimple size={24} weight="bold" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs relative z-10 justify-between">
                        <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                            <ArrowUp size={10} weight="bold" className="mr-0.5" /> 22% dari bulan lalu
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-10 opacity-60">
                        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-emerald-500/10 fill-none stroke-emerald-400 stroke-[1.25px]">
                            <path d="M0,12 Q20,18 40,8 T80,12 T100,5" fill="none"></path>
                        </svg>
                    </div>
                </div>

                {/* Card 3: Active Certificates */}
                <div className="bg-white rounded-3xl p-6 relative overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-outfit">Active Certificates</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-outfit">{certStats.total}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-all duration-300">
                            <Certificate size={24} weight="bold" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs relative z-10 justify-between">
                        <span className="flex items-center text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full text-[10px]">
                            <ArrowUp size={10} weight="bold" className="mr-0.5" /> 12% dari bulan lalu
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-10 opacity-60">
                        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-purple-500/10 fill-none stroke-purple-400 stroke-[1.25px]">
                            <path d="M0,14 Q30,6 60,16 T100,10" fill="none"></path>
                        </svg>
                    </div>
                </div>

                {/* Card 4: Expired Certificates */}
                <div className="bg-white rounded-3xl p-6 relative overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-outfit">Expired Certificates</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-outfit">{certStats.expired}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-all duration-300">
                            <Calendar size={24} weight="bold" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs relative z-10 justify-between">
                        <span className="flex items-center text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full text-[10px]">
                            <ArrowDown size={10} weight="bold" className="mr-0.5" /> 2 dari bulan lalu
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-10 opacity-60">
                        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-orange-500/10 fill-none stroke-orange-400 stroke-[1.25px]">
                            <path d="M0,8 Q25,18 50,8 T100,14" fill="none"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Charts & Quick Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Documents Overview Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 font-outfit text-sm">Documents Overview</h3>
                        <select 
                            value={timeFilter} 
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-slate-100 cursor-pointer font-sans"
                        >
                            <option value="today">Hari Ini</option>
                            <option value="week">Minggu Ini</option>
                            <option value="month">This Month</option>
                            <option value="year">Tahun Ini</option>
                        </select>
                    </div>
                    
                    {/* Split View: Donut and Line chart */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-sans">
                        {/* Left Side: Donut Chart with stack legend */}
                        <div className="flex items-center space-x-6">
                            <div className="relative w-36 h-36 shrink-0">
                                <Doughnut data={donutData} options={donutOptions} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-slate-800 font-outfit">{docStats.total}</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 space-y-2.5 text-xs font-semibold">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2 shadow-sm"></span>
                                        <span className="text-slate-500 font-medium">Signed</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{docStats.signed} ({docPercentages.signed}%)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 shadow-sm"></span>
                                        <span className="text-slate-500 font-medium">Pending</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{docStats.pending} ({docPercentages.pending}%)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-sm"></span>
                                        <span className="text-slate-500 font-medium">Draft</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{docStats.draft} ({docPercentages.draft}%)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 shadow-sm"></span>
                                        <span className="text-slate-500 font-medium">Rejected</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{docStats.rejected} ({docPercentages.rejected}%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Line Chart (Document Status) */}
                        <div className="h-44 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Document Status</h4>
                            <div className="flex-1 relative">
                                <Line data={lineData} options={lineOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <h3 className="font-bold text-slate-800 font-outfit mb-4 text-sm">Quick Actions</h3>
                    <div className="flex flex-col space-y-3 flex-1">
                        <button onClick={() => onNavigateToTab('documents')} className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-100 p-3 rounded-2xl flex items-center space-x-3 transition-all group cursor-pointer text-left">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                                <UploadSimple size={20} weight="bold" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">Upload Document</span>
                                <span className="text-[9px] text-slate-500">Unggah dokumen baru</span>
                            </div>
                        </button>

                        <button onClick={() => onNavigateToTab('signatures')} className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-100 p-3 rounded-2xl flex items-center space-x-3 transition-all group cursor-pointer text-left">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                                <Pencil size={20} weight="bold" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">Request Signature</span>
                                <span className="text-[9px] text-slate-500">Minta tanda tangan</span>
                            </div>
                        </button>

                        <button onClick={() => onNavigateToTab('templates')} className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-100 p-3 rounded-2xl flex items-center space-x-3 transition-all group cursor-pointer text-left">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                                <Layout size={20} weight="bold" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">Create Template</span>
                                <span className="text-[9px] text-slate-500">Buat template dokumen</span>
                            </div>
                        </button>

                        <button onClick={() => onNavigateToTab('certificates')} className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-100 p-3 rounded-2xl flex items-center space-x-3 transition-all group cursor-pointer text-left">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                                <Certificate size={20} weight="bold" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">Create Certificate</span>
                                <span className="text-[9px] text-slate-500">Buat sertifikat baru</span>
                            </div>
                        </button>

                        <button onClick={() => onNavigateToTab('documents')} className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-100 p-3 rounded-2xl flex items-center space-x-3 transition-all group cursor-pointer text-left">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                                <ShieldCheck size={20} weight="bold" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">Verify Document</span>
                                <span className="text-[9px] text-slate-500">Verifikasi keaslian dokumen</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Middle Section: Recent Documents Table & Side Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                {/* Recent Documents Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 font-outfit text-sm">Recent Documents</h3>
                        <button onClick={() => onNavigateToTab('documents')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
                    </div>
                    
                    <div className="overflow-x-auto lg:overflow-visible">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] text-slate-400 border-b border-slate-100 uppercase tracking-wider font-semibold">
                                    <th className="pb-3 text-left">Document Name</th>
                                    <th className="pb-3 text-left">Status</th>
                                    <th className="pb-3 text-left">Signers</th>
                                    <th className="pb-3 text-left">Last Updated</th>
                                    <th className="pb-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentDocs && recentDocs.length > 0 ? (
                                    recentDocs.map((doc, idx) => {
                                        const isPdf = doc.type?.toLowerCase() === 'pdf' || doc.title?.toLowerCase().endsWith('.pdf');
                                        const isDocx = doc.type?.toLowerCase() === 'docx' || doc.title?.toLowerCase().endsWith('.docx') || doc.title?.toLowerCase().endsWith('.doc');
                                        const isXlsx = doc.type?.toLowerCase() === 'xlsx' || doc.title?.toLowerCase().endsWith('.xlsx') || doc.title?.toLowerCase().endsWith('.xls');
                                        
                                        let typeBg = 'bg-red-50 text-red-500';
                                        let subtitle = 'PDF Document';
                                        if (isDocx) {
                                            typeBg = 'bg-blue-50 text-blue-500';
                                            subtitle = 'Word Document';
                                        } else if (isXlsx) {
                                            typeBg = 'bg-emerald-50 text-emerald-500';
                                            subtitle = 'Spreadsheet';
                                        } else if (!isPdf) {
                                            typeBg = 'bg-slate-50 text-slate-500';
                                            subtitle = 'Dokumen';
                                        }

                                        let statusBadge = 'bg-slate-100 text-slate-500 border border-slate-200';
                                        if (doc.status === 'signed') statusBadge = 'bg-emerald-50 text-emerald-600 border border-emerald-100/50';
                                        if (doc.status === 'pending') statusBadge = 'bg-amber-50 text-amber-600 border border-amber-100/50';
                                        if (doc.status === 'rejected') statusBadge = 'bg-red-50 text-red-600 border border-red-100/50';

                                        const signers = doc.target_signers || [];

                                        return (
                                            <tr key={doc.id || idx} className={`hover:bg-slate-50/50 transition-colors ${activeDropdown === doc.id ? 'relative z-50' : 'relative z-0'}`}>
                                                <td className="py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-xl ${typeBg}`}>
                                                            <FileText size={18} weight="bold" />
                                                        </div>
                                                        <div className="truncate max-w-50">
                                                            <span className="font-bold text-slate-850 block truncate">{doc.title}</span>
                                                            <span className="text-[9px] text-slate-400 font-medium">{subtitle}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBadge}`}>{doc.status}</span>
                                                </td>
                                                <td className="py-4">
                                                    {signers.length > 0 ? (
                                                        <div className="flex items-center -space-x-2">
                                                            {signers.slice(0, 3).map((signer, sIdx) => {
                                                                const name = signer.name || signer.email?.split('@')[0] || 'Signer';
                                                                const avatarUrl = signer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
                                                                return (
                                                                    <img 
                                                                        key={sIdx}
                                                                        className="w-6 h-6 rounded-full border-2 border-white object-cover" 
                                                                        src={avatarUrl} 
                                                                        alt="signer" 
                                                                    />
                                                                );
                                                            })}
                                                            {signers.length > 3 && (
                                                                <span className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 text-[8px] font-bold text-slate-500 flex items-center justify-center z-10">
                                                                    +{signers.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium text-[10px]">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <span className="font-semibold text-slate-700 block">{doc.date || 'Hari ini'}</span>
                                                    <span className="text-[9px] text-slate-400 font-medium">{doc.time || '10:30 WIB'}</span>
                                                </td>
                                                <td className="py-4 text-center relative">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button 
                                                            onClick={() => onNavigateToTab('documents')}
                                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                                                            title="Tinjau Dokumen"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => setActiveDropdown(activeDropdown === doc.id ? null : doc.id)}
                                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer relative z-40"
                                                            title="Aksi Lainnya"
                                                        >
                                                            <DotsThreeVertical size={16} />
                                                        </button>

                                                        {activeDropdown === doc.id && (
                                                            <>
                                                                <div 
                                                                    className="fixed inset-0 z-30 cursor-default" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                />
                                                                <div 
                                                                    className={`absolute right-4 w-36 border border-slate-100 rounded-xl shadow-lg py-1.5 z-40 text-left animate-in fade-in duration-150 ${
                                                                        idx === recentDocs.length - 1 && recentDocs.length > 1
                                                                            ? 'bottom-full mb-1 slide-in-from-bottom-1'
                                                                            : 'top-full mt-1 slide-in-from-top-1'
                                                                    }`}
                                                                    style={{ backgroundColor: '#ffffff' }}
                                                                >
                                                                    <button 
                                                                        onClick={() => {
                                                                            setActiveDropdown(null);
                                                                            alert(`Mengunduh dokumen: ${doc.title}`);
                                                                        }}
                                                                        className="w-full px-3 py-1.5 text-[11px] text-slate-650 hover:bg-slate-50 flex items-center space-x-2 font-medium transition-colors cursor-pointer"
                                                                    >
                                                                        <DownloadSimple size={13} />
                                                                        <span>Unduh PDF</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setActiveDropdown(null);
                                                                            onNavigateToTab(doc.status === 'pending' ? 'signatures' : 'documents');
                                                                        }}
                                                                        className="w-full px-3 py-1.5 text-[11px] text-slate-650 hover:bg-slate-50 flex items-center space-x-2 font-medium transition-colors cursor-pointer"
                                                                    >
                                                                        <Eye size={13} />
                                                                        <span>Tinjau</span>
                                                                    </button>
                                                                    <div className="border-t border-slate-50 my-1" />
                                                                    <button 
                                                                        onClick={() => {
                                                                            setActiveDropdown(null);
                                                                            if (confirm(`Apakah Anda yakin ingin menghapus dokumen "${doc.title}"?`)) {
                                                                                onDeleteDoc(doc.id);
                                                                            }
                                                                        }}
                                                                        className="w-full px-3 py-1.5 text-[11px] text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium transition-colors cursor-pointer"
                                                                    >
                                                                        <Trash size={13} />
                                                                        <span>Hapus</span>
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                                            Tidak ada dokumen terbaru.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Cards: Certificate Overview & Recent Activity */}
                <div className="space-y-6 flex flex-col justify-between">
                    {/* Certificate Overview Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 font-outfit text-sm">Certificate Overview</h3>
                            <button onClick={() => onNavigateToTab('certificates')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                            <div className="relative w-20 h-20 shrink-0">
                                <Doughnut data={certDonutData} options={certDonutOptions} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-lg font-bold text-slate-800 font-outfit">{certStats.total}</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 space-y-2 text-xs font-semibold">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-sm"></span>
                                        <span className="text-slate-500 font-medium">Valid</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{certStats.valid} ({certPercentages.valid}%)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2 shadow-sm"></span>
                                        <span className="text-slate-500 font-medium">Expiring</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{certStats.expiringSoon} ({certPercentages.expiringSoon}%)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 shadow-sm"></span>
                                        <span className="text-slate-500 font-medium">Expired</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{certStats.expired} ({certPercentages.expired}%)</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-outfit">Next Expiry</p>
                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium">
                                <div className="flex items-center space-x-2.5 truncate">
                                    <div className="p-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg">
                                        <Certificate size={16} />
                                    </div>
                                    <span className="text-slate-700 font-bold truncate text-[11px]">{certStats.nextExpiry}</span>
                                </div>
                                <span className="text-slate-400 font-medium text-[10px] shrink-0">12 Jun 2026</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 font-outfit text-sm">Recent Activity</h3>
                                <button onClick={() => onNavigateToTab('audit')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
                            </div>
                            
                            <ul className="space-y-4">
                                {activities && activities.length > 0 ? (
                                    activities.slice(0, 3).map((act, idx) => {
                                        let bulletColor = 'bg-blue-600';
                                        if (act.action === 'signed') bulletColor = 'bg-emerald-500';
                                        if (act.action === 'expired') bulletColor = 'bg-red-550';
                                        if (act.action === 'upload') bulletColor = 'bg-blue-500';
                                        if (act.action === 'update') bulletColor = 'bg-purple-500';

                                        return (
                                            <li key={act.id || idx} className="flex items-start space-x-3 text-xs">
                                                <span className={`w-2 h-2 rounded-full ${bulletColor} shrink-0 mt-1.5`}></span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-slate-650 font-medium leading-tight">{act.description}</p>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap pt-0.5">{act.time || 'Baru saja'}</span>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-slate-400 font-medium">Tidak ada aktivitas terbaru.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Audit Trail (Full Width) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm font-sans">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 font-outfit text-sm">Audit Trail</h3>
                    <button onClick={() => onNavigateToTab('audit')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                <th className="pb-3 text-left">Activity / User Action</th>
                                <th className="pb-3 text-left">Status</th>
                                <th className="pb-3 text-left">Time & Date</th>
                                <th className="pb-3 text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {activities && activities.length > 0 ? (
                                activities.map((act, idx) => {
                                    let iconBg = 'bg-blue-50 text-blue-600';
                                    let Icon = UploadSimple;
                                    let statusBadge = 'bg-blue-50 text-blue-600 border border-blue-100/50';
                                    let badgeLabel = 'Upload';

                                    if (act.action === 'signed') {
                                        iconBg = 'bg-emerald-50 text-emerald-600';
                                        Icon = PencilSimple;
                                        statusBadge = 'bg-emerald-50 text-emerald-600 border border-emerald-100/50';
                                        badgeLabel = 'Signed';
                                    } else if (act.action === 'update') {
                                        iconBg = 'bg-purple-50 text-purple-600';
                                        Icon = Pencil;
                                        statusBadge = 'bg-purple-50 text-purple-600 border border-purple-100/50';
                                        badgeLabel = 'Update';
                                    } else if (act.action === 'system') {
                                        iconBg = 'bg-slate-50 text-slate-600';
                                        Icon = ShieldCheck;
                                        statusBadge = 'bg-slate-50 text-slate-500 border border-slate-200';
                                        badgeLabel = 'System';
                                    }

                                    return (
                                        <tr key={act.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-1.5 rounded-lg ${iconBg}`}>
                                                        <Icon size={14} weight="bold" />
                                                    </div>
                                                    <span className="font-bold text-slate-850">{act.description}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBadge}`}>{badgeLabel}</span>
                                            </td>
                                            <td className="py-3 font-semibold text-slate-650">{act.time}</td>
                                            <td className="py-3 text-right font-medium text-slate-500">{act.ip_address || '103.123.45.' + (67 + idx)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-6 text-center text-slate-400 font-medium">
                                        Tidak ada aktivitas audit.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}