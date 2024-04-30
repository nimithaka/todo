import bodyParser from 'body-parser'
import express from 'express'

import db from '../db'

import { getMarkdown } from './utils/project'
import { validateProject } from './utils/validations'
import { authenticate, saveUser, isUserExists, generateAuthToken } from './utils/auth'

const app = express()

// Middlewares
app.use(bodyParser.json())

// API's
app.post('/signup', async (req, res) => {
  const { email, pwd } = req.body
  try {
    const isExists = await isUserExists(email)
    if (!isExists) {
      res.json({ token: await saveUser(email, pwd) })
    } else {
      res.status(400).json({ error: 'User already exists' })
    }
  }
  catch(error) {
    res.status(500).json({ error: 'An error occurred while signing up' })
  }
})


app.post('/signin', async (req, res) => {
  const { email, pwd } = req.body
  try {
      const token = await generateAuthToken(email, pwd)
      if (!token) {
        res.status(404).json({ error: 'User not found or invalid credentials' })
      } else res.json({ token })
  }
  catch (error) {
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
})

/**
 * Authtoken should be in headers and in the form of
 * Authorization: Basic ${Token returned from signin endpoint}
 */

app.get('/projects', authenticate, async (req, res) => {
  const userId = req.user
  try {
      const sql = 'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at'
      let result = await db.query(sql, [userId])
      res.json({ projects: result.rows })
   }
  catch(error) {
    res.status(500).json({ error })
  }
})

app.post('/projects', authenticate, async (req, res) => {
  try {
    const { title } = req.body
    const userId = req.user;
    const sql = 'INSERT INTO projects (title, user_id) values ($1, $2) RETURNING *;'
    let result = await db.query(sql, [title, userId])
    res.json({ projects: result.rows })
  }
  catch(error) {
    res.status(500).json({ error })
  }
})

app.put('/projects/:projectId', authenticate, validateProject, async (req, res) => {
  const { title } = req.body;
  const projectId = req.params.projectId
  try {
    const sql = 'UPDATE projects SET title = $1 where id = $2 RETURNING *;'
    let result = await db.query(sql, [title, projectId])
    res.json({ projects: result.rows })
  }
  catch(error) {
    res.status(500).json({ error })
  }
})

app.get('/projects/:projectId/todos', authenticate, validateProject, async (req, res) => {
  const projectId = req.params.projectId
  const userId = req.user
  try {
    const sql = `SELECT t.*
    FROM todos t
    WHERE t.project_id = $1
    AND EXISTS (
        SELECT 1
        FROM projects p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = t.project_id
        AND u.id = $2
    );`
    let result = await db.query(sql, [projectId, userId])
    res.json({ todos: result.rows })
  }
  catch(error) {
    res.status(500).json({ error })
  }
})

app.post('/projects/:projectId/todos', authenticate, validateProject, async (req, res) => {
  const { title, status } = req.body
  const projectId = req.params.projectId
  try {
    console.log([title, status, projectId])
    const sql = 'INSERT INTO todos (title, status, project_id) values ($1, $2, $3) RETURNING *;'
    let result = await db.query(sql, [title, status, projectId])
    res.json({ todos : result.rows })
  }
  catch(error) {
    res.status(500).json({ error })
  }
})

app.put('/projects/:projectId/todos/:todoId', authenticate, validateProject, async (req, res) => {
  const { title, status } = req.body
  const projectId = req.params.projectId
  const todoId = req.params.todoId
  try {
    const sql = 'UPDATE todos set title = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND project_id = $4 RETURNING *;'
    let result = await db.query(sql, [title, status, todoId, projectId])
    res.json({ todos: result.rows })
  }
  catch(error) {
    res.status(500).json({ error })
  }
})

app.delete('/projects/:projectId/todos/:todoId', authenticate, validateProject, async (req, res) => {
  const projectId = req.params.projectId
  const todoId = req.params.todoId
  try {
    const sql = 'DELETE FROM todos WHERE id = $1 AND project_id = $2 RETURNING *;'
    await db.query(sql, [todoId, projectId])
    res.json({ message: 'Todo deleted successfully' })
  }
  catch(error) {
    res.status(500).json({ error })
  }
})

app.get('/projects/:projectId/gist', authenticate, validateProject, async (req, res) => {
  const markdown = await getMarkdown(req.params.projectId)
  res.setHeader('Content-Type', 'text/markdown')
  res.setHeader('Content-Disposition', 'attachment;');
  res.send(Buffer.from(markdown))
})


export default app