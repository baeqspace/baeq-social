import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import UserService from "../services/UserService"
import { PageItem } from "../components/PageItem"
import { Modal } from "../components/Modal"
import { Button } from "../components/Button"
import api from "../axios"
import { useLocation, useNavigate, useParams } from "react-router-dom"

export function AllFriends({ groups }) {
    const [authUser] = useContext(AuthContext)
    const [friends, setFriends] = useState([])
    const [sorted, setSorted] = useState([])
    const [searchField, setSearchField] = useState('')
    const {pathname} = useLocation()

    async function getFriendsNames() {
        const data = (await api.get('/allFriends')).data
        setFriends(data)
    }

    async function getGroups() {
        const data = (await api.get('/allGroups')).data
        setFriends(data)
    }

    useEffect(() => {
        if (!groups) {
            getFriendsNames()
        }
        if (groups) {
            getGroups()
        }
    }, [pathname])

    useEffect(()=>{
        let sorted = [...friends]
        sorted = sorted.filter((item) => {
            if (groups) {
                return item.groupName.toLowerCase().includes(searchField.toLowerCase())
            } else {
                const fullName = item.firstName + ' ' + item.lastName
                return fullName.toLowerCase().includes(searchField.toLowerCase())
            }
        })
        setSorted(sorted)
    }, [searchField, friends])


    return (
        <div>
            <h1 className="page-header">{groups ? 'Все группы' : 'Все люди'}</h1>
            <input value={searchField} onChange={e => setSearchField(e.target.value)} className="search-input" type="text" placeholder="Поиск по всем файлам" />
            <div className="friends-page-container">
                {!friends.length && (groups ? <div className="no-friends">Групп нет</div> : <div className="no-friends">Друзей нет</div>)}
                {sorted.map(friend => {
                    return <PageItem key={friend.id} avatar={friend.avatarLink} link={`/baeq-social/${groups ? 'groups/group' : 'profile'}/${friend.id}`} text={`${groups ? friend.groupName : (friend.firstName+' '+friend.lastName)}`} />
                })}
            </div>
        </div>
    )
}