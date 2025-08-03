import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { databaseMiddleware } from './middleware/database'

const app = createApp()

// Add database middleware to make D1 available to all routes
app.use('*', databaseMiddleware)

showRoutes(app)

export default app
