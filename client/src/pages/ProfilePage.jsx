import { useContext, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Post } from "../components/Post";
import { useParams, Link } from "react-router-dom";
import api from "../axios";
import { AuthContext } from "../contexts/AuthContext";
import UserService from "../services/UserService";

export function ProfilePage() {
    const [authUser] = useContext(AuthContext)

    const [user, setUser] = useState({})
    const [postInput, setPostInput] = useState('')
    const [posts, setPosts] = useState([])
    const [isFriend, setIsFriend] = useState(false)
    const [friends, setFriends] = useState([])

    const { id } = useParams()

    async function getUserData(id) {
        const data = (await api.get(`/user/${id}`)).data
        if (data.error) { alert(data.error); return }
        data.friendsWith = JSON.parse(data.friendsWith)
        setUser(data)
    }

    async function getPosts() {
        const data = (await api.get(`/posts/${id}`)).data
        if (data.error) { alert(data.error); return }
        setPosts(data)
    }

    async function postPost() {
        if (!postInput) { alert('Введите текст поста'); return }
        const data = (await api.post('/posts', { pageId: id, text: postInput, group: false })).data
        if (data.error) { alert(data.error); return }
        setPostInput('')
        getPosts()
    }

    async function handleFriendship() {
        const data = (await api.post('/user/changeFriendship', { id: authUser.id, friendId: user.id })).data
        getUserData(id)
    }

    async function getFriendsNames() {
        const data = await UserService.getUsersNames({ids: user.friendsWith})
        if (data.error) { alert(data.error); return }
        console.log(data)
        setFriends(data)
    }

    /* useEffect(() => {
        getUserData(id)
        getPosts()
    },[]) */

    useEffect(() => {
        getUserData(id)
        getPosts()
    }, [id])

    useEffect(() => {
        setIsFriend(user?.friendsWith?.includes(authUser?.id))
    }, [user?.friendsWith, authUser?.friendsWith])

    useEffect(() => {
        if (user?.friendsWith?.length) {
            getFriendsNames()
        }
    }, [user?.friendsWith])

    return (
        <div className="profile">
            <div className="profile-top">
                {user?.avatarLink ? <img className="profile-img" src={`${import.meta.env.VITE_API_URL}/photos/${user?.avatarLink}`} alt="" /> : <div className="profile-img"></div> }
                <div className="profile-data">
                    <p className="profile-name">{user.firstName} {user.lastName}</p>
                    {user.city && <p className="profile-city">Город:     {user.city}</p>}
                    {user.phone && <p className="profile-phone">Телефон:     {user.phone}</p>}
                    {user.enjoys && <p className="profile-enjoys">Увлечения:     {user.enjoys}</p>}
                </div>
                {user.id === authUser?.id && <Button>Это Ваш профиль</Button>}
                {user.id !== authUser?.id && <Button onClick={handleFriendship}>{isFriend ? 'Убрать из друзей' : 'Добавить в друзья'}</Button>}
                <Link to={`/baeq-social/friends/${user.id}`}><Button>Друзья пользователя</Button></Link>
                <Link to={`/baeq-social/groups/${user.id}`}><Button>Группы пользователя</Button></Link>
                <Link to={`/baeq-social/photos/${user.id}`}><Button>Фото пользователя</Button></Link>
                <Link to={`/baeq-social/videos/${user.id}`}><Button>Видео пользователя</Button></Link>
                <Link to={`/baeq-social/music/${user.id}`}><Button>Музыка пользователя</Button></Link>
            </div>
            {/* <div className="profile-friends">
                <h1 className="section-header">Друзья</h1>
                <div className="friends-container">
                    {!user?.friendsWith?.length && <h1 className="no-friends">Нет друзей</h1>}
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
                {user.id === authUser?.id && <div className="posts-add-form">
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