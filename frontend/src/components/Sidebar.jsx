import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    House, 
    FileText, 
    Signature,
    ShieldCheck, 
    Layout,
    Users,
    UsersThree, 
    ClipboardText,
    PuzzlePiece,
    Gear,
    SignOut
} from '@phosphor-icons/react';

export default function Sidebar({ currentTab, setCurrentTab, isOpen }) {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: House },
        { id: 'documents', name: 'Documents', icon: FileText },
        { id: 'signatures', name: 'Signatures', icon: Signature },
        { id: 'certificates', name: 'Certificates', icon: ShieldCheck },
        { id: 'templates', name: 'Templates', icon: Layout },
        { id: 'users', name: 'Users & Roles', icon: Users },
        { id: 'teams', name: 'Teams', icon: UsersThree },
        { id: 'audit', name: 'Audit Trail', icon: ClipboardText },
        { id: 'integrations', name: 'Integrations', icon: PuzzlePiece },
        { id: 'settings', name: 'Settings', icon: Gear },
    ];

    return (
        <aside className={`w-64 bg-primary-950 text-slate-300 flex flex-col border-r border-slate-800/40 h-full fixed md:relative z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="flex-1 overflow-y-auto">
                {/* Brand header */}
                <div className="flex flex-col items-center px-0 pt-6 pb-0 bg-primary-950">
                    <img src="/logo.png" alt="LEXA Logo" className="w-full h-auto object-contain scale-105 mb-2 pointer-events-none" />
                </div>

                {/* Menu items */}
                <nav className="mt-2 px-4 space-y-1.5 relative z-20">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentTab(item.id)}
                                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-white/5 hover:text-slate-100 text-slate-300'
                                }`}
                            >
                                <Icon size={20} weight={isActive ? "fill" : "regular"} className={isActive ? "text-white" : "text-slate-300"} />
                                <span className={isActive ? "font-medium" : ""}>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Secure Plan Box */}
                <div className="mx-4 mt-8 mb-6 p-4 rounded-xl border border-blue-500/20 bg-blue-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-yellow-500 text-lg">👑</span>
                        <h4 className="text-white text-xs font-bold font-outfit">LEXA Secure Plan</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                        Tingkatkan ke plan premium untuk fitur lebih lengkap dan penyimpanan lebih besar.
                    </p>
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                        Upgrade Plan
                    </button>
                </div>
            </div>

            {/* User footer profile */}
            <div className="p-4 bg-primary-950 shrink-0 mt-auto flex flex-col space-y-4">
                <div className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`} 
                            alt="User" 
                            className="w-10 h-10 rounded-full border-2 border-slate-800"
                        />
                        <div className="truncate w-28">
                            <h4 className="text-sm font-semibold text-white leading-tight truncate">{user?.name || 'User'}</h4>
                            <span className="text-[11px] text-slate-400 capitalize leading-none">
                                {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
                            </span>
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                
                <button 
                    onClick={logout}
                    className="flex items-center space-x-3 px-2 py-2 text-slate-400 hover:text-white transition-colors w-full"
                >
                    <SignOut size={20} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
