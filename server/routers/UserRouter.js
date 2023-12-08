import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import queryDB from "../utils/queryDB.js";

const router = new Router()

async function areFriends(id, friendId) {
    let data = (await queryDB(`select friendsWith from SocialUsers where id=${id}`))[0].friendsWith
    data = JSON.parse(data)
    return data.includes(friendId)
}

router.post('/checkAvatar', authMiddleware('user'), async (req, res) => {
    const {photoId} = req.body
    const data = (await queryDB(`select avatarLink from SocialUsers where id=${req.userId}`))[0].avatarLink
    res.json(photoId === data)
})

router.post('/setAvatar', authMiddleware('user'), async (req, res) => {
    const {photoId} = req.body
    const existPhoto = (await queryDB(`select id from SocialPhotos where id="${photoId}"`))[0]
    if (!existPhoto) {res.json({error: 'фото не существует'}); return}
    await queryDB(`update SocialUsers set avatarLink="${photoId}" where id=${req.userId}`)
    res.json('success')
})

router.post('/user/getUsersNames', authMiddleware('user'), async (req,res) => {
    const {ids} = req.body
    if (!ids) {res.json({error: 'не даны id'}); return}
    let sqlOrString = ''
    ids.forEach((id,i) => {
        if (i === 0) {
            sqlOrString += `id=${id}`
        } else {
            sqlOrString += ` or id=${id}`
        }
    })
    const data = await queryDB(`select id, avatarLink, firstName, lastName from SocialUsers where ${sqlOrString}`)
    res.json(data)
})

router.get('/friends/:id', authMiddleware('user'), async (req,res) => {
    const id = req.params.id
    const data = (await queryDB(`select friendsWith from SocialUsers where id=${id}`))[0]
    res.json(data)
})

router.post('/user/changeFriendship', authMiddleware('user'), async (req,res) => {
    const {id, friendId} = req.body
    const friendship = await areFriends(id, friendId)
    const userFriendsWith = JSON.parse((await queryDB(`select friendsWith from SocialUsers where id=${id}`))[0].friendsWith)
    const friendFriendsWith = JSON.parse((await queryDB(`select friendsWith from SocialUsers where id=${friendId}`))[0].friendsWith)
    
    if (friendship) {
        userFriendsWith.splice(userFriendsWith.indexOf(friendId), 1)
        friendFriendsWith.splice(friendFriendsWith.indexOf(id), 1)
    } else {
        userFriendsWith.push(friendId)
        friendFriendsWith.push(id)
    }
    await queryDB(`update SocialUsers set friendsWith = '${JSON.stringify(userFriendsWith)}' where id=${id}`)
    await queryDB(`update SocialUsers set friendsWith = '${JSON.stringify(friendFriendsWith)}' where id=${friendId}`)
    res.json('success')
})


router.get('/user/:id', authMiddleware('user'), async (req, res) => {
    const id = req.params.id
    const user = (await queryDB(`select * from SocialUsers where id=${id}`))[0]
    if (!user) {res.json({error: 'пользователь не существует'}); return}
    delete user.pass
    delete user.roles
    delete user.email
    res.json(user)
})

router.get('/usersAll', authMiddleware('admin'), async (req, res) => {
    const users = await queryDB('select id, email, roles from SocialUsers')
    res.json(users)
})

router.delete('/user/:id', authMiddleware('admin'), async (req, res) => {
    const id = req.params.id
    const data = await queryDB(`delete from SocialUsers where id=${id}`)
    if (data.error) {res.json(data.error); return}
    res.json('success')
})

router.post('/user/:id', authMiddleware('admin'), async (req,res)=>{
    const id = req.params.id
    const data = await queryDB(`update SocialUsers set roles='${JSON.stringify(req.body)}' where id=${id}`)
    if (data.error) {res.json(data.error); return}
    res.json('success')
})

router.get('/allFriends', authMiddleware('user'), async (req, res) => {
    const data = await queryDB('select id, firstName, lastName, avatarLink from SocialUsers')
    res.json(data)
})

export default router