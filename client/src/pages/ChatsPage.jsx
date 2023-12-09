import { Modal } from "../components/Modal";
import { useContext, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { AuthContext } from "../contexts/AuthContext";
import api from "../axios";
import UserService from "../services/UserService";
import { ChatItem } from "../components/ChatItem";
import {io} from 'socket.io-client'

export function ChatsPage() {
    const [authUser, setAuthUser, checkAuth] = useContext(AuthContext)

    const [modalVis, setModalVis] = useState(false)
    const [userId, setUserId] = useState('')
    const [rooms, setRooms] = useState([])

    async function sendAddRoom() {
        if (!userId) {alert('Введите ID пользователей')}

        const usersId = userId.replaceAll(' ', '').split(',').map(user => Number(user))
        
        const data = (await api.post('/newChatRoom', {ids: [authUser.id, ...usersId]})).data
        if (data.error) {alert(data.error); return}
        console.log(data)
        setModalVis(false)
        getRooms()
    }

    async function getRooms() {
        const data = (await api.post('/getRooms', {id: authUser?.id})).data
        console.log(data)
        for (let room of data) {
            room.users = JSON.parse(room.users)
            room.users.splice(room.users.indexOf(authUser.id), 1)
            room.users = await UserService.getUsersNames({ids: room.users})
        }
        setRooms(data)
    }

    useEffect(() => {
        const roomsToJoin = rooms.map(room => room.id)
        console.log(rooms)
        const newSocket = io(`${import.meta.env.VITE_API_URL}/socketio`.replace('/api-social', ''))
        newSocket.emit('join-room', roomsToJoin, localStorage.getItem('token'))
        newSocket.on('receive-message', (message) => {
            console.log('received a message')
            console.log(message)
            setRooms(prev => {
                const roomFromMsg = prev.findIndex((el) => el.id === message.roomId)
                prev[roomFromMsg].lastMessage = message
                prev[roomFromMsg].lastMessage.new = true
                console.log(prev)
                return [...prev]
            })
        })

        return () => {
            newSocket.close()
        }
    }, [rooms])

    useEffect(()=>{
        if (authUser?.id) {
            getRooms()
        }
    },[authUser?.id])

    return (
        <div>
            <h1 className="page-header">Мои чаты</h1>
            <button onClick={() => setModalVis(true)} className="chats-add">+</button>
            {modalVis && <Modal modalVisible={modalVis} setModalVisible={setModalVis}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <input value={userId} onChange={(e)=>setUserId(e.target.value)} style={{width: '60%'}} type="text" placeholder="Введите ID пользователей через запятую"/>
                    <Button onClick={() => sendAddRoom()}>Начать чат</Button>
                </div>
            </Modal>}
            <div className="chat-rooms-container">
                {rooms.map(room => {
                    let namesString = ''
                    room?.users?.forEach(user => namesString += `${user.firstName} ${user.lastName} `)
                    return <ChatItem key={room.id} newMsg={room.lastMessage?.new} roomId={room.id} name={namesString} lastMessage={room.lastMessage}/>
                })}
            </div>
        </div>
    )
}