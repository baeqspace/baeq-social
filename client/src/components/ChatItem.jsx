import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export function ChatItem({ roomId, name, lastMessage, newMsg }) {
    const [authUser] = useContext(AuthContext)

    return (
        <Link to={`/baeq-social/chats/${roomId}`}>
            <div className={`chat-item ${newMsg ? 'new-msg' : ''}`}>
                <div>{name}</div>
                {lastMessage ? <>
                        <div className="chat-item-middle">{lastMessage.senderId === authUser.id && 'Вы:'} {lastMessage?.messageText}</div>
                        <div className="chat-item-end">{(new Date(lastMessage?.dateAndTime)).toLocaleDateString()}</div>
                    </> : <div className="chat-item-middle">Нет сообщений</div>
                }
            </div>
        </Link>
    )
}