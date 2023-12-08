import { Link } from "react-router-dom"

export function PageItem({ avatar, text, link }) {
    return (
        <Link to={link}>
            <div className="page-item">
                {avatar ? <img className="page-item-img" src={`${import.meta.env.VITE_API_URL}/photos/${avatar}`} alt="" /> : <div className="page-item-img"></div>}
                <div className="page-item-text">{text}</div>
            </div>
        </Link>
    )
}