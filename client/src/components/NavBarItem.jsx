import { Link } from "react-router-dom"

export function NavBarItem({ symbol, link, text, ...props }) {
    return (
        <Link to={link}>
            <div {...props} className="navbar-item">
                <span className="material-symbols-rounded navbar-symbol">{symbol}</span>
                <p className="navbar-text">{text}</p>
            </div>
        </Link>
    )
}