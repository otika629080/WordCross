import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { databaseMiddleware } from './middleware/database'
import { authMiddleware } from './middleware/auth'

const app = createApp()

// Add database middleware to make D1 available to all routes
app.use('*', databaseMiddleware)

// Add auth middleware to handle authentication
app.use('*', authMiddleware)

showRoutes(app)

export default app
