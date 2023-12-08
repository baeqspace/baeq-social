import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import queryDB from "../utils/queryDB.js";
import multer from "multer"
const uploadPhoto = multer({dest: './photos'})
const uploadVideo = multer({dest: './videos'})
const uploadMusic = multer({dest: './music'})

const router = new Router()

router.post('/newPhotos', authMiddleware('user'), uploadPhoto.single('file'), async (req,res) => {
    const file = req.file
    await queryDB(`insert into SocialPhotos (id, photopath) values ("${file.filename}", "${file.path}")`)
    const oldPhotos = JSON.parse((await queryDB(`select photos from SocialUsers where id=${req.userId}`))[0].photos)
    oldPhotos.push(file.filename)
    await queryDB(`update SocialUsers set photos='${JSON.stringify(oldPhotos)}' where id=${req.userId}`)
    res.json('success')
})

router.post('/newVideos', authMiddleware('user'), uploadVideo.single('file'), async (req,res) => {
    const file = req.file
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8')
    await queryDB(`insert into SocialVideos (id, videopath, nameOfFile) values ("${file.filename}", "${file.path}", "${file.originalname}")`)
    const oldVideos = JSON.parse((await queryDB(`select videos from SocialUsers where id=${req.userId}`))[0].videos)
    oldVideos.push(file.filename)
    await queryDB(`update SocialUsers set videos='${JSON.stringify(oldVideos)}' where id=${req.userId}`)
    res.json('success')
})

router.post('/newMusic', authMiddleware('user'), uploadMusic.single('file'), async (req,res) => {
    const file = req.file
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8')
    await queryDB(`insert into SocialMusic (id, musicpath, nameOfFile) values ("${file.filename}", "${file.path}", "${file.originalname}")`)
    const oldMusic = JSON.parse((await queryDB(`select music from SocialUsers where id=${req.userId}`))[0].music)
    oldMusic.push(file.filename)
    await queryDB(`update SocialUsers set music='${JSON.stringify(oldMusic)}' where id=${req.userId}`)
    res.json('success')
})

router.post('/getMedia', authMiddleware('user'), async (req, res) => {
    const {userId, type} = req.body
    const data = (await queryDB(`select ${type} from SocialUsers where id=${userId}`))[0]
    res.json(data)
})

router.post('/getAllMedia', authMiddleware('user'), async (req,res) => {
    const {type} = req.body
    let table = ''
    if (type === 'photos') {
        table = 'SocialPhotos'
    } else if (type === 'videos') {
        table = 'SocialVideos'
    } else {
        table = 'SocialMusic'
    }

    const data = await queryDB(`select id from ${table}`)
    res.json(data)
})

router.post('/removeMedia', authMiddleware('user'), async (req, res) => {
    const {mediaId, type} = req.body
    const oldMedia = JSON.parse((await queryDB(`select ${type} from SocialUsers where id=${req.userId}`))[0][type])
    oldMedia.splice(oldMedia.indexOf(mediaId),1)
    await queryDB(`update SocialUsers set ${type}='${JSON.stringify(oldMedia)}' where id=${req.userId}`)
    res.json('success')
})

router.post('/addToMyMedia', authMiddleware('user'), async (req, res) => {
    const {id, type} = req.body
    console.log(id)
    const oldMedia = JSON.parse((await queryDB(`select ${type} from SocialUsers where id=${req.userId}`))[0][type])
    if (!oldMedia.includes(id)) {
        oldMedia.push(id)
        await queryDB(`update SocialUsers set ${type}='${JSON.stringify(oldMedia)}' where id=${req.userId}`)
        res.json('success')
    } else {
        res.json({error: 'Уже в коллекции'})
    }
})

router.post('/getComments', authMiddleware('user'), async (req, res) => {
    const {mediaId} = req.body
    const data = await queryDB(`select * from SocialMediaComments where mediaId="${mediaId}"`)
    res.json(data)
})

router.post('/postComment', authMiddleware('user'), async (req,res) => {
    const {mediaId, commentText, authorId} = req.body
    if (authorId !== req.userId) {res.json({error: 'Вы не можете писать за других пользователей!'}); return}
    await queryDB(`insert into SocialMediaComments (mediaId, authorId, commentText) values ('${mediaId}', ${authorId}, '${commentText}')`)
    res.json('success')
})

router.post('/getMediaNames', authMiddleware('user'), async (req, res) => {
    const {media, type} = req.body
    let table = ''
    if (type === 'videos') {
        table = 'SocialVideos'
    } else if (type === 'music') {
        table = 'SocialMusic'
    }
    let sqlOrString = ''
    media.forEach((id,i) => {
        if (i === 0) {
            sqlOrString += `id="${id}"`
        } else {
            sqlOrString += ` or id="${id}"`
        }
    })
    const data = await queryDB(`select id, nameOfFile from ${table} where ${sqlOrString}`)
    res.json(data)
})

export default router