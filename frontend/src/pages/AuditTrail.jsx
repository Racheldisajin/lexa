import React, { useState, useEffect } from 'react';
import { 
    ClockCounterClockwise,
    PencilSimple,
    UploadSimple,
    Pencil,
    ShieldCheck,
    Warning
} from '@phosphor-icons/react';
import API_URL from '../config';

export default function AuditTrail() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/activities`);
            if (response.ok) {
                const data = await response.json();
                const formatted = data.map(act => ({
                    id: act.id,
                    action: act.action,
                    description: `${act.user_name} melakukan ${act.action}: ${act.description}`,
                    created_at: act.created_at || new Date().toISOString(),
                    ip_address: '127.0.0.1'
                }));
                setActivities(formatted);
            } else {
                setError('Gagal memuat log aktivitas.');
            }
        } catch (err) {
            setError('Gagal menghubungi server database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const getIconClass = (action) => {
        switch (action) {
            case 'signed':
                return {
                    icon: PencilSimple,
                    color: 'text-emerald-600 bg-emerald-50 border border-emerald-100',
                    label: 'Signed',
                    badge: 'text-emerald-600 bg-emerald-50 border border-emerald-100/55'
                };
            case 'upload':
                return {
                    icon: UploadSimple,
                    color: 'text-indigo-600 bg-indigo-50 border border-indigo-100',
                    label: 'Uploaded',
                    badge: 'text-indigo-600 bg-indigo-50 border border-indigo-100/55'
                };
            case 'update':
                return {
                    icon: Pencil,
                    color: 'text-purple-600 bg-purple-50 border border-purple-100',
                    label: 'Updated',
                    badge: 'text-purple-600 bg-purple-50 border border-purple-100/55'
                };
            default:
                return {
                    icon: ShieldCheck,
                    color: 'text-slate-600 bg-slate-50 border border-slate-100',
                    label: 'System',
                    badge: 'text-slate-600 bg-slate-50 border border-slate-100/55'
                };
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 font-outfit">Audit Trail & Logs</h2>
                <p className="text-sm text-slate-500 mt-0.5 font-sans">Catatan riwayat aktivitas operasional sistem terenkripsi dan tidak dapat diubah (immutable).</p>
            </div>

            {error && (
                <div className="p-4 rounded-2xl flex items-center space-x-3 text-xs font-sans bg-rose-50 text-rose-800 border border-rose-200">
                    <Warning size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white/80 backdrop-blur border border-slate-200/60 rounded-3xl p-6 shadow-sm font-sans space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-slate-500 text-xs">Memuat data...</div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">Belum ada catatan aktivitas.</div>
                ) : (
                    activities.map((act) => {
                        const style = getIconClass(act.action);
                        const Icon = style.icon;
                        return (
                            <div 
                                key={act.id} 
                                className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-white/40 hover:bg-white/95 border border-slate-100 rounded-2xl transition-all duration-200 group"
                            >
                                <div className="flex items-center space-x-3.5">
                                    <div className={`p-2 rounded-xl ${style.color} transition-transform group-hover:scale-105`}>
                                        <Icon size={16} weight="bold" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                            {act.description}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1 text-[0.7rem] text-slate-400">
                                            <span className="font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {act.ip_address || '127.0.0.1'}
                                            </span>
                                            <span>&bull;</span>
                                            <span>LEXA Secure Server SHA-256</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end space-x-3.5 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <span className={`${style.badge} text-[0.65rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider`}>
                                        {style.label}
                                    </span>
                                     <span className="text-xs text-slate-400 font-medium text-right">
                                         {act.created_at ? `${new Date(act.created_at).toLocaleString('id-ID', {
                                             day: 'numeric',
                                             month: 'short',
                                             year: 'numeric',
                                             hour: '2-digit',
                                             minute: '2-digit'
                                         })} WIB` : `${act.date || 'Hari ini'}, ${act.time || ''}`}
                                     </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
