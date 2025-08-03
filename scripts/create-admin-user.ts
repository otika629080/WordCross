import { Database } from '../app/lib/db'
import { hashPassword } from '../app/lib/auth'

// This script creates an initial admin user for testing
// Usage: tsx scripts/create-admin-user.ts

async function createAdminUser() {
  // In a real environment, you'd connect to your actual D1 database
  // For now, this shows the structure needed
  
  const email = 'admin@wordcross.local'
  const password = 'admin123' // Change this in production!
  const name = 'Admin User'
  
  try {
    const passwordHash = await hashPassword(password)
    
    console.log('Admin user details:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Password Hash:', passwordHash)
    console.log('Name:', name)
    console.log('')
    console.log('SQL to run:')
    console.log(`INSERT INTO admin_users (email, password_hash, name, is_active) VALUES ('${email}', '${passwordHash}', '${name}', TRUE);`)
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

createAdminUser()