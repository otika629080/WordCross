// Database types for WordCross CMS
// All types are strictly typed - no 'any' usage allowed

export interface Site {
  id: number
  name: string
  domain: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Page {
  id: number
  site_id: number
  title: string
  slug: string
  content: string | null // JSON string of page components
  meta_title: string | null
  meta_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface PageComponent {
  id: number
  page_id: number
  component_type: ComponentType
  component_data: string // JSON string of component properties
  sort_order: number
  created_at: string
}

export interface AdminUser {
  id: number
  email: string
  password_hash: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Component types for the page builder
export type ComponentType = 'text' | 'image' | 'button' | 'heading' | 'spacer' | 'columns'

// Component data interfaces (TypeScript representations of JSON data)
export interface TextComponentData {
  content: string
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  textAlign: 'left' | 'center' | 'right'
  textColor: string
}

export interface ImageComponentData {
  src: string
  alt: string
  width: number
  height: number
  objectFit: 'cover' | 'contain' | 'fill'
}

export interface ButtonComponentData {
  text: string
  href: string
  variant: 'primary' | 'secondary' | 'outline'
  size: 'sm' | 'md' | 'lg'
}

export interface HeadingComponentData {
  text: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  textAlign: 'left' | 'center' | 'right'
}

export interface SpacerComponentData {
  height: number // in pixels
}

export interface ColumnsComponentData {
  columns: number // 2, 3, or 4
  gap: 'sm' | 'md' | 'lg'
  children: ComponentData[]
}

export type ComponentData = 
  | TextComponentData 
  | ImageComponentData 
  | ButtonComponentData 
  | HeadingComponentData 
  | SpacerComponentData 
  | ColumnsComponentData

// Database query result types
export interface DatabaseRow {
  [key: string]: string | number | boolean | null
}

export interface QueryResult<T = DatabaseRow> {
  results: T[]
  success: boolean
  meta?: {
    duration: number
    changes?: number
    last_row_id?: number
    rows_read?: number
    rows_written?: number
  }
}

// Input types for creating/updating records
export interface CreateSiteInput {
  name: string
  domain?: string
  description?: string
}

export interface UpdateSiteInput {
  name?: string
  domain?: string
  description?: string
}

export interface CreatePageInput {
  site_id: number
  title: string
  slug: string
  content?: string
  meta_title?: string
  meta_description?: string
  is_published?: boolean
}

export interface UpdatePageInput {
  title?: string
  slug?: string
  content?: string
  meta_title?: string
  meta_description?: string
  is_published?: boolean
}

export interface CreateComponentInput {
  page_id: number
  component_type: ComponentType
  component_data: ComponentData
  sort_order?: number
}

export interface CreateAdminUserInput {
  email: string
  password_hash: string
  name: string
  is_active?: boolean
}

// Environment bindings type for Cloudflare Workers
export interface Env {
  DB: D1Database
  // Future bindings will be added here:
  // KV: KVNamespace
  // R2: R2Bucket
  // AI: Ai
}

// Context variables for Hono
export interface Variables {
  db: ReturnType<typeof import('../lib/db').createDatabase>
  database: ReturnType<typeof import('../lib/db').createDatabase>
  user?: AdminUser
}

// Hono app type with proper bindings
export type HonoApp = import('hono').Hono<{
  Bindings: Env
  Variables: Variables
}>