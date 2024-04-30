import db from '../../db'

export async function isUserExists(username) {
    const sql = `SELECT EXISTS(SELECT 1 FROM users u WHERE u.email = $1);`

    return !!(await db.query(sql, [username])).rows?.[0]?.exists
}

async function getUser(username, password) {
    const sql = `SELECT u.id FROM users u WHERE email = $1 AND pwd = $2;`

    return (await db.query(sql, [username, password])).rows?.[0]
}

export async function saveUser(username, password) {
    const sql = 'INSERT INTO users (email, pwd) values ($1, $2)'

    return await db.query(sql, [username, password]).then(async result => {
        return await generateAuthToken(username, password, true)
    })
}

function generateBase64String(...args) {
    const combined = args.join(':')
    return Buffer.from(combined).toString('base64')
}

export async function authenticate(req, res, next) {
    const token = req.headers.authorization

    if (!token) {
        res.status(403).json({ error: 'Please provide an authorization token' })
    }

    const tmp = token.split(' ')?.[1] ?? ''
    const buf = Buffer.from(tmp, 'base64')

    const [username, password] = buf.toString().split(':')

    try {
        const user = await getUser(username, password)
        if (user) {
            req.user = user.id
            return next()
        }
        res.status(403).json({ error: 'Please provide valid credentials' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

export async function generateAuthToken(username, password, bypassCheck = false) {
    const user = bypassCheck ? true : !!await getUser(username, password)
    if (user) {
        return generateBase64String(username, password)
    }
    return null
}