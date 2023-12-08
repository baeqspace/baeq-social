import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import queryDB from "../utils/queryDB.js";

const router = new Router()

router.post('/posts', authMiddleware('user'), async (req, res) => {
    const {pageId, text, group} = req.body
    if (group) {
        const ownerId = (await queryDB(`select ownerId from SocialGroups where id="${pageId}"`))[0].ownerId
        if (req.userId !== ownerId) {res.json({error: 'Группа Вам не принадлежит!'}); return}
    } else {
        if (req.userId !== Number(pageId)) {res.json({error: 'У Вас нет прав на это'}); return}
    }
    await queryDB(`insert into SocialPosts (pageId, dateAndTime, postText) values ("${pageId}", ${Date.now()}, "${text}")`)
    res.json('success')
})

router.get('/posts/:id', authMiddleware('user'), async (req, res) => {
    const pageId = req.params.id
    const data = await queryDB(`select id, postText, dateAndTime from SocialPosts where pageId="${pageId}" order by dateAndTime desc`)
    if (!data) {res.json({error: 'нет постов'}); return}
    res.json(data)
})

export default router