import express from "express"
import cors from 'cors'
import AuthRouter from "./routers/AuthRouter.js"
import UserRouter from './routers/UserRouter.js'
import PostRouter from './routers/PostRouter.js'
import ChatRouter from './routers/ChatRouter.js'
import MediaRouter from './routers/MediaRouter.js'
import GroupRouter from './routers/GroupRouter.js'
import cookieParser from "cookie-parser"
import * as http from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import queryDB from "./utils/queryDB.js"
import bodyParser from "body-parser"
import 'dotenv/config'



const app = express()
const PORT = 3000
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.FRONTEND_URL]
    }
})

io.on('connection', (socket) => {
    socket.on('join-room', async (room, token) => {
        try {
            const user = jwt.verify(token, 'secret')
            console.log('token ok')
            if (typeof room === 'object') {
                for (let id of room) {
                    let roomUsers = (await queryDB(`select users from SocialRooms where id=${id}`))[0]
                    roomUsers = JSON.parse(roomUsers.users)
                    if (roomUsers.includes(user.id)) {
                        socket.join(id)
                    }
                }
            } else {
                const roomUsers = JSON.parse((await queryDB(`select users from SocialRooms where id=${room}`))[0].users)
                if (!roomUsers.includes(user.id)) { console.log('попытка попасть в чужой чат'); return }
                socket.join(room)
            }
        } catch (e) {
            console.log(e)
        }
    })
    socket.on('send-message', (message) => {
        console.log(message)
        socket.broadcast.to(message.roomId).emit('receive-message', message)
    })
})




app.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL]
}))
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/api-social', AuthRouter)
app.use('/api-social', UserRouter)
app.use('/api-social', PostRouter)
app.use('/api-social', ChatRouter)
app.use('/api-social', MediaRouter)
app.use('/api-social', GroupRouter)
app.use('/api-social/photos', express.static('photos'))
app.use('/api-social/videos', express.static('videos'))
app.use('/api-social/music', express.static('music'))
app.use('/baeq-social', express.static('../client/baeq-social-frontend/dist'))

//app.set('socketio', io)


httpServer.listen(PORT, () => {
    console.log('server started on port ' + PORT, 'working with frontend on ' + process.env.FRONTEND_URL)
})