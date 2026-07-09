import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { 
    Signature, 
    Plus, 
    Clock, 
    PenNib,
    ArrowUpRight
} from '@phosphor-icons/react';


export default function Signatures() {
    const { user, updateUser } = useAuth();
    const [signatures, setSignatures] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    
    // Setup Signature Modal State
    const [showSignatureSetupModal, setShowSignatureSetupModal] = useState(false);
    const [pendingSignId, setPendingSignId] = useState(null);
    const canvasRef = React.useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Form state
    const [selectedDocId, setSelectedDocId] = useState('');
    const [selectedSignerId, setSelectedSignerId] = useState('');
    const [requesting, setRequesting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            // Load documents from backend
            const docsRes = await fetch(`${API_URL}/api/documents`);
            if (docsRes.ok) {
                const data = await docsRes.json();
                setSignatures(data);
                
                // Available docs to request signature (not signed yet and uploaded by current user)
                setDocuments(data.filter(d => d.status !== 'signed' && d.uploaded_by_email === user?.email));
            }

            // Load users list
            const usersRes = await fetch(`${API_URL}/api/auth/users`);
            if (usersRes.ok) {
                const allUsers = await usersRes.json();
                setUsers(allUsers.filter(u => u.email !== user?.email));
            }
        } catch (err) {
            console.error('Error fetching data for signatures:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setRequesting(true);

        try {
            const response = await fetch(`${API_URL}/api/documents/${selectedDocId}/request-signer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: selectedSignerId })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                // Log action to activities table
                await fetch(`${API_URL}/api/activities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_name: user?.name || 'User',
                        action: 'request',
                        description: `meminta tanda tangan dari ${selectedSignerId} untuk dokumen ID ${selectedDocId}`
                    })
                });

                setSuccess('Permintaan tanda tangan berhasil dikirim!');
                setSelectedDocId('');
                setSelectedSignerId('');
                fetchData();
                setTimeout(() => {
                    setShowRequestModal(false);
                    setSuccess('');
                }, 1500);
            } else {
                setError(data.message || 'Gagal mengirim permintaan tanda tangan.');
            }
        } catch (err) {
            setError('Gagal terhubung ke database server.');
        } finally {
            setRequesting(false);
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const endDrawing = () => {
        setIsDrawing(false);
    };

    const handleSaveSignature = (type) => {
        if (type === 'draw') {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const dataUrl = canvas.toDataURL('image/png');
            updateUser({ visual_signature: dataUrl });
        }
        setShowSignatureSetupModal(false);
        if (pendingSignId) {
            performSign(pendingSignId);
            setPendingSignId(null);
        }
    };

    const handleClearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleUploadSignature = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'image/png') {
            const reader = new FileReader();
            reader.onload = (event) => {
                updateUser({ visual_signature: event.target.result });
                setShowSignatureSetupModal(false);
                if (pendingSignId) {
                    performSign(pendingSignId);
                    setPendingSignId(null);
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert('Harap unggah file PNG.');
        }
    };

    const handleSign = async (id) => {
        if (!user?.visual_signature) {
            setPendingSignId(id);
            setShowSignatureSetupModal(true);
            return;
        }
        
        if (!confirm('Apakah Anda yakin ingin menandatangani dokumen ini secara digital?')) return;
        
        await performSign(id);
    };

    const performSign = async (id) => {
        try {
            setLoading(true);
            
            const response = await fetch(`${API_URL}/api/documents/${id}/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                // Log action to activities table
                await fetch(`${API_URL}/api/activities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_name: user?.name || 'User',
                        action: 'signed',
                        description: `menandatangani dokumen ID ${id}`
                    })
                });

                fetchData();
            } else {
                alert('Gagal menandatangani dokumen.');
            }
        } catch (err) {
            console.error('Error signing document:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const myPendingSignatures = signatures.filter(s => {
        const userEmail = user?.email?.toLowerCase();
        if (s.target_signers) {
            return s.status === 'pending' && s.target_signers.some(ts => ts.email.toLowerCase() === userEmail && ts.status === 'pending');
        }
        return s.target_signer_email?.toLowerCase() === userEmail && s.status === 'pending';
    });

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto dot-pattern">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 font-outfit">Permintaan Tanda Tangan Digital</h3>
                    <p className="text-xs text-slate-500">Kelola dokumen yang memerlukan verifikasi tanda tangan digital Anda maupun anggota tim.</p>
                </div>
                <button 
                    onClick={() => setShowRequestModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1 cursor-pointer font-sans"
                >
                    <Plus size={14} weight="bold" />
                    <span>Minta Tanda Tangan</span>
                </button>
            </div>
            
            {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] p-3 rounded-xl mb-4 font-sans max-w-lg mx-auto text-center">
                    {success}
                </div>
            )}

            {/* My Pending Action Box */}
            {myPendingSignatures.length > 0 && (
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                            <Clock size={20} weight="fill" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 font-outfit">Menunggu Persetujuan Anda ({myPendingSignatures.length})</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Segera verifikasi dan tandatangani dokumen berikut dengan sertifikat digital Anda.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myPendingSignatures.map((sig) => (
                            <div key={sig.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col justify-between hover-lift">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full uppercase font-sans">
                                            {sig.type || 'General'}
                                        </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-800 leading-snug font-outfit truncate">{sig.title}</h5>
                                    <p className="text-[10px] text-slate-500 mt-1 font-sans">Diminta oleh: <span className="font-semibold text-slate-700">{sig.uploaded_by?.name || 'Administrator'} ({sig.uploaded_by?.email})</span></p>
                                </div>
                                <button 
                                    onClick={() => handleSign(sig.id)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs mt-4 transition-colors flex items-center justify-center space-x-1 cursor-pointer font-sans"
                                >
                                    <Signature size={14} weight="bold" />
                                    <span>Tandatangani Sekarang (TTE)</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* General Log / Other Signatures */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-outfit">Log Status Tanda Tangan</h4>
                
                {loading ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-sans">Loading signatures...</div>
                ) : signatures.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-sans">Tidak ada catatan dokumen / tanda tangan.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-sans">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                    <th className="pb-3 font-semibold text-[10px]">Nama Dokumen</th>
                                    <th className="pb-3 font-semibold text-[10px]">Target TTE</th>
                                    <th className="pb-3 font-semibold text-[10px]">Tanggal TTE</th>
                                    <th className="pb-3 font-semibold text-[10px]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {signatures.map((sig) => (
                                    <tr key={sig.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 font-medium text-slate-800 max-w-[220px] truncate">
                                            {sig.title} <br/>
                                            <span className="text-[9px] text-slate-400 font-normal">Dari: {sig.uploaded_by?.name}</span>
                                        </td>
                                        <td className="py-3.5 text-slate-600 font-medium">
                                            {sig.target_signers ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {sig.target_signers.map((ts, i) => (
                                                        <span key={i} className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${ts.status === 'signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            {ts.email.split('@')[0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                sig.target_signer_email || '-'
                                            )}
                                        </td>
                                        <td className="py-3.5 text-slate-500 font-sans">
                                            {sig.signed_at ? new Date(sig.signed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                sig.status === 'signed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                                {sig.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Request Signature Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                        <h3 className="text-base font-bold text-slate-900 font-outfit mb-4">Kirim Ulang Permintaan TTE</h3>
                        
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

                        <form onSubmit={handleRequestSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Pilih Dokumen Anda</label>
                                <select 
                                    value={selectedDocId}
                                    onChange={(e) => setSelectedDocId(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none font-sans cursor-pointer"
                                >
                                    <option value="">-- Pilih Dokumen --</option>
                                    {documents.map(doc => (
                                        <option key={doc.id} value={doc.id}>{doc.title} ({doc.status})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Ubah Penanda Tangan</label>
                                <select 
                                    value={selectedSignerId}
                                    onChange={(e) => setSelectedSignerId(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none font-sans cursor-pointer"
                                >
                                    <option value="">-- Pilih User --</option>
                                    {users.map(u => (
                                        <option key={u.email} value={u.email}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-3 pt-3 font-sans">
                                <button 
                                    type="submit" 
                                    disabled={requesting || !selectedDocId || !selectedSignerId}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    {requesting ? 'Mengirim...' : 'Kirim Permintaan'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowRequestModal(false)}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Signature Setup Modal */}
            {showSignatureSetupModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative">
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-slate-900 font-outfit">Buat Tanda Tangan Visual Anda</h3>
                            <p className="text-xs text-slate-500 font-sans mt-0.5">Anda belum memiliki tanda tangan. Buat atau unggah sekarang untuk dapat menandatangani dokumen.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Draw Canvas Area */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Gambar Tanda Tangan</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-2 bg-slate-50 relative h-40 flex items-center justify-center flex-col text-slate-400 hover:border-indigo-300 transition-colors cursor-crosshair overflow-hidden">
                                    <canvas 
                                        ref={canvasRef}
                                        width={400}
                                        height={150}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={endDrawing}
                                        onMouseLeave={endDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={endDrawing}
                                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                                    />
                                    <p className="text-[10px] font-semibold font-sans mt-2 pointer-events-none">Area Gambar Tanda Tangan</p>
                                </div>
                                <div className="flex space-x-2 font-sans">
                                    <button 
                                        onClick={() => handleSaveSignature('draw')}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Simpan & Lanjutkan
                                    </button>
                                    <button 
                                        onClick={handleClearSignature}
                                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>

                            {/* Upload File Area */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Unggah File (PNG Transparan)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 h-40 flex flex-col items-center justify-center relative hover:border-indigo-300 transition-colors cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/png"
                                        onChange={handleUploadSignature}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                        <ArrowUpRight size={20} weight="bold" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 font-sans">Pilih File PNG</p>
                                    <p className="text-[9px] text-slate-400 mt-1 font-sans">Otomatis tersimpan & lanjut</p>
                                </div>
                                <div className="pt-0.5">
                                    <button 
                                        onClick={() => setShowSignatureSetupModal(false)}
                                        className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition-colors cursor-pointer font-sans"
                                    >
                                        Batal & Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
