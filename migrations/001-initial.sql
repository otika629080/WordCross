-- Initial database schema for WordCross CMS
-- Created: 2025-08-03

-- Sites table: Multi-tenant support for multiple websites
CREATE TABLE sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pages table: Content pages for each site
CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT, -- JSON data for page components
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  UNIQUE(site_id, slug)
);

-- Page components table: Individual components within pages
CREATE TABLE page_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL,
  component_type TEXT NOT NULL, -- 'text', 'image', 'button', 'heading', 'spacer', 'columns'
  component_data TEXT NOT NULL, -- JSON data for component properties
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- Admin users table: CMS administrators
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_pages_site_id ON pages(site_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published);
CREATE INDEX idx_page_components_page_id ON page_components(page_id);
CREATE INDEX idx_page_components_sort_order ON page_components(sort_order);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Insert default admin user (password: admin123 - change in production)
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@wordcross.dev', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User');

-- Insert default site
INSERT INTO sites (name, domain, description) 
VALUES ('WordCross Demo', 'demo.wordcross.dev', 'Demo site for WordCross CMS');