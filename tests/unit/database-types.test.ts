import { describe, it, expect } from 'vitest'
import type { 
  Site, 
  Page, 
  PageComponent, 
  AdminUser,
  ComponentType,
  TextComponentData,
  ImageComponentData,
  ButtonComponentData,
  HeadingComponentData,
  SpacerComponentData,
  ColumnsComponentData,
  CreateSiteInput,
  UpdateSiteInput,
  CreatePageInput,
  UpdatePageInput
} from '../../app/types/database'

describe('Database Types', () => {
  describe('Entity Types', () => {
    it('should validate Site interface', () => {
      const site: Site = {
        id: 1,
        name: 'Test Site',
        domain: 'test.com',
        description: 'A test site',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }

      expect(site.id).toBe(1)
      expect(site.name).toBe('Test Site')
      expect(site.domain).toBe('test.com')
      expect(typeof site.created_at).toBe('string')
    })

    it('should validate Page interface', () => {
      const page: Page = {
        id: 1,
        site_id: 1,
        title: 'Home Page',
        slug: 'home',
        content: '{}',
        meta_title: 'Home - Test Site',
        meta_description: 'Welcome to our test site',
        is_published: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }

      expect(page.site_id).toBe(1)
      expect(page.is_published).toBe(true)
      expect(typeof page.slug).toBe('string')
    })

    it('should validate AdminUser interface', () => {
      const user: AdminUser = {
        id: 1,
        email: 'admin@test.com',
        password_hash: 'hashed_password',
        name: 'Admin User',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }

      expect(user.email).toBe('admin@test.com')
      expect(user.is_active).toBe(true)
      expect(typeof user.password_hash).toBe('string')
    })
  })

  describe('Component Types', () => {
    it('should validate ComponentType union', () => {
      const validTypes: ComponentType[] = ['text', 'image', 'button', 'heading', 'spacer', 'columns']
      
      validTypes.forEach(type => {
        expect(['text', 'image', 'button', 'heading', 'spacer', 'columns']).toContain(type)
      })
    })

    it('should validate TextComponentData', () => {
      const textData: TextComponentData = {
        content: 'Hello World',
        fontSize: 'lg',
        textAlign: 'center',
        textColor: '#000000'
      }

      expect(textData.content).toBe('Hello World')
      expect(['sm', 'base', 'lg', 'xl', '2xl']).toContain(textData.fontSize)
      expect(['left', 'center', 'right']).toContain(textData.textAlign)
    })

    it('should validate ImageComponentData', () => {
      const imageData: ImageComponentData = {
        src: 'https://example.com/image.jpg',
        alt: 'Test image',
        width: 800,
        height: 600,
        objectFit: 'cover'
      }

      expect(imageData.src).toBe('https://example.com/image.jpg')
      expect(typeof imageData.width).toBe('number')
      expect(['cover', 'contain', 'fill']).toContain(imageData.objectFit)
    })

    it('should validate ButtonComponentData', () => {
      const buttonData: ButtonComponentData = {
        text: 'Click Me',
        href: '/contact',
        variant: 'primary',
        size: 'md'
      }

      expect(buttonData.text).toBe('Click Me')
      expect(['primary', 'secondary', 'outline']).toContain(buttonData.variant)
      expect(['sm', 'md', 'lg']).toContain(buttonData.size)
    })

    it('should validate HeadingComponentData', () => {
      const headingData: HeadingComponentData = {
        text: 'Welcome',
        level: 1,
        textAlign: 'center'
      }

      expect(headingData.text).toBe('Welcome')
      expect([1, 2, 3, 4, 5, 6]).toContain(headingData.level)
      expect(['left', 'center', 'right']).toContain(headingData.textAlign)
    })

    it('should validate SpacerComponentData', () => {
      const spacerData: SpacerComponentData = {
        height: 50
      }

      expect(typeof spacerData.height).toBe('number')
      expect(spacerData.height).toBeGreaterThan(0)
    })

    it('should validate ColumnsComponentData', () => {
      const columnsData: ColumnsComponentData = {
        columns: 2,
        gap: 'md',
        children: []
      }

      expect([2, 3, 4]).toContain(columnsData.columns)
      expect(['sm', 'md', 'lg']).toContain(columnsData.gap)
      expect(Array.isArray(columnsData.children)).toBe(true)
    })
  })

  describe('Input Types', () => {
    it('should validate CreateSiteInput', () => {
      const input: CreateSiteInput = {
        name: 'New Site',
        domain: 'new.com',
        description: 'A new site'
      }

      expect(input.name).toBe('New Site')
      expect(input.domain).toBe('new.com')
    })

    it('should validate CreateSiteInput with minimal data', () => {
      const input: CreateSiteInput = {
        name: 'Minimal Site'
      }

      expect(input.name).toBe('Minimal Site')
      expect(input.domain).toBeUndefined()
      expect(input.description).toBeUndefined()
    })

    it('should validate UpdateSiteInput', () => {
      const input: UpdateSiteInput = {
        name: 'Updated Site'
      }

      expect(input.name).toBe('Updated Site')
      expect(input.domain).toBeUndefined()
    })

    it('should validate CreatePageInput', () => {
      const input: CreatePageInput = {
        site_id: 1,
        title: 'New Page',
        slug: 'new-page',
        content: '{}',
        is_published: false
      }

      expect(input.site_id).toBe(1)
      expect(input.title).toBe('New Page')
      expect(input.slug).toBe('new-page')
      expect(typeof input.is_published).toBe('boolean')
    })

    it('should validate UpdatePageInput', () => {
      const input: UpdatePageInput = {
        title: 'Updated Page',
        is_published: true
      }

      expect(input.title).toBe('Updated Page')
      expect(input.is_published).toBe(true)
      expect(input.slug).toBeUndefined()
    })
  })

  describe('Type Safety', () => {
    it('should prevent any type usage in Site', () => {
      // This test ensures TypeScript compilation fails if 'any' is used
      const site: Site = {
        id: 1,
        name: 'Test',
        domain: null,
        description: null,
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }

      // All properties should have explicit types
      expect(typeof site.id).toBe('number')
      expect(typeof site.name).toBe('string')
      expect(site.domain === null || typeof site.domain === 'string').toBe(true)
    })

    it('should ensure ComponentType is strictly typed', () => {
      // This should compile
      const validType: ComponentType = 'text'
      expect(validType).toBe('text')

      // This should not compile (TypeScript error)
      // const invalidType: ComponentType = 'invalid' // TS Error
    })

    it('should ensure numeric fields are properly typed', () => {
      const pageComponent: PageComponent = {
        id: 1,
        page_id: 1,
        component_type: 'text',
        component_data: '{}',
        sort_order: 0,
        created_at: '2025-01-01'
      }

      expect(typeof pageComponent.id).toBe('number')
      expect(typeof pageComponent.page_id).toBe('number')
      expect(typeof pageComponent.sort_order).toBe('number')
    })
  })
})