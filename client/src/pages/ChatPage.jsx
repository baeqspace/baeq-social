import { Button } from "../components/Button";
import { Message } from "../components/Message";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { io } from 'socket.io-client'

export function ChatPage() {
    let { id } = useParams()
    id = Number(id)
    const [authUser, setAuthUser, checkAuth] = useContext(AuthContext)
    const [messages, setMessages] = useState([])
    const [members, setMembers] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [socket, setSocket] = useState()
    const mContainer = useRef()
    const nav = useNavigate()

    async function sendMessage() {
        if (!chatInput) { alert('Введите сообщение!'); return }
        const message = { senderId: authUser.id, dateAndTime: Date.now(), messageText: chatInput, roomId: id }
        const data = (await api.post('/newMessage', message)).data
        if (data.error) { alert(data.error); return }
        setMessages(prev => [...prev, message])
        socket.emit('send-message', message)
        setChatInput('')
    }

    async function getMessages() {
        const data = (await api.post('/getMessages', { roomId: id })).data
        if (data.error) { alert(data.error); nav('/baeq-social/chats'); return }
        setMessages(data.data)
        const members = JSON.parse(data.members.users)
        const data2 = (await api.post('/user/getUsersNames', { ids: members })).data
        console.log(data2)
        setMembers(data2)
    }

    useEffect(() => {
        mContainer.current.scroll(0, mContainer.current.scrollHeight)
    }, [messages])

    useEffect(() => {
        getMessages()
    }, [])

    useEffect(() => {
        const newSocket = io(`${import.meta.env.VITE_API_URL}/socketio`.replace('/api-social', ''))
        newSocket.emit('join-room', id, localStorage.getItem('token'))
        newSocket.on('receive-message', (message) => {
            console.log('received a message')
            setMessages(prev => [...prev, message])
        })
        setSocket(newSocket)

        return () => {
            newSocket.close()
        }
    }, [])

    return (
        <div style={{ width: '100%' }}>
            <Link to='/baeq-social/chats'>
                <div className="back-button">
                    <span className="material-symbols-rounded">arrow_back</span>
                    <span className="chat-nav-text">Назад</span>
                </div>
            </Link>
            <div className="chat-members">
                <span className="material-symbols-rounded">groups</span>
                <span className="chat-nav-text">Участники чата</span>
                <div className="members">
                    {members.map(member => {
                        return <div key={member.id}>{member.firstName} {member.lastName}</div>
                    })}
                </div>
            </div>
            <div ref={mContainer} className="messages-container">
                {!messages.length && <h1 className="no-messages">Сообщений пока нет... Начните Вы!</h1>}
                {messages.map(m => {
                    return <Message key={m.dateAndTime} mine={authUser?.id === m.senderId} sender={members.find((member) => member.id === m.senderId)} date={m.dateAndTime} text={m.messageText} />
                })}
            </div>
            <div className="messages-form">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Введите текст сообщения..." type="text" />
                <Button onClick={() => sendMessage()}>Отправить</Button>
            </div>
        </div>
    )
}