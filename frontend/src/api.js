import API_URL from './config';

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

export async function ensureCsrfCookie() {
    if (getCookie('XSRF-TOKEN')) return;
    await fetch(`${API_URL}/sanctum/csrf-cookie`, {
        credentials: 'include'
    });
}

export async function apiFetch(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const needsCsrf = method !== 'GET' && method !== 'HEAD';

    if (needsCsrf) {
        await ensureCsrfCookie();
    }

    const headers = { ...(options.headers || {}) };
    if (needsCsrf) {
        const token = getCookie('XSRF-TOKEN');
        if (token) headers['X-XSRF-TOKEN'] = token;
    }

    return fetch(`${API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers
    });
}