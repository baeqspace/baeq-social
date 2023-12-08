import { Button } from "../components/Button";
import { useContext, useState } from "react";
import AuthService from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { IntlContext } from "../contexts/IntlContext";

export function LoginPage() {
    const [authUser, setAuthUser, checkAuth] = useContext(AuthContext)
    const [locale] = useContext(IntlContext)

    const [form, setForm] = useState({ isReg: false, email: '', password: '', firstName: '', lastName: '', city: '', phone: '', enjoys: ''})

    const nav = useNavigate()

    async function sendAuth() {
        
        let data;
        if (form.isReg) {
            if (!form.email || !form.password || !form.firstName || !form.lastName) {alert('email, пароль, имя или фамилия не указаны'); return}
            data = await AuthService.reg({...form})
        } else {
            if (!form.email || !form.password) { alert('email или пароль не указаны'); return }
            data = await AuthService.login(form.email, form.password)
        }

        console.log(data)
        if (data.error) { alert(data.error); return }
        localStorage.setItem('token', data.accessToken)
        checkAuth()
    }

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="login-form">
                <label className="login-checkbox">
                    <span>{locale.loginLogin}</span>
                    <span>{locale.loginReg}</span>
                    <input className="hidden" checked={form.isReg} onChange={e => setForm(prev => { return { ...prev, isReg: e.target.checked } })} type="checkbox" />
                </label>
                <input value={form.email} onChange={e => setForm(prev => { return { ...prev, email: e.target.value, } })} type="text" placeholder={locale.loginEmail} />
                <input value={form.password} onChange={e => setForm(prev => { return { ...prev, password: e.target.value } })} type="password" placeholder={locale.loginPass} />
                {form.isReg && <>
                    <input type="text" value={form.firstName} onChange={e => setForm(prev => {return {...prev, firstName: e.target.value}})} placeholder="Введите имя"/>
                    <input type="text" value={form.lastName} onChange={e => setForm(prev => {return {...prev, lastName: e.target.value}})} placeholder="Введите фамилию"/>
                    <input type="text" value={form.city} onChange={e => setForm(prev => {return {...prev, city: e.target.value}})} placeholder="Введите Ваш город"/>
                    <input type="text" value={form.phone} onChange={e => setForm(prev => {return {...prev, phone: e.target.value}})} placeholder="Введите Ваш телефон"/>
                    <input type="text" value={form.enjoys} onChange={e => setForm(prev => {return {...prev, enjoys: e.target.value}})} placeholder="Введите Ваши увлечения"/>
                </> }
                <Button style={{marginTop: 25, padding: '20px 50px', fontSize: '21px'}} onClick={sendAuth}>{locale.loginSend}</Button>
            </div>
        </div>
    )
}