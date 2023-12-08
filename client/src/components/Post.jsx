export function Post({date, text}) {
    date = (new Date(date)).toLocaleString()

    return (
        <div className="post">
            <p className="post-date">{date}</p>
            <p className="post-text">{text}</p>
        </div>
    )
}