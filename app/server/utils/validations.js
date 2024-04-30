import db from '../../db'

export async function validateProject(req, res, next) {
    const userId = req.user
    const projectId = req.params.projectId
    const sql = `SELECT EXISTS(SELECT 1 FROM projects WHERE id=$1 AND user_id=$2)`
    const result = (await db.query(sql, [projectId, userId])).rows?.[0]

    if(result.exists) next()
    else res.status(404).json({ error: 'Invalid Project Id' })
}