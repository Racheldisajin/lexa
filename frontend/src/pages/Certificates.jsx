import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash, 
    ShieldCheck
} from '@phosphor-icons/react';


export default function Certificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showIssueModal, setShowIssueModal] = useState(false);

    const [certSource, setCertSource] = useState('generate');
    const [certName, setCertName] = useState('');
    const [holder, setHolder] = useState('');
    const [validity, setValidity] = useState('1 Tahun');
    const [issuing, setIssuing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchCertificates = () => {
        setLoading(true);
        setTimeout(() => {
            const stored = JSON.parse(localStorage.getItem('lexa_certificates') || 'null');
            if (stored === null) {
                localStorage.setItem('lexa_certificates', JSON.stringify([]));
                setCertificates([]);
            } else {
                setCertificates(stored);
            }
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIssuing(true);

        try {
            await new Promise(r => setTimeout(r, 500));
            
            // Create a mock new certificate
            const newCert = {
                id: Date.now(),
                name: certSource === 'generate' ? certName : 'Sertifikat Eksternal (Upload)',
                holder: holder,
                issued_at: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                valid_until: new Date(Date.now() + (validity.includes('90') ? 90 : validity.includes('2') ? 730 : 365) * 86400000).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                status: 'valid'
            };
            
            const stored = JSON.parse(localStorage.getItem('lexa_certificates') || '[]');
            const updated = [...stored, newCert];
            localStorage.setItem('lexa_certificates', JSON.stringify(updated));
            setCertificates(updated);
            setSuccess('Sertifikat berhasil diterbitkan secara sah!');
            
            setTimeout(() => {
                setShowIssueModal(false);
                setSuccess('');
                setCertName('');
                setHolder('');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menerbitkan sertifikat.');
        } finally {
            setIssuing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin mencabut/menghapus sertifikat ini?')) return;
        try {
            await new Promise(r => setTimeout(r, 500));
            const stored = JSON.parse(localStorage.getItem('lexa_certificates') || '[]');
            const updated = stored.filter(c => c.id !== id);
            localStorage.setItem('lexa_certificates', JSON.stringify(updated));
            setCertificates(updated);
        } catch (err) {
            alert('Gagal mencabut sertifikat.');
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto dot-pattern">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 font-outfit">Sertifikat Otoritas Jaringan (CA)</h3>
                    <p className="text-xs text-slate-500">Kelola dan terbitkan sertifikat digital untuk mengesahkan penandatanganan dokumen TTE Anda.</p>
                </div>
                <button 
                    onClick={() => setShowIssueModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1 cursor-pointer font-sans"
                >
                    <Plus size={14} weight="bold" />
                    <span>Terbitkan Sertifikat</span>
                </button>
            </div>

            {/* List Table */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-outfit">Daftar Sertifikat Aktif</h4>
                
                {loading ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-sans">Loading certificates...</div>
                ) : certificates.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-sans">Tidak ada sertifikat aktif.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-sans">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                    <th className="pb-3 font-semibold text-[10px]">Nama Sertifikat</th>
                                    <th className="pb-3 font-semibold text-[10px]">Pemegang (Holder)</th>
                                    <th className="pb-3 font-semibold text-[10px]">Tanggal Terbit</th>
                                    <th className="pb-3 font-semibold text-[10px]">Berlaku Hingga</th>
                                    <th className="pb-3 font-semibold text-[10px]">Status</th>
                                    <th className="pb-3 font-semibold text-[10px] text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {certificates.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 font-medium text-slate-800 flex items-center space-x-2">
                                            <ShieldCheck size={16} weight="fill" className="text-emerald-600" />
                                            <span className="truncate max-w-[180px]">{cert.name}</span>
                                        </td>
                                        <td className="py-3.5 text-slate-600 font-medium">{cert.holder}</td>
                                        <td className="py-3.5 text-slate-500 font-sans">{cert.issued_at}</td>
                                        <td className="py-3.5 text-slate-500 font-sans">{cert.valid_until}</td>
                                        <td className="py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                cert.status === 'valid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                cert.status === 'expiring_soon' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-right">
                                            <button 
                                                onClick={() => handleDelete(cert.id)}
                                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                                title="Cabut Sertifikat"
                                            >
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

            {/* Issue/Upload Certificate Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                        <h3 className="text-base font-bold text-slate-900 font-outfit mb-4">Tambahkan Sertifikat Digital</h3>
                        
                        {/* Tabs for Generate vs Upload */}
                        <div className="flex border-b border-slate-200 mb-6">
                            <button 
                                onClick={() => setCertSource('generate')}
                                className={`flex-1 pb-3 text-xs font-bold font-outfit border-b-2 transition-colors cursor-pointer ${
                                    certSource === 'generate' 
                                        ? 'border-indigo-600 text-indigo-600' 
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                Generate Sistem
                            </button>
                            <button 
                                onClick={() => setCertSource('upload')}
                                className={`flex-1 pb-3 text-xs font-bold font-outfit border-b-2 transition-colors cursor-pointer ${
                                    certSource === 'upload' 
                                        ? 'border-indigo-600 text-indigo-600' 
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                Unggah Eksternal
                            </button>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[11px] p-3 rounded-xl mb-4 font-sans">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] p-3 rounded-xl mb-4 font-sans">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleIssueSubmit} className="space-y-4 text-left">
                            {certSource === 'generate' ? (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Nama Sertifikat</label>
                                        <input 
                                            type="text"
                                            value={certName}
                                            onChange={(e) => setCertName(e.target.value)}
                                            placeholder="Sertifikat TTE Personal - Mandiri"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Nama Pemilik (Holder Name)</label>
                                        <input 
                                            type="text"
                                            value={holder}
                                            onChange={(e) => setHolder(e.target.value)}
                                            placeholder="Rizky Pratama"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Masa Berlaku</label>
                                        <select 
                                            value={validity}
                                            onChange={(e) => setValidity(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none font-sans cursor-pointer"
                                        >
                                            <option value="90 Hari">90 Hari (Uji Coba)</option>
                                            <option value="1 Tahun">1 Tahun (Standar)</option>
                                            <option value="2 Tahun">2 Tahun (Lanjutan)</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">File Sertifikat (.p12 / .pem / .crt)</label>
                                        <input 
                                            type="file"
                                            accept=".p12,.pem,.crt"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 font-sans cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Nama Pemilik (Holder Name)</label>
                                        <input 
                                            type="text"
                                            value={holder}
                                            onChange={(e) => setHolder(e.target.value)}
                                            placeholder="PT. External CA"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-center space-x-3 pt-3 font-sans">
                                <button 
                                    type="submit" 
                                    disabled={issuing || !holder || (certSource === 'generate' && !certName)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    {issuing ? 'Memproses...' : (certSource === 'generate' ? 'Terbitkan Sekarang' : 'Unggah Sertifikat')}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowIssueModal(false)}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
