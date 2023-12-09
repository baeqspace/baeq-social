import { useParams, Link, Routes, Route, useLocation } from "react-router-dom"
import api from "../axios"
import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import UserService from "../services/UserService"
import { MediaModal } from "../components/MediaModal"

export function MediaPage({type}) {
    let {id} = useParams()
    id = Number(id)
    const [authUser] = useContext(AuthContext)

    const fileInput = useRef()

    const [media, setMedia] = useState([])
    const [name, setName] = useState('')
    const [userMedia, setUserMedia] = useState([])
    const [mediaNames, setMediaNames] = useState([])

    const { pathname } = useLocation()


    async function addMedia(file) {
        const formData = new FormData()
        formData.append('file', file)

        let endpoint = ''
        if (type === 'photos') {
            endpoint = '/newPhotos'
        } else if (type === 'videos') {
            endpoint = '/newVideos'
        } else if (type === 'music') {
            endpoint = '/newMusic'
        }
        const data = (await api.post(endpoint, formData)).data
        getMedia()
    }

    async function getMediaNames(ids) {
        const data = (await api.post('/getMediaNames', {media: ids, type})).data
        setMediaNames(data)
    }

    async function getMedia() {
        const data = (await api.post('/getMedia', {userId: id, type})).data[type]
        if (data) {setMedia(() => {
            const newData = JSON.parse(data)
            if ((type === 'videos' || type === 'music') && newData.length) getMediaNames(newData)
            return newData
        })}
    }

    async function getUserMedia() {
        const data = (await api.post('/getMedia', {userId: authUser?.id, type})).data[type]
        console.log(data)
        setUserMedia(data)
    }

    async function addToMyMedia(media) {
        const data = (await api.post('/addToMyMedia', {id: media, type})).data
        if (data.error) {alert(data.error); return}
        getUserMedia()
    }

    async function removeMedia(media) {
        const data = (await api.post('/removeMedia', {mediaId: media, type})).data
        getMedia()
    }

    
    const isMyMedia = id === authUser?.id


    useEffect(() => {
        if (authUser) {
            getUserMedia()
        }
    },[authUser, pathname])
    

    async function getName() {
        const data = await UserService.getUsersNames({ids: [id]})
        setName(data[0].firstName + ' ' + data[0].lastName)
    }

    const word = type === 'photos' ? 'фото' : type === 'videos' ? 'видео' : 'музыка'
    const linkToAll = type === 'photos' ? '/baeq-social/allPhotos' : type === 'videos' ? '/baeq-social/allVideos' : '/baeq-social/allMusic'


    useEffect(()=>{
        getMedia()
        getName()
    }, [pathname])

    return (
        <div>
            <h1 className="page-header photos-header">{isMyMedia ? (type === 'music' ? 'Моя музыка' : `Мои ${word}`) : (`${word} ${name}`)}</h1>
            <Link to={linkToAll} className="all-photos">{type === 'music' ? 'Вся музыка' : `Все ${word}`}</Link>
            {isMyMedia && <button onClick={() => {fileInput.current.click()}} className="chats-add">+</button>}
            <input className="hidden" name='socialimage' ref={fileInput} onChange={(e) => addMedia(e.target.files[0])} type="file" />
            <div className={`photos-container ${type}-styles`}>
                {!media.length && <h1 className="no-media">Файлов в коллекции нет</h1> }
                {media.map(m => {
                    return <div key={m} className="photo-container">
                        {isMyMedia && <div onClick={() => removeMedia(m)} title="Убрать из Мои фото" className="remove-photo material-symbols-rounded">close</div>}
                        {(!isMyMedia && !userMedia?.includes(m)) && <div onClick={() => addToMyMedia(m)} title="Добавить в Мои фото" className="remove-photo material-symbols-rounded">add</div>}
                        {(!isMyMedia && userMedia?.includes(m)) && <div title="Уже в Мои Фото" className="remove-photo material-symbols-rounded">done</div> }
                        
                        <Link to={type !== 'music' ? `${type}/${m}` : ''}>
                            {(type === 'videos' || type === 'music') && <div className={`${type}-name`}>{mediaNames.find(name => name.id === m)?.nameOfFile}</div> }
                            {type === 'videos'
                            ? <video className="media" src={`${import.meta.env.VITE_API_URL}/videos/${m}`}></video>
                            : type === 'photos' 
                            ? <img className="media" src={`${import.meta.env.VITE_API_URL}/photos/${m}`} alt="" />
                            : <audio controls className="music" src={`${import.meta.env.VITE_API_URL}/music/${m}`}></audio>
                        }</Link>
                    </div>
                })}
            </div>
            <Routes>
                <Route path={`${type}/:mediaId`} element={<MediaModal type={type} addToMyMedia={addToMyMedia} media={userMedia} back={`/baeq-social/${type}/${id}`}/>}/>
            </Routes>
        </div>
    )
}