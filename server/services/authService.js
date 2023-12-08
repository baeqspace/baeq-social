import bcrypt from 'bcrypt'
import queryDB from '../utils/queryDB.js'
import jwt from 'jsonwebtoken'

function generateTokens(user) {
    try {
        const accessToken = jwt.sign({ email: user.email, id: user.id, roles: user.roles}, 'secret', { expiresIn: '10m' })
        const refreshToken = jwt.sign({ email: user.email, id: user.id, roles: user.roles}, 'secret', { expiresIn: '30d' })
        return [accessToken, refreshToken]
    } catch(e) {
        console.log('generateTokens', e.message)
    }

}

class AuthService {
    async reg(userData) {
        const candidate = (await queryDB(`select * from SocialUsers where email="${userData.email}"`))[0]
        if (candidate) {
            throw new Error('Пользователь уже существует')
        }

        const hashPass = await bcrypt.hash(userData.password, 3)
        await queryDB(`insert into SocialUsers (email, pass, roles, firstName, lastName, city, phone, enjoys, friendsWith, avatarLink, photos, videos, music, groupsIn) values ("${userData.email}", "${hashPass}", '${JSON.stringify(['user'])}', "${userData.firstName}", "${userData.lastName}", "${userData.city}", "${userData.phone}", "${userData.enjoys}", '${JSON.stringify([])}', '', '[]', '[]', '[]', '[]')`)

        const user = (await queryDB(`select id, email, roles from SocialUsers where email="${userData.email}"`))[0]

        const [accessToken, refreshToken] = generateTokens(user)

        const userReturn = {
            user,
            accessToken,
            refreshToken
        }

        return userReturn
    }

    async login(email, password) {
        const user = (await queryDB(`select * from SocialUsers where email="${email}"`))[0]
        if (!user) {
            throw new Error('пользователь не найден')
        }

        const isPassEqual = await bcrypt.compare(password, user.pass)
        if (!isPassEqual) {
            throw new Error('пароль неверный')
        }

        const [accessToken, refreshToken] = generateTokens(user)

        const userData = {
            email: user.email,
            id: user.id,
            roles: user.roles,
            accessToken,
            refreshToken
        }

        return userData
    }

    async refresh(token) {
        try {
            const user = jwt.verify(token, 'secret')

            const userExist = (await queryDB(`select email from SocialUsers where id=${user.id}`))[0]
            if (!userExist) {
                throw new Error('пользователя не существует')
            }

            const [accessToken, refreshToken] = generateTokens(user)
            const userData = {
                user,
                accessToken,
                refreshToken
            }

            return userData
        } catch (e) {
            throw new Error(e.message)
        }
        
    }

    async checkAuth(token) {
        try {
            const user = jwt.verify(token, 'secret')

            const userExist = (await queryDB(`select id, firstName, lastName, friendsWith, roles, email, groupsIn, avatarLink from SocialUsers where id=${user.id}`))[0]
            if (!userExist) {
                throw new Error('пользователя не существует')
            }

            return userExist
        } catch (e) {
            throw new Error(e.message)
        }
    }
}

export default new AuthService()