import { useState, useEffect, useContext } from "react"
import { IntlContext } from "../contexts/IntlContext"

export function ThemeSlider({ setTheme }) {
    const [locale] = useContext(IntlContext)
    const [themeRange, setThemeRange] = useState(2)

    function setPreferedTheme() {
        switch (themeRange) {
            case '1':
                localStorage.setItem('theme', 'light-theme')
                break
            case '2':
                localStorage.removeItem('theme')
                break
            case '3':
                localStorage.setItem('theme', 'dark-theme')
                break
        }


        if (!localStorage.getItem('theme')) {
            const query = window.matchMedia('(prefers-color-scheme: dark)')
            const isDarkTheme = query.matches

            query.onchange = () => { console.log('changed!'); setPreferedTheme() };

            setTheme(isDarkTheme ? 'dark-theme' : 'light-theme')

        } else {

            setTheme(localStorage.getItem('theme'))

        }

    }

    useEffect(setPreferedTheme, [themeRange])

    useEffect(() => {
        const theme = localStorage.getItem('theme')
        if (theme) {
            setThemeRange(theme === 'dark-theme' ? 3 : 1)
        } else {
            setThemeRange(2)
        }
    }, [])

    return (
        <div className="relative">
            <input value={themeRange} onChange={e => setThemeRange(e.target.value)} className="theme-range z-10" min="1" max="3" step="1" type="range" />
            <div className="theme-hint z-0 transition-all flex absolute opacity-0 text-center text-lg rounded-2xl bg-stone-400 text-white w-44 h-20">
                <div className="z-0 w-12 grow">{locale.themeRange1}</div>
                <div className="z-0 w-12 grow rotate-45 translate-y-5 leading-4">{locale.themeRange2}</div>
                <div className="z-0 w-12 grow">{locale.themeRange3}</div>
            </div>
        </div>
    )
}