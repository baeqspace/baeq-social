import { Button } from "./Button";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import api from "../axios";
import { AuthContext } from "../contexts/AuthContext";
import UserService from "../services/UserService";

export function MediaModal({back, media, addToMyMedia, type}) {
    const [authUser] = useContext(AuthContext)
    const { mediaId } = useParams()
    const [comments, setComments] = useState([])
    const [members, setMembers] = useState([])
    const [comInput, setComInput] = useState('')
    const [isAvatar, setIsAvatar] = useState(false)
    const nav = useNavigate()

    async function getComments() {
        const data = (await api.post('/getComments', {mediaId})).data
        const members = new Set()
        for (let comment of data) {
            members.add(comment.authorId)
        }
        if (members.size) {
            const data2 = await UserService.getUsersNames({ids: Array.from(members)})
            setMembers(data2)
        }
        setComments(data)
    }

    async function updateAvatarInfo() {
        const data = (await api.post('/checkAvatar', {photoId: mediaId})).data
        setIsAvatar(data)
    }

    async function makeAvatar() {
        const data = (await api.post('/setAvatar', {photoId: mediaId})).data
        if (data.error) {alert(data.error); return}
        alert('Аватар изменен!')
        updateAvatarInfo()
    }

    async function postComment() {
        if (!comInput) {alert('Введите комментарий!'); return}
        const data = (await api.post('/postComment', {mediaId, authorId: authUser.id, commentText: comInput})).data
        getComments()
        setComInput('')
    }

    useEffect(() => {
        getComments()
        updateAvatarInfo()
    },[])

    function findName(authorId) {
        const name = members.find((m)=>m.id === authorId)
        return name.firstName + ' ' + name.lastName
    }

    return (
        <div onClick={() => nav(back)} className="modal-bg">
            <div onClick={e => e.stopPropagation()} className="media-modal">
                <div className="media-modal-buttons">
                    {!media?.includes(mediaId) ? <Button onClick={() => addToMyMedia(mediaId)} style={{ position: '', right: 40 }}>Добавить в Мои фото</Button> : <Button>Уже в коллекции</Button>}
                    {type === 'photos' && (!isAvatar ? <Button onClick={makeAvatar}>Сделать аватаром</Button> : <Button>Уже Ваш аватар</Button>)}
                </div>
                {type === 'videos' 
                ? <video controls className="media-modal-img" src={`${import.meta.env.VITE_API_URL}/videos/${mediaId}`}></video>
                : <img className="media-modal-img" src={`${import.meta.env.VITE_API_URL}/photos/${mediaId}`} alt="" />}

                <div className="media-modal-comments">
                    {!comments.length && <div className="no-comments">Комментариев нет. Оставьте первый!</div> }
                    {comments.map(comment => {
                        return <div className="comment" key={comment.id}>{findName(comment.authorId)}: {comment.commentText}</div>
                    })}
                    <div className="comment-form">
                        <input value={comInput} onChange={e => setComInput(e.target.value)} placeholder="Введите комментарий..." type="text" />
                        <Button onClick={()=>postComment()}>Отправить</Button>
                    </div>
                </div>
            </div>
        </div>

    )
}