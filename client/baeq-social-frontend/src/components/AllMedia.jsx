import { useContext, useEffect, useState } from "react"
import { Route, Routes, useNavigate, Link, useLocation } from "react-router-dom"
import api from "../axios"
import { AuthContext } from "../contexts/AuthContext"
import { MediaModal } from "./MediaModal"

export function AllMedia({type}) {


    const [media, setMedia] = useState([])
    const [sortedMedia, setSortedMedia] = useState([])
    const [userMedia, setUserMedia] = useState([])
    const [mediaNames, setMediaNames] = useState([])
    const [searchField, setSearchField] = useState('')

    const [authUser] = useContext(AuthContext)
    const nav = useNavigate()

    async function getMedia() {
        const data = (await api.post('/getAllMedia', {type})).data
        if (data) setMedia((prev) => {
            if ((type === 'videos' || type === 'music') && data.length) {getMediaNames(data.map(el => el.id)); return [...prev]}    
            return data
        })
    }

    async function getUserMedia() {
        const data = (await api.post('/getMedia', {userId: authUser?.id, type})).data[type]
        setUserMedia(data)
    }

    async function addToMyMedia(media) {
        const data = (await api.post('/addToMyMedia', {id: media, type})).data
        if (data.error) {alert(data.error); return}
        getUserMedia()
    }

    async function getMediaNames(ids) {
        const data = (await api.post('/getMediaNames', {media: ids, type})).data
        console.log(data)
        setMedia(data)
    }

    useEffect(()=>{
        if (!media.length) return
        let sorted = [...media]
        if (type === 'photos') {
            setSortedMedia(sorted)
            return
        }
        sorted = sorted.filter((item) => {
            return item.nameOfFile.toLowerCase().includes(searchField.toLowerCase())
        })
        setSortedMedia(sorted)
    }, [searchField, media])

    useEffect(() => {
        getMedia()
    }, [])

    useEffect(() => {
        if (authUser) {
            getUserMedia()
        }
    },[authUser])

    const word = type === 'photos' ? 'фото' : type === 'videos' ? 'видео' : 'музыка'
    const linkToAll = type === 'photos' ? '/baeq-social/allPhotos' : type === 'videos' ? '/baeq-social/allVideos' : '/baeq-social/allMusic'

    return (
        <div className="all-photos-page">
            <h1 className="page-header">{type === 'music' ? 'Вся музыка' : `Все ${word}`}</h1>
            {(type === 'videos' || type === 'music') && <input value={searchField} onChange={e => setSearchField(e.target.value)} className="search-input" type="text" placeholder="Поиск по всем файлам" />}
            <div className={`photos-container ${type}-styles`}>
                {!media?.length && <div className="no-media">Файлов в коллекции нет</div> }
                {sortedMedia.map(m => {
                    return <div key={m.id} className="photo-container">
                        {!userMedia?.includes(m.id) ? <div onClick={() => addToMyMedia(m.id)} title="Добавить в Мои фото" className="remove-photo material-symbols-rounded">add</div> : <div title="Уже в Мои Фото" className="remove-photo material-symbols-rounded">done</div>}
                        <Link to={`${type}/${m.id}`}>
                            {(type === 'videos' || type === 'music') && <div className={`${type}-name`}>{m.nameOfFile}</div>}
                            {type === 'videos'
                            ? <video className="media" src={`${import.meta.env.VITE_API_URL}/videos/${m.id}`}/> 
                            : 
                            type === 'photos' 
                            ? <img className="media" src={`${import.meta.env.VITE_API_URL}/photos/${m.id}`} alt="" />
                            : <audio controls className="music" src={`${import.meta.env.VITE_API_URL}/music/${m.id}`}/>
                        }</Link>
                    </div>
                })}
            </div>
            <Routes>
                <Route path={`/${type}/:mediaId`} element={<MediaModal type={type} addToMyMedia={addToMyMedia} media={userMedia} back={linkToAll}/>}/>
            </Routes>
        </div>
    )
}