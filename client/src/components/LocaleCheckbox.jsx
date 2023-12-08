import { useState, useEffect, useContext } from "react"
import { IntlContext } from "../contexts/IntlContext"
import Locales from '../assets/Locales.json'


export function LocaleCheckbox() {
    const [isEngLocale, setIsEngLocale] = useState(false)

    const [locale, setCurrentLocale] = useContext(IntlContext)

    function changeLocale(isEng) {
        localStorage.setItem('lang', isEng ? 'en' : 'ru')
        setCurrentLocale(isEng ? Locales.en : Locales.ru)
        setIsEngLocale(isEng)
    }

    useEffect(()=>{
        const lang = localStorage.getItem('lang')
        if (lang) {
            setCurrentLocale(lang === 'en' ? Locales.en : Locales.ru)
            setIsEngLocale(lang === 'en' ? true : false)
        } else {
            setCurrentLocale(Locales.ru)
            setIsEngLocale(false)
        }
    },[])

    return (
        <div>
            <input checked={isEngLocale} onChange={(e) => changeLocale(e.target.checked)} id="lang-checkbox" className="hidden" type="checkbox" />
            <label htmlFor="lang-checkbox" className="lang-check-label z-10 rounded-full flex justify-center items-center text-black text-2xl mx-auto w-24 h-12 bg-stone-300">{isEngLocale ? 'RU' : 'ENG'}</label>
        </div>
    )
}