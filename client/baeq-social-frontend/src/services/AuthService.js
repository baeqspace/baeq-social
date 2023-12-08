import api from "../axios/index.js";

class AuthService {
    async reg(userData) {
        const data = await api.post('/reg', userData)
        return data?.data
    }

    async login(email, password) {
        const data = await api.post('/login', {email, password})
        return data?.data
    }

    async logout() {
        const data = await api.get('/logout')
        localStorage.removeItem('token')
        return data?.data
    }

    async refresh() {
        const data = await api.get('/refresh')
        return data?.data
    }

    async checkAuth() {
        const data = await api.get('/checkAuth')
        return data?.data
    }
}

export default new AuthService()