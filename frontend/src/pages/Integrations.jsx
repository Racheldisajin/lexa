import React, { useState, useEffect } from 'react';
import { 
    Key, Plus, Trash, ToggleLeft, ToggleRight, Copy, Check, Info 
} from '@phosphor-icons/react';
import API_URL from '../config';

export default function Integrations() {
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [keyName, setKeyName] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedKey, setGeneratedKey] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const fetchApiKeys = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/api-keys`, { credentials: 'include' });
            if (res.ok) {
                setApiKeys(await res.json());
            }
        } catch (err) {
            console.error('Error fetching api keys:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const handleCreateKey = async (e) => {
        e.preventDefault();
        setError('');
        setGenerating(true);

        try {
            const res = await fetch(`${API_URL}/api/api-keys`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: keyName })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setGeneratedKey(data.raw_key);
                setKeyName('');
                fetchApiKeys();
            } else {
                setError(data.message || 'Gagal membuat API Key.');
            }
        } catch (err) {
            setError('Gagal terhubung ke server.');
        } finally {
            setGenerating(false);
        }
    };

    const handleToggleKey = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/api-keys/${id}/toggle`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) fetchApiKeys();
        } catch (err) {
            alert('Gagal memperbarui status API Key.');
        }
    };

    const handleDeleteKey = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus API Key ini?')) return;
        try {
            const res = await fetch(`${API_URL}/api/api-keys/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) fetchApiKeys();
        } catch (err) {
            alert('Gagal menghapus API Key.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto dot-pattern">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 font-outfit">Integrasi API & Kredensial</h3>
                    <p className="text-xs text-slate-500">Gunakan API Key untuk mengintegrasikan sistem tanda tangan digital LEXA ke dalam aplikasi eksternal Anda.</p>
                </div>
                <button 
                    onClick={() => { setGeneratedKey(''); setShowCreateModal(true); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1 cursor-pointer font-sans"
                >
                    <Plus size={14} weight="bold" />
                    <span>Buat API Key Baru</span>
                </button>
            </div>

            {generatedKey && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-3xl space-y-3 max-w-xl">
                    <div className="flex items-center space-x-2">
                        <Info size={18} weight="fill" className="text-emerald-600" />
                        <h4 className="text-xs font-bold font-outfit">Simpan API Key Anda Sekarang!</h4>
                    </div>
                    <p className="text-[10px] text-emerald-700 leading-relaxed font-sans">
                        Demi keamanan, API Key ini hanya akan ditampilkan satu kali ini saja.
                    </p>
                    <div className="flex items-center space-x-2 bg-white border border-emerald-100 p-2.5 rounded-xl">
                        <code className="text-[11px] font-mono text-slate-800 break-all select-all flex-1">{generatedKey}</code>
                        <button onClick={copyToClipboard} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer shrink-0">
                            {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-outfit">Daftar API Key Aktif</h4>
                
                {loading ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-sans">Loading keys...</div>
                ) : apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-sans">Belum ada API Key yang diterbitkan.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-sans">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                    <th className="pb-3 font-semibold text-[10px]">Nama Kunci</th>
                                    <th className="pb-3 font-semibold text-[10px]">Token Key</th>
                                    <th className="pb-3 font-semibold text-[10px]">Terakhir Digunakan</th>
                                    <th className="pb-3 font-semibold text-[10px]">Status</th>
                                    <th className="pb-3 font-semibold text-[10px] text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {apiKeys.map((keyObj) => (
                                    <tr key={keyObj.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 font-medium text-slate-800 flex items-center space-x-2">
                                            <Key size={16} weight="fill" className="text-indigo-600" />
                                            <span>{keyObj.name}</span>
                                        </td>
                                        <td className="py-3.5 text-slate-500 font-mono">
                                            {keyObj.key ? `${keyObj.key.substring(0, 12)}...` : 'lx_live_***'}
                                        </td>
                                        <td className="py-3.5 text-slate-500">
                                            {keyObj.last_used_at ? new Date(keyObj.last_used_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum pernah'}
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                keyObj.status === 'active' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                                            }`}>
                                                {keyObj.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-right flex items-center justify-end space-x-2">
                                            <button onClick={() => handleToggleKey(keyObj.id)} className="p-1 hover:bg-slate-50 text-slate-500 rounded-lg cursor-pointer">
                                                {keyObj.status === 'active' ? <ToggleRight size={22} className="text-indigo-600" /> : <ToggleLeft size={22} className="text-slate-400" />}
                                            </button>
                                            <button onClick={() => handleDeleteKey(keyObj.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer">
                                                <Trash size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                        <h3 className="text-base font-bold text-slate-900 font-outfit mb-4">Buat API Key Baru</h3>
                        {error && <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[11px] p-3 rounded-xl mb-4 font-sans">{error}</div>}
                        <form onSubmit={handleCreateKey} className="space-y-4 text-left">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Nama API Key</label>
                                <input 
                                    type="text"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    placeholder="Production Server - ERP Integration"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                                />
                            </div>
                            <div className="flex items-center space-x-3 pt-3 font-sans">
                                <button type="submit" disabled={generating || !keyName} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                                    {generating ? 'Membuat...' : 'Generate API Key'}
                                </button>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer">
                                    Tutup
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}