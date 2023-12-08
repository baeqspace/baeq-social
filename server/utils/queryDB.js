import mysql from 'mysql2/promise'

export default async function queryDB(query) {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: '',
        password: '',
        database: 'baeq-social'
    })
    try {
        const [rows, fields] = await connection.query(query)

        await connection.end()
        return rows
    } catch (e) {
        console.log(e)
        await connection.end()
        return { error: e.code }
    }
}