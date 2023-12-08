export function Message({mine, sender, date, text}) {
    return (
        <div className={"message" + (mine ? ' mine' : '')}>
            <div className="message-header">{mine ? 'Вы' : `${sender?.firstName} ${sender?.lastName}`} | {(new Date(date)).toLocaleString()}</div>
            <p className="message-text">{text}</p>
        </div>
    )
}