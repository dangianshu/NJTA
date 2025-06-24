import  User  from '../models/User.models'
import bcrypt from 'bcrypt';

export const seedUsers = async (): Promise<void> => {
  try {
    // Drop the collection to remove old indexes
    await User.collection.drop().catch(() => console.log('Collection does not exist yet'));
    console.log('🗑️ Dropped users collection and indexes')
    
    // Clear any remaining documents
    await User.deleteMany({})
    console.log('🗑️ Cleared existing users')

    // Organizations - only basic info (they register with code later)
    const organizations = [
      {
        name: 'Bay Atlantic Symphony',
        contact: 'Music Team',
        code: 'NJACCESS425',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Princeton Art Center',
        contact: 'Cultural Affairs',
        code: 'NJACCESS510',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Hudson Valley Theatre',
        contact: 'Drama Department',
        code: 'NJACCESS622',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Atlantic City Arts Council',
        contact: 'Community Outreach',
        code: 'NJACCESS733',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Trenton Cultural Foundation',
        contact: 'Program Director',
        code: 'NJACCESS844',
        role: 'user',
        isVerified: false,
        submission: [],
      },
    ]

    // Evaluators - full details with login access
    const evaluators = [
      {
        name: 'New Jersey Theatre Alliance (Evaluator)',
        contact: 'Alex and Dani',
        email: 'eval126@njta.org',
        password: 'eval123', // Will be hashed by model
        code: 'EVAL126',
        role: 'evaluator',
        isVerified: true,
        submission: [],
      },
      {
        name: 'Arts Council Evaluator',
        contact: 'Sarah Johnson',
        email: 'eval127@njta.org',
        password: 'eval123',
        code: 'EVAL127',
        role: 'evaluator',
        isVerified: true,
        submission: [],
      },
      {
        name: 'Cultural Assessment Team',
        contact: 'Michael Chen',
        email: 'eval128@njta.org',
        password: 'eval123',
        code: 'EVAL128',
        role: 'evaluator',
        isVerified: true,
        submission: [],
      },
      {
        name: 'Performance Review Board',
        contact: 'Lisa Martinez',
        email: 'eval129@njta.org',
        password: 'eval123',
        code: 'EVAL129',
        role: 'evaluator',
        isVerified: true,
        submission: [],
      },
    ]

    // Admins - full administrative access
    const admins = [
      {
        name: 'NJTA System Administrator',
        contact: 'IT Department',
        email: 'admin@njta.org',
        password: 'admin123',
        code: 'ADMIN001',
        role: 'admin',
        isVerified: true,
        isActive: true,
        submission: [],
      },
      {
        name: 'Portal Administrator',
        contact: 'Operations Team',
        email: 'portaladmin@njta.org',
        password: 'admin123',
        code: 'ADMIN002',
        role: 'admin',
        isVerified: true,
        isActive: true,
        submission: [],
      },
      {
        name: 'Super Admin',
        contact: 'Management',
        email: 'superadmin@njta.org',
        password: 'admin123',
        code: 'ADMIN003',
        role: 'admin',
        isVerified: true,
        isActive: true,
        submission: [],
      },
    ]

    // Insert all users
    const allUsers = [...organizations, ...evaluators, ...admins]
    for (const user of [...evaluators, ...admins]) {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
}
    await User.insertMany(allUsers)

    console.log(`✅ Seeded users successfully:`)
    console.log(`   📋 ${organizations.length} Organizations (code-based registration)`)
    console.log(`   🔍 ${evaluators.length} Evaluators (with login access)`)
    console.log(`   👑 ${admins.length} Admins (full access)`)

  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  }
}

export default seedUsers
