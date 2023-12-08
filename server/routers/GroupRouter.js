import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import queryDB from "../utils/queryDB.js";
import {v4 as uuid4} from 'uuid'

const router = new Router()

router.post('/createGroup', authMiddleware('user'), async (req, res) => {
    const {name, category, desc, avatar} = req.body
    const id = uuid4()
    await queryDB(`insert into SocialGroups (id, ownerId, groupName, groupCategory, groupDesc, members, avatarLink) values ("${id}",${req.userId}, "${name}", "${category}", "${desc}", '${JSON.stringify([req.userId])}', "${avatar}")`)
    const oldGroups = JSON.parse((await queryDB(`select groupsIn from SocialUsers where id=${req.userId}`))[0].groupsIn)
    oldGroups.push(id)
    await queryDB(`update SocialUsers set groupsIn='${JSON.stringify(oldGroups)}' where id=${req.userId}`)
    res.json(id)
})

router.get('/group/:id', authMiddleware('user'), async (req, res) => {
    const id = req.params.id
    const data = (await queryDB(`select * from SocialGroups where id="${id}"`))[0]
    res.json(data)
})

router.get('/getGroups/:id', authMiddleware('user'), async (req, res) => {
    const id = req.params.id
    const groupIds = JSON.parse((await queryDB(`select groupsIn from SocialUsers where id=${id}`))[0].groupsIn)
    if (!groupIds.length) return
    let sqlOrString = ''
    groupIds.forEach((id,i) => {
        if (i === 0) {
            sqlOrString += `id="${id}"`
        } else {
            sqlOrString += ` or id="${id}"`
        }
    })
    const groups = await queryDB(`select * from SocialGroups where ${sqlOrString}`)
    res.json(groups)
})

router.post('/toggleSubscription', authMiddleware('user'), async (req,res) => {
    const {groupId} = req.body

    const members = JSON.parse((await queryDB(`select members from SocialGroups where id="${groupId}"`))[0].members)
    const groups = JSON.parse((await queryDB(`select groupsIn from SocialUsers where id=${req.userId}`))[0].groupsIn)

    const isMember = members.includes(req.userId)

    if (isMember) {
        members.splice(members.indexOf(req.userId), 1)
        groups.splice(groups.indexOf(groupId), 1)
    } else {
        members.push(req.userId)
        groups.push(groupId)
    }
    await queryDB(`update SocialGroups set members='${JSON.stringify(members)}' where id="${groupId}"`)
    await queryDB(`update SocialUsers set groupsIn='${JSON.stringify(groups)}' where id=${req.userId}`)
    res.json('success')
})

router.get('/allGroups', authMiddleware('user'), async (req, res) => {
    const data = await queryDB('select id, groupName, avatarLink from SocialGroups')
    res.json(data)
})

export default router