import { useContext, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Post } from "../components/Post";
import { useParams, Link } from "react-router-dom";
import api from "../axios";
import { AuthContext } from "../contexts/AuthContext";
import UserService from "../services/UserService";

export function GroupPage() {
    const [authUser] = useContext(AuthContext)

    const [group, setGroup] = useState({})
    const [postInput, setPostInput] = useState('')
    const [posts, setPosts] = useState([])
    const [isMember, setIsMember] = useState(false)

    const { id } = useParams()

    async function getGroupData(id) {
        const data = (await api.get(`/group/${id}`)).data
        if (data.error) { alert(data.error); return }
        setGroup(data)
    }

    async function getPosts() {
        const data = (await api.get(`/posts/${id}`)).data
        if (data.error) { alert(data.error); return }
        setPosts(data)
    }

    async function postPost() {
        if (!postInput) { alert('Введите текст поста'); return }
        const data = (await api.post('/posts', { pageId: id, text: postInput, group: true })).data
        if (data.error) { alert(data.error); return }
        setPostInput('')
        getPosts()
    }

    async function toggleSubscription() {
        const data = (await api.post('/toggleSubscription', {groupId: id})).data
        if (data.error) {alert(data.error); return}
        setIsMember(prev => !prev)
    }

    useEffect(() => {
        getGroupData(id)
        getPosts()
    }, [id])

    useEffect(()=>{
        setIsMember(group?.members?.includes(authUser?.id))
    }, [group])


    return (
        <div className="profile">
            <div className="profile-top">
            {group?.avatarLink ? <img className="profile-img" src={`${import.meta.env.VITE_API_URL}/photos/${group?.avatarLink}`} alt="" /> : <div className="profile-img"></div> }
                <div className="profile-data">
                    <p className="profile-name">{group.groupName}</p>
                    {group.groupCategory && <p className="profile-city">Категория:     {group.groupCategory}</p>}
                    {group.groupDesc && <p className="profile-phone">Описание:     {group.groupDesc}</p>}
                </div>
                {group.ownerId === authUser?.id && <Button>Это Ваша группа</Button>}
                {group.ownerId !== authUser?.id && <Button onClick={toggleSubscription}>{isMember ? 'Выйти из группы' : 'Вступить в группу'}</Button>}
            </div>
            {/* <div className="profile-friends">
                <h1 className="section-header">Участники</h1>
                <div className="friends-container">
                    {group?.members?.length === 1 && <h1 className="no-friends">Подписчиков нет</h1>}
                    {friends.map((friend) => {
                        return <Link key={friend.id} to={`/profile/${friend.id}`}><div className="profile-friend" key={friend.id}>
                            {friend.avatarLink ? <img className="friend-img" src={friend.avatarLink} alt="" /> : <div className="friend-img"></div>}
                            <div>{friend.firstName} {friend.lastName}</div>
                        </div></Link>
                    })}
                </div>
            </div> */}
            <div className="profile-posts">
                <h1 className="section-header">Посты</h1>
                {group.ownerId === authUser?.id && <div className="posts-add-form">
                    <input value={postInput} onChange={e => setPostInput(e.target.value)} className="posts-input" type="text" placeholder="Введите текст нового поста..." />
                    <Button onClick={() => postPost()}>Отправить</Button>
                </div>}
                <div className="posts-container">
                    {!posts.length && <h1 className="no-posts">Постов пока нет</h1>}
                    {posts.map(post => {
                        return <Post key={post.id} date={post.dateAndTime} text={post.postText} />
                    })}
                </div>
            </div>
        </div>
    )
}