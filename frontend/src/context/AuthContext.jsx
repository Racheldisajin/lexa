import React, { createContext, useState, useEffect, useContext } from 'react';
import API_URL from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const storedUser = localStorage.getItem('lexa_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Sync with lexa_active_sessions
            const active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
            if (!active.some(u => u.email.toLowerCase() === parsedUser.email.toLowerCase())) {
                active.push(parsedUser);
                localStorage.setItem('lexa_active_sessions', JSON.stringify(active));
            }

            // Sync with lexa_remembered_users
            const remembered = JSON.parse(localStorage.getItem('lexa_remembered_users') || '[]');
            if (!remembered.some(u => u.email.toLowerCase() === parsedUser.email.toLowerCase())) {
                remembered.push(parsedUser);
                localStorage.setItem('lexa_remembered_users', JSON.stringify(remembered));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const loggedInUser = data.user;
                setUser(loggedInUser);
                localStorage.setItem('lexa_user', JSON.stringify(loggedInUser));

                // Sync to active sessions list
                const active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
                if (!active.some(u => u.email.toLowerCase() === loggedInUser.email.toLowerCase())) {
                    active.push(loggedInUser);
                    localStorage.setItem('lexa_active_sessions', JSON.stringify(active));
                }

                // Sync to remembered users
                const remembered = JSON.parse(localStorage.getItem('lexa_remembered_users') || '[]');
                if (!remembered.some(u => u.email.toLowerCase() === loggedInUser.email.toLowerCase())) {
                    remembered.push(loggedInUser);
                    localStorage.setItem('lexa_remembered_users', JSON.stringify(remembered));
                }
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Email atau password salah.' };
            }
        } catch (err) {
            return { success: false, message: 'Gagal terhubung ke database. Pastikan backend server aktif.' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const userSession = data.user;
                setUser(userSession);
                localStorage.setItem('lexa_user', JSON.stringify(userSession));

                // Sync to active sessions list
                const active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
                if (!active.some(u => u.email.toLowerCase() === userSession.email.toLowerCase())) {
                    active.push(userSession);
                    localStorage.setItem('lexa_active_sessions', JSON.stringify(active));
                }

                // Sync to remembered users
                const remembered = JSON.parse(localStorage.getItem('lexa_remembered_users') || '[]');
                if (!remembered.some(u => u.email.toLowerCase() === userSession.email.toLowerCase())) {
                    remembered.push(userSession);
                    localStorage.setItem('lexa_remembered_users', JSON.stringify(remembered));
                }
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Gagal mendaftar.' };
            }
        } catch (err) {
            return { success: false, message: 'Gagal terhubung ke database. Pastikan backend server aktif.' };
        }
    };

    const logout = (emailToLogout = null) => {
        const targetEmail = emailToLogout || user?.email;
        if (!targetEmail) return;

        let active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
        active = active.filter(u => u.email.toLowerCase() !== targetEmail.toLowerCase());
        localStorage.setItem('lexa_active_sessions', JSON.stringify(active));

        // If the logged out user is the current active user
        if (user && user.email.toLowerCase() === targetEmail.toLowerCase()) {
            if (active.length > 0) {
                // Switch to the first remaining active session
                const nextUser = active[0];
                setUser(nextUser);
                localStorage.setItem('lexa_user', JSON.stringify(nextUser));
            } else {
                // No more active sessions, clear everything
                setUser(null);
                localStorage.removeItem('lexa_user');
                localStorage.removeItem('lexa_active_sessions');
            }
        } else {
            // Trigger a re-render of user to refresh dropdown items
            setUser({ ...user });
        }
    };

    const logoutAll = () => {
        setUser(null);
        localStorage.removeItem('lexa_user');
        localStorage.removeItem('lexa_active_sessions');
    };

    const loginRememberedUser = (email) => {
        const remembered = JSON.parse(localStorage.getItem('lexa_remembered_users') || '[]');
        const targetUser = remembered.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (targetUser) {
            setUser(targetUser);
            localStorage.setItem('lexa_user', JSON.stringify(targetUser));

            // Sync to active sessions
            const active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
            if (!active.some(u => u.email.toLowerCase() === targetUser.email.toLowerCase())) {
                active.push(targetUser);
                localStorage.setItem('lexa_active_sessions', JSON.stringify(active));
            }
            return true;
        }
        return false;
    };

    const removeRememberedUser = (email) => {
        let remembered = JSON.parse(localStorage.getItem('lexa_remembered_users') || '[]');
        remembered = remembered.filter(u => u.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('lexa_remembered_users', JSON.stringify(remembered));

        // Also clean it from active sessions if present
        let active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
        if (active.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            active = active.filter(u => u.email.toLowerCase() !== email.toLowerCase());
            localStorage.setItem('lexa_active_sessions', JSON.stringify(active));
            
            // If the removed user is the current user, log out or switch
            if (user && user.email.toLowerCase() === email.toLowerCase()) {
                if (active.length > 0) {
                    const nextUser = active[0];
                    setUser(nextUser);
                    localStorage.setItem('lexa_user', JSON.stringify(nextUser));
                } else {
                    setUser(null);
                    localStorage.removeItem('lexa_user');
                    localStorage.removeItem('lexa_active_sessions');
                }
            }
        }
    };

    const upgradePlan = async (newPlan) => {
        if (user) {
            try {
                const response = await fetch(`${API_URL}/api/auth/upgrade-plan`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, plan: newPlan })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    const updatedUser = data.user;
                    setUser(updatedUser);
                    localStorage.setItem('lexa_user', JSON.stringify(updatedUser));
                    
                    // Sync inside lexa_active_sessions as well
                    const active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
                    const idx = active.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
                    if (idx !== -1) {
                        active[idx] = updatedUser;
                        localStorage.setItem('lexa_active_sessions', JSON.stringify(active));
                    }
                }
            } catch (err) {
                console.error('Error upgrading plan on backend:', err.message);
            }
        }
    };

    const updateUser = async (updatedFields) => {
        if (user) {
            try {
                const response = await fetch(`${API_URL}/api/auth/user`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, ...updatedFields })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    const updatedUser = data.user;
                    setUser(updatedUser);
                    localStorage.setItem('lexa_user', JSON.stringify(updatedUser));
                    
                    // Sync inside lexa_active_sessions
                    const active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
                    const idx = active.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
                    if (idx !== -1) {
                        active[idx] = updatedUser;
                        localStorage.setItem('lexa_active_sessions', JSON.stringify(active));
                    }
                }
            } catch (err) {
                console.error('Error updating user on backend:', err.message);
            }
        }
    };

    const switchAccount = (email) => {
        const active = JSON.parse(localStorage.getItem('lexa_active_sessions') || '[]');
        const targetUser = active.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (targetUser) {
            setUser(targetUser);
            localStorage.setItem('lexa_user', JSON.stringify(targetUser));
            return true;
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout, 
            logoutAll,
            loginRememberedUser,
            removeRememberedUser,
            upgradePlan, 
            updateUser, 
            switchAccount 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
