import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import queryDB from "../utils/queryDB.js";

const router = new Router()

router.post('/newChatRoom', authMiddleware('user'), async (req, res) => {
    const {ids} = req.body
    if (ids.length < 2 || ids.includes(null)) {res.json({error: 'need 2 and more users to create a room'}); return}
    const existRoom = (await queryDB(`select users from SocialRooms where users='${JSON.stringify(ids.sort())}'`))[0]
    console.log(existRoom)
    if (existRoom) {res.json({error: 'room already exists'}); return}

    for (let id of ids) {
        const data = (await queryDB(`select * from SocialUsers where id=${id}`))[0]
        if (!data) {
            res.json({error: 'one or more users are not exist'})
            return
        }
    }

    await queryDB(`insert into SocialRooms (users) values ('${JSON.stringify(ids.sort())}')`)
    res.json('success')
})

router.post('/getRooms', authMiddleware('user'), async (req, res) => {
    const {id} = req.body
    const rooms = await queryDB(`select * from SocialRooms`)
    const filteredRooms = rooms.filter(room => JSON.parse(room.users).includes(id))
    console.log(filteredRooms)
    for (let room of filteredRooms) {
        const lastMessage = (await queryDB(`select senderId, dateAndTime, messageText from SocialMessages where roomId=${room.id} order by dateAndTime desc`))[0]
        room.lastMessage = lastMessage
    }
    res.json(filteredRooms)
})

router.post('/newMessage', authMiddleware('user'), async (req, res) => {
    const {senderId, dateAndTime, messageText, roomId} = req.body
    if (senderId !== req.userId) {res.json({error: 'Вы не можете писать за других пользователей'}); return}
    await queryDB(`insert into SocialMessages (roomId, senderId, dateAndTime, messageText) values (${roomId}, ${senderId}, ${dateAndTime}, '${messageText}')`)
    res.json('success')
})

router.post('/getMessages', authMiddleware('user'), async (req, res) => {
    const {roomId} = req.body
    
    const roomMembers = JSON.parse((await queryDB(`select users from SocialRooms where id=${roomId}`))[0].users)
    if (!roomMembers.includes(req.userId)) {res.json({error: 'У Вас нет доступа к этому чату'}); return}

    const data = await queryDB(`select roomId, senderId, dateAndTime, messageText from SocialMessages where roomId=${roomId} order by dateAndTime`)
    const members = (await queryDB(`select users from SocialRooms where id=${roomId}`))[0]
    res.json({data, members})
})

export default router