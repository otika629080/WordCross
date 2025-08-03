import type {} from 'hono'
import type { Env, Variables } from './types/database'

declare module 'hono' {
  interface Env {
    Variables: Variables
    Bindings: Env
  }
}
