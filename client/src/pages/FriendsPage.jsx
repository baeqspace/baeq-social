import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import UserService from "../services/UserService"
import { PageItem } from "../components/PageItem"
import { Modal } from "../components/Modal"
import { Button } from "../components/Button"
import api from "../axios"
import { useLocation, useNavigate, useParams, Link } from "react-router-dom"

export function FriendsPage({ groups }) {
    const [authUser] = useContext(AuthContext)
    const [friends, setFriends] = useState([])
    const [modalVis, setModalVis] = useState(false)
    const [groupForm, setGroupForm] = useState({avatar: '', name: '', category: '', desc: ''})
    const [pageName, setPageName] = useState('')
    const nav = useNavigate()
    const {pathname} = useLocation()

    const {id} = useParams()

    async function getFriendsNames() {
        const data = (await api.get(`/friends/${id}`)).data
        data.friendsWith = JSON.parse(data.friendsWith)
        const data2 = await UserService.getUsersNames({ ids: data.friendsWith })
        if (data.error) { alert(data.error); return }
        setFriends(data2)
    }

    async function getGroups() {
        const data = (await api.get(`/getGroups/${id}`)).data
        console.log(data)
        setFriends(data)
    }

    async function createGroup() {
        if (!groupForm.name) {alert('Заполните название'); return}
        const data = (await api.post('/createGroup', groupForm)).data
        if (data) nav(`/baeq-social/groups/group/${data}`)
    }

    useEffect(() => {
        if (authUser?.friendsWith?.length && !groups) {
            getFriendsNames()
        }
        if (authUser?.groupsIn && groups) {
            getGroups()
        }
    }, [authUser?.friendsWith, pathname])

    async function getPageName() {
        const data = (await UserService.getUsersNames({ids: [id]}))[0]
        setPageName(data.firstName + ' ' + data.lastName)
    }

    const isMine = Number(id) === authUser?.id

    useEffect(()=>{
        if (!isMine) {
            getPageName()
        }
    }, [id])

    return (
        <div>
            <h1 className="page-header" style={{display: 'inline-block'}}>{groups ? (isMine ? 'Мои группы' : `Группы ${pageName}`) : (isMine ? 'Мои друзья' : `Друзья ${pageName}`)}</h1>
            <Link to={'/baeq-social' + groups ? '/allGroups' : '/allFriends'}><h1 className="all-photos">{groups ? 'Все группы' : 'Все люди'}</h1></Link>
            {groups && isMine && <button onClick={() => setModalVis(true)} className="chats-add">+</button>}
            <div className="friends-page-container">
                {!friends.length && (groups ? <div className="no-friends">Групп нет</div> : <div className="no-friends">Друзей нет</div>)}
                {friends.map(friend => {
                    return <PageItem key={friend.id} avatar={friend.avatarLink} link={`/${groups ? 'groups/group' : 'profile'}/${friend.id}`} text={`${groups ? friend.groupName : (friend.firstName+' '+friend.lastName)}`} />
                })}
            </div>
            {modalVis && <Modal modalVisible={modalVis} setModalVisible={setModalVis}>
                <div className="group-create">
                    <h1>Создание группы</h1>
                    <input value={groupForm.avatar} onChange={e => setGroupForm(prev => {return {...prev, avatar: e.target.value}})} type="text" placeholder="Введите id фото-аватара" />
                    <input value={groupForm.name} onChange={e => setGroupForm(prev => {return {...prev, name: e.target.value}})} type="text" placeholder="Введите название группы" />
                    <input value={groupForm.category} onChange={e => setGroupForm(prev => {return {...prev, category: e.target.value}})} type="text" placeholder="Введите тематику группы" />
                    <input value={groupForm.desc} onChange={e => setGroupForm(prev => {return {...prev, desc: e.target.value}})} type="text" placeholder="Введите описание группы" />
                    <Button onClick={createGroup}>Отправить</Button>
                </div>
            </Modal>}
        </div>
    )
}