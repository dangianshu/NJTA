import User from '../models/User.models'
import bcrypt from 'bcrypt'

export const seedUsers = async () => {
  try {
    // Drop the collection to remove old indexes
    await User.collection.drop().catch(() => console.log('Collection does not exist yet'))

    // Clear any remaining documents
    await User.deleteMany({})

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
        code: 'NJACCESS426',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Hudson Valley Theatre',
        contact: 'Drama Department',
        code: 'NJACCESS427',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Atlantic City Arts Council',
        contact: 'Community Outreach',
        code: 'NJACCESS428',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Trenton Cultural Foundation',
        contact: 'Program Director',
        code: 'NJACCESS429',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Trenton Cultural Foundation',
        contact: 'Program Director',
        code: 'NJACCESS430',
        role: 'user',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Trenton Cultural Foundation',
        contact: 'Program Director',
        code: 'NJACCESS431',
        role: 'user',
        isVerified: false,
        submission: [],
      },
    ]

    const evaluators = [
      {
        name: 'New Jersey Theatre Alliance (Evaluator)',
        contact: 'Alex and Dani',
        email: 'eval126@yopmail.com',
        password: 'Testeval@123',
        code: 'EVAL126',
        role: 'evaluator',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Arts Council Evaluator',
        contact: 'Sarah Johnson',
        code: 'EVAL127',
        role: 'evaluator',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Cultural Assessment Team',
        contact: 'Michael Chen',
        code: 'EVAL128',
        role: 'evaluator',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Performance Review Board',
        contact: 'Lisa Martinez',
        code: 'EVAL129',
        role: 'evaluator',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Performance Review Board',
        contact: 'Lisa Martinez',
        code: 'EVAL130',
        role: 'evaluator',
        isVerified: false,
        submission: [],
      },
      {
        name: 'Performance Review Board',
        contact: 'Lisa Martinez',
        email: 'eval@yopmail.com',
        password: 'Test@12345',
        code: 'EVAL131',
        role: 'evaluator',
        isVerified: true,
        submission: [],
      },
    ]

    const admins = [
      {
        name: 'NJTA System Administrator',
        contact: 'IT Department',
        email: 'admin@yopmail.com',
        password: 'Admin@123',
        code: 'ADMIN001',
        role: 'admin',
        isVerified: true,
        submission: [],
      },
    ]

    // Insert all users
    const allUsers = [...organizations, ...evaluators, ...admins]
    for (const user of [...evaluators, ...admins]) {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    }

    await User.insertMany(allUsers)

    console.log(`✅ Seeded users successfully:`)
    console.log(`   📋 ${organizations.length} Organizations (code-based registration)`)
    console.log(`   🔍 ${evaluators.length} Evaluators (with login access)`)
    console.log(`   👑 ${admins.length} Admins (full access)`)

    return allUsers
  } catch (error) {
    console.error('❌ Error seeding users:', error instanceof Error ? error.message : error)
    throw error
  }
}
