import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Upload, 
    Trash, 
    MagnifyingGlass, 
    File, 
    CheckCircle, 
    Clock, 
    XCircle,
    Copy,
    ShieldCheck,
    Warning
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';


export default function Documents() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    // Available users for Target Signer
    const [availableUsers, setAvailableUsers] = useState([]);

    // Upload form state
    const [fileTitle, setFileTitle] = useState('');
    const [docType, setDocType] = useState('General');
    const [selectedFile, setSelectedFile] = useState(null);
    const [targetSigners, setTargetSigners] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Verification state
    const [verifyFile, setVerifyFile] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('list');

    const fetchDocuments = () => {
        setLoading(true);
        setTimeout(() => {
            // Load existing docs or initialize empty
            let storedDocs = JSON.parse(localStorage.getItem('lexa_mock_docs') || 'null');
            if (storedDocs === null) {
                storedDocs = [];
                localStorage.setItem('lexa_mock_docs', JSON.stringify(storedDocs));
            }
            // Sort by newest first
            storedDocs.sort((a, b) => b.id - a.id);
            setDocuments(storedDocs);
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchDocuments();
        
        // Load available users
        const defaultUsers = [
            { id: 1, name: 'Administrator', email: 'admin@lexa.com' },
            { id: 2, name: 'Rizky Pratama', email: 'user@lexa.com' }
        ];
        const registeredUsers = JSON.parse(localStorage.getItem('lexa_registered_users') || '[]');
        
        // Combine and exclude current user
        const allUsers = [...defaultUsers, ...registeredUsers].filter(u => u.email !== user?.email);
        setAvailableUsers(allUsers);
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!fileTitle) {
                setFileTitle(file.name);
            }
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setUploading(true);

        try {
            await new Promise(r => setTimeout(r, 800));
            
            const storedDocs = JSON.parse(localStorage.getItem('lexa_mock_docs') || '[]');
            const newDoc = {
                id: Date.now(),
                title: fileTitle,
                type: docType,
                status: 'pending',
                uploaded_by: { name: user.name, email: user.email },
                target_signers: targetSigners.map(email => ({ email, status: 'pending' })),
                date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            
            storedDocs.push(newDoc);
            localStorage.setItem('lexa_mock_docs', JSON.stringify(storedDocs));
            
            setSuccess('Dokumen berhasil diunggah & dikirim ke penandatangan!');
            setFileTitle('');
            setSelectedFile(null);
            
            fetchDocuments();
            
            setTimeout(() => {
                setShowUploadModal(false);
                setSuccess('');
            }, 1500);
        } catch (err) {
            setError('Gagal mengunggah dokumen.');
        } finally {
            setUploading(false);
        }
    };

    const handleUseTemplate = async (templateName) => {
        try {
            setLoading(true);
            await new Promise(r => setTimeout(r, 500));
            // Just open modal with prefilled title
            setShowUploadModal(true);
            setFileTitle(templateName);
        } catch (err) {
            alert('Gagal membuat dokumen dari template.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
        try {
            let storedDocs = JSON.parse(localStorage.getItem('lexa_mock_docs') || '[]');
            storedDocs = storedDocs.filter(d => d.id !== id);
            localStorage.setItem('lexa_mock_docs', JSON.stringify(storedDocs));
            fetchDocuments();
        } catch (err) {
            alert('Gagal menghapus dokumen.');
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        if (!verifyFile) return;

        setVerifying(true);
        setVerifyResult(null);

        try {
            await new Promise(r => setTimeout(r, 1000));
            setVerifyResult({
                verified: true,
                title: verifyFile.name,
                signer: 'Budi Santoso',
                email: 'budi@lexa.com',
                timestamp: new Date().toLocaleString(),
                ca: 'LEXA Root CA'
            });
        } catch (err) {
            setVerifyResult({
                verified: false,
                message: 'Gagal melakukan verifikasi dokumen.'
            });
        } finally {
            setVerifying(false);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                              doc.type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto dot-pattern">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveSubTab('list')}
                    className={`pb-3 text-sm font-bold font-outfit border-b-2 px-4 transition-colors cursor-pointer ${
                        activeSubTab === 'list' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Semua Dokumen
                </button>
                <button 
                    onClick={() => setActiveSubTab('verify')}
                    className={`pb-3 text-sm font-bold font-outfit border-b-2 px-4 transition-colors cursor-pointer ${
                        activeSubTab === 'verify' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Verifikasi Dokumen (TTE)
                </button>
            </div>

            {activeSubTab === 'list' ? (
                <>
                    {/* Control Panel */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Search and Filter */}
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <MagnifyingGlass size={16} />
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Cari dokumen..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-sans"
                                />
                            </div>
                            
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-white border border-slate-200 rounded-2xl py-2 px-3 text-xs text-slate-600 focus:outline-none shadow-sm cursor-pointer font-sans"
                            >
                                <option value="all">Semua Status</option>
                                <option value="signed">Signed</option>
                                <option value="pending">Pending</option>
                                <option value="draft">Draft</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                            <button 
                                onClick={() => setShowUploadModal(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1 cursor-pointer font-sans"
                            >
                                <Upload size={14} weight="bold" />
                                <span>Unggah Dokumen</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Templates Panel */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-outfit">Gunakan Template Dokumen</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { name: 'NDA Kerjasama Developer', desc: 'Non-Disclosure Agreement standar developer dan agensi.' },
                                { name: 'Surat Perjanjian Kerja Sama (PKS)', desc: 'Kerja sama antar instansi dengan pasal-pasal pembagian hasil.' },
                                { name: 'SOP Operasional Internal', desc: 'Standar Operasional Prosedur untuk tim teknis.' }
                            ].map((tpl) => (
                                <div 
                                    key={tpl.name}
                                    onClick={() => handleUseTemplate(tpl.name)}
                                    className="p-4 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between hover-lift group"
                                >
                                    <div>
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                                            <Copy size={16} />
                                        </div>
                                        <h5 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors font-outfit">{tpl.name}</h5>
                                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-sans">{tpl.desc}</p>
                                    </div>
                                    <div className="text-[9px] font-semibold text-indigo-600 mt-4 flex items-center space-x-0.5 font-sans">
                                        <span>Gunakan Template</span>
                                        <span>&rarr;</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Table list */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500 text-xs font-sans">Loading documents...</div>
                        ) : filteredDocs.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs font-sans">Tidak ada dokumen yang ditemukan.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs font-sans">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                            <th className="pb-3 font-semibold text-[10px]">Nama Dokumen</th>
                                            <th className="pb-3 font-semibold text-[10px]">Tipe</th>
                                            <th className="pb-3 font-semibold text-[10px]">Pengunggah</th>
                                            <th className="pb-3 font-semibold text-[10px]">Status</th>
                                            <th className="pb-3 font-semibold text-[10px]">Target Signer</th>
                                            <th className="pb-3 font-semibold text-[10px] text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredDocs.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3.5 font-medium text-slate-800 max-w-[200px] truncate">{doc.title}</td>
                                                <td className="py-3.5 text-slate-500">{doc.type}</td>
                                                <td className="py-3.5 text-slate-500 font-medium">{doc.uploaded_by?.name || 'Administrator'}</td>
                                                <td className="py-3.5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                        doc.status === 'signed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                        doc.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                        doc.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        'bg-slate-100 text-slate-600 border border-slate-200/50'
                                                    }`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-slate-500 text-[10px]">
                                                    {doc.target_signers ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {doc.target_signers.map((ts, i) => (
                                                                <span key={i} className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${ts.status === 'signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {ts.email.split('@')[0]}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : doc.target_signer_email ? (
                                                        doc.target_signer_email
                                                    ) : '-'}
                                                </td>
                                                <td className="py-3.5 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                                        title="Hapus"
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
                </>
            ) : (
                /* Verification Tab */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Form Upload */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                                <ShieldCheck size={20} weight="fill" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 font-outfit">Verifikasi Keabsahan Dokumen</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed font-sans">
                            Unggah dokumen PDF bertanda tangan digital (TTE) untuk memverifikasi keabsahan penanda tangan, otoritas penerbit sertifikat (CA), serta keutuhan file.
                        </p>

                        <form onSubmit={handleVerifySubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-slate-50/50">
                                <input 
                                    type="file" 
                                    required 
                                    onChange={(e) => setVerifyFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".pdf"
                                />
                                <div className="space-y-2">
                                    <Upload size={32} className="mx-auto text-slate-400" />
                                    <p className="text-xs font-semibold text-slate-700 font-sans">
                                        {verifyFile ? verifyFile.name : 'Pilih file PDF Dokumen'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-sans">PDF maks. 10MB</p>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={verifying || !verifyFile}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer text-xs font-sans"
                            >
                                {verifying ? 'Sedang Memproses...' : 'Mulai Verifikasi Dokumen'}
                            </button>
                        </form>
                    </div>

                    {/* Result */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
                        {!verifyResult ? (
                            <div className="my-auto text-center text-slate-400 text-xs py-8 font-sans">
                                Hasil verifikasi dokumen Anda akan ditampilkan di sini setelah proses analisis selesai.
                            </div>
                        ) : verifyResult.verified ? (
                            <div className="space-y-4 text-left">
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start space-x-2">
                                    <CheckCircle size={20} weight="fill" className="flex-shrink-0 text-emerald-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold font-outfit">Dokumen Terverifikasi Sah!</h4>
                                        <p className="text-[10px] text-emerald-700/80 mt-0.5 leading-relaxed font-sans">
                                            Dokumen terdaftar resmi dan tanda tangan digital terbukti valid serta tidak mengalami modifikasi.
                                        </p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100 text-[11px] font-sans">
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-400">Judul Dokumen</span>
                                        <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{verifyResult.title}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-400">Penanda Tangan</span>
                                        <span className="font-semibold text-slate-800 text-right">{verifyResult.signer}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-400">Email</span>
                                        <span className="font-semibold text-slate-800 text-right">{verifyResult.email}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-400">Waktu TTE</span>
                                        <span className="font-semibold text-slate-800 text-right">{verifyResult.timestamp}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-400">Otoritas Otorisasi (CA)</span>
                                        <span className="font-semibold text-slate-800 text-right text-indigo-600">{verifyResult.ca}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-left">
                                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start space-x-2">
                                    <XCircle size={20} weight="fill" className="flex-shrink-0 text-rose-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold font-outfit">Verifikasi Gagal</h4>
                                        <p className="text-[10px] text-rose-700/80 mt-0.5 leading-relaxed font-sans">
                                            {verifyResult.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                        <h3 className="text-base font-bold text-slate-900 font-outfit mb-4">Unggah Dokumen Baru</h3>
                        
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

                        <form onSubmit={handleUploadSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Nama/Judul Dokumen</label>
                                <input 
                                    type="text"
                                    value={fileTitle}
                                    onChange={(e) => setFileTitle(e.target.value)}
                                    placeholder="Draft Perjanjian PKS.pdf"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Kategori</label>
                                    <select 
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none font-sans cursor-pointer"
                                    >
                                        <option value="General">General (Umum)</option>
                                        <option value="Kontrak">Kontrak Perjanjian</option>
                                        <option value="SOP">SOP & Panduan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Target Penanda Tangan (Multi)</label>
                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                                        {availableUsers.map(u => (
                                            <label key={u.email} className="flex items-center space-x-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    value={u.email}
                                                    checked={targetSigners.includes(u.email)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setTargetSigners([...targetSigners, u.email]);
                                                        } else {
                                                            setTargetSigners(targetSigners.filter(email => email !== u.email));
                                                        }
                                                    }}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-xs text-slate-700">{u.name} <span className="text-[9px] text-slate-400">({u.email})</span></span>
                                            </label>
                                        ))}
                                        {availableUsers.length === 0 && <p className="text-xs text-slate-400">Tidak ada user lain.</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">File PDF</label>
                                <input 
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 font-sans cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center space-x-3 pt-3 font-sans">
                                <button 
                                    type="submit" 
                                    disabled={uploading || targetSigners.length === 0}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    {uploading ? 'Mengunggah...' : 'Kirim & Minta TTE'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowUploadModal(false)}
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
