import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { 
    UsersThree, 
    Plus, 
    Trash, 
    UserPlus, 
    UserMinus, 
    Info 
} from '@phosphor-icons/react';

export default function Teams() {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');
    
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [memberRole, setMemberRole] = useState('Member');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getUserAvatar = (member) => {
        if (!member) return '';
        const u = users.find(usr => usr.id === parseInt(member.id) || usr.email?.toLowerCase() === member.email?.toLowerCase());
        return u?.avatar || '';
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await fetch(`${API_URL}/api/auth/users`, {
                credentials: 'include' // PERBAIKAN
            });
            if (usersRes.ok) {
                const allUsers = await usersRes.json();
                setUsers(allUsers);
            }

            const teamsRes = await fetch(`${API_URL}/api/teams`, {
                credentials: 'include' // PERBAIKAN
            });
            if (teamsRes.ok) {
                const storedTeams = await teamsRes.json();
                setTeams(storedTeams);

                if (selectedTeam) {
                    const refreshed = storedTeams.find(t => t.id === selectedTeam.id);
                    if (refreshed) {
                        setSelectedTeam(refreshed);
                    }
                }
            }
        } catch (err) {
            setError('Gagal menghubungkan ke database server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
        const response = await fetch(`${API_URL}/api/teams`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newTeamName, description: newTeamDesc })
        });

        if (response.ok) {
            setSuccess('Tim berhasil dibuat!');
            setNewTeamName('');
            setNewTeamDesc('');
            fetchData();
            setTimeout(() => {
                setShowCreateModal(false);
                setSuccess('');
            }, 1000);
        } else {
            setError('Gagal menyimpan tim ke database.');
        }
    } catch (err) {
        setError('Gagal menghubungkan ke database server.');
    }
};

const handleDeleteTeam = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tim ini beserta seluruh anggotanya?')) return;
    try {
        const response = await fetch(`${API_URL}/api/teams/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            setSelectedTeam(null);
            fetchData();
        } else {
            alert('Gagal menghapus tim dari database.');
        }
    } catch (err) {
        alert('Gagal menghapus tim.');
    }
};

const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
        const response = await fetch(`${API_URL}/api/teams/${selectedTeam.id}/members`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: selectedUserId, role: memberRole })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            setSuccess('Anggota berhasil ditambahkan ke tim!');
            setSelectedUserId('');
            fetchData();
            setTimeout(() => {
                setShowAddMemberModal(false);
                setSuccess('');
            }, 1000);
        } else {
            setError(data.message || 'Gagal menambahkan anggota.');
        }
    } catch (err) {
        setError('Gagal menambahkan anggota.');
    }
};

const handleRemoveMember = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin mengeluarkan anggota ini dari tim?')) return;
    try {
        const response = await fetch(`${API_URL}/api/teams/${selectedTeam.id}/members/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            fetchData();
        } else {
            alert('Gagal mengeluarkan anggota.');
        }
    } catch (err) {
        alert('Gagal mengeluarkan anggota.');
    }
};

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto dot-pattern">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <UsersThree size={20} className="text-indigo-600" />
                            <h3 className="text-sm font-bold text-slate-800 font-outfit">Daftar Tim</h3>
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors cursor-pointer"
                            title="Buat Tim Baru"
                        >
                            <Plus size={16} weight="bold" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-6 text-slate-400 text-xs">Loading teams...</div>
                    ) : teams.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">Belum ada tim yang dibuat.</div>
                    ) : (
                        <div className="space-y-1.5">
                            {teams.map((t) => (
                                <div 
                                    key={t.id}
                                    onClick={() => setSelectedTeam(t)}
                                    className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                                        selectedTeam?.id === t.id 
                                            ? 'bg-indigo-50/50 border border-indigo-100/50 text-indigo-900' 
                                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                                    }`}
                                >
                                    <div className="truncate pr-2">
                                        <h4 className="text-xs font-bold truncate leading-tight font-outfit">{t.name}</h4>
                                        <span className="text-[10px] text-slate-400 leading-none">{t.members?.length || 0} Anggota</span>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTeam(t.id);
                                        }}
                                        className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                        title="Hapus Tim"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm lg:col-span-2 min-h-100 flex flex-col">
                    {!selectedTeam ? (
                        <div className="my-auto text-center text-slate-400 text-xs py-8">
                            <Info size={32} className="mx-auto text-slate-300 mb-2" />
                            Silakan pilih tim dari daftar di sebelah kiri atau buat tim baru untuk mengelola anggota.
                        </div>
                    ) : (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 font-outfit">{selectedTeam.name}</h3>
                                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{selectedTeam.description || 'Tidak ada deskripsi tim.'}</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowAddMemberModal(true)}
                                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                                    >
                                        <UserPlus size={14} />
                                        <span>Tambah Anggota</span>
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Anggota Tim ({selectedTeam.members?.length || 0})</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                                    <th className="pb-2 font-semibold text-[10px]">Nama</th>
                                                    <th className="pb-2 font-semibold text-[10px]">Email</th>
                                                    <th className="pb-2 font-semibold text-[10px]">Peran (Role)</th>
                                                    <th className="pb-2 font-semibold text-[10px] text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {selectedTeam.members?.map((m) => (
                                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-2.5">
                                                            <div className="flex items-center space-x-2.5">
                                                                <img 
                                                                    className="w-6 h-6 rounded-full border border-slate-200 object-cover shadow-sm"
                                                                    src={getUserAvatar(m) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=bfdbfe&color=1e3a8a&bold=true`}
                                                                    alt="Member"
                                                                />
                                                                <span className="font-semibold text-slate-850">{m.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 text-slate-500 font-mono">{m.email}</td>
                                                        <td className="py-2.5">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                                m.pivot?.role === 'Leader' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                                'bg-slate-50 text-slate-600 border border-slate-200/50'
                                                            }`}>
                                                                {m.pivot?.role || 'Member'}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 text-right">
                                                            {m.pivot?.role !== 'Leader' && (
                                                                <button 
                                                                    onClick={() => handleRemoveMember(m.id)}
                                                                    className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                                                    title="Keluarkan dari tim"
                                                                >
                                                                    <UserMinus size={14} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                        <h3 className="text-base font-bold text-slate-900 font-outfit mb-4">Buat Tim Baru</h3>
                        
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

                        <form onSubmit={handleCreateTeam} className="space-y-4 text-left">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Nama Tim</label>
                                <input 
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="Tim Legal & Kemitraan"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Deskripsi</label>
                                <textarea 
                                    value={newTeamDesc}
                                    onChange={(e) => setNewTeamDesc(e.target.value)}
                                    placeholder="Grup kolaborasi penandatanganan dokumen legal eksternal."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                                />
                            </div>

                            <div className="flex items-center space-x-3 pt-3 font-sans">
                                <button 
                                    type="submit" 
                                    disabled={!newTeamName}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    Buat Tim
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddMemberModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                        <h3 className="text-base font-bold text-slate-900 font-outfit mb-4">Tambah Anggota ke Tim</h3>
                        
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

                        <form onSubmit={handleAddMember} className="space-y-4 text-left">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Pilih Pengguna</label>
                                <select 
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none font-sans cursor-pointer"
                                >
                                    <option value="">-- Pilih Pengguna --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Peran di Tim (Role)</label>
                                <select 
                                    value={memberRole}
                                    onChange={(e) => setMemberRole(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none font-sans cursor-pointer"
                                >
                                    <option value="Member">Member (Anggota)</option>
                                    <option value="Reviewer">Reviewer (Pemeriksa)</option>
                                    <option value="Approver">Approver (Penyetuju)</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-3 pt-3 font-sans">
                                <button 
                                    type="submit" 
                                    disabled={!selectedUserId}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    Tambah Anggota
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddMemberModal(false)}
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