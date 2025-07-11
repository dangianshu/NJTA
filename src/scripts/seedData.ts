import mongoose from 'mongoose'
import { seedUsers } from '../seeds/users.seed'
import { seedSubmissionPlans } from '../seeds/plan.seed'
import { seedSections } from '../seeds/section.seed'
import { seedQuestions } from '../seeds/question.seed'
import { SeedManager } from '../utils/seedUtils'

export async function runAllSeeds() {
  const seedManager = new SeedManager()
  let users: any[] = []
  let plans: any[] = []
  let sections: any[] = []
  let questions: any[] = []

  try {
    console.log('🚀 Starting database seeding process...')

    // Step 1: Seed users
    console.log('\n📤 Step 1: Seeding users...')
    try {
      users = await seedUsers()
      await seedManager.logSeedResult('Users', Array.isArray(users) ? users.length : 0, true)
    } catch (error) {
      await seedManager.logSeedResult(
        'Users',
        0,
        false,
        error instanceof Error ? error.message : String(error)
      )
    }

    // Step 2: Seed submission plans
    console.log('\n📋 Step 2: Seeding submission plans...')
    try {
      plans = await seedSubmissionPlans()
      await seedManager.logSeedResult(
        'SubmissionPlans',
        Array.isArray(plans) ? plans.length : 0,
        true
      )
    } catch (error) {
      await seedManager.logSeedResult(
        'SubmissionPlans',
        0,
        false,
        error instanceof Error ? error.message : String(error)
      )
    }

    // Step 3: Seed sections (linked to submission plans)
    console.log('\n📂 Step 3: Seeding sections...')
    try {
      sections = await seedSections()
      await seedManager.logSeedResult(
        'Sections',
        Array.isArray(sections) ? sections.length : 0,
        true
      )
    } catch (error) {
      await seedManager.logSeedResult(
        'Sections',
        0,
        false,
        error instanceof Error ? error.message : String(error)
      )
    }

    // Step 4: Seed questions (linked to sections)
    console.log('\n❓ Step 4: Seeding questions...')
    try {
      questions = await seedQuestions()
      await seedManager.logSeedResult(
        'Questions',
        Array.isArray(questions) ? questions.length : 0,
        true
      )
    } catch (error) {
      await seedManager.logSeedResult(
        'Questions',
        0,
        false,
        error instanceof Error ? error.message : String(error)
      )
    }

    // Print summary
    seedManager.printSummary()

    console.log('\n✅ Database seeding process completed!')

    return {
      users: Array.isArray(users) ? users.length : 0,
      plans: Array.isArray(plans) ? plans.length : 0,
      sections: Array.isArray(sections) ? sections.length : 0,
      questions: Array.isArray(questions) ? questions.length : 0,
      summary: seedManager.getSummary(),
    }
  } catch (error) {
    console.error('❌ Error running seeds:', error instanceof Error ? error.message : error)
    seedManager.printSummary()
    throw error
  }
}

export async function clearAllData() {
  try {
    console.log('🧹 Clearing all data...')

    // Clear in reverse dependency order
    const Question = (await import('../models/Question.models')).default
    const Section = (await import('../models/Section.models')).default
    const SubmissionPlan = (await import('../models/SubmissionPlan.models')).default
    const User = (await import('../models/User.models')).default

    await Question.deleteMany({})
    console.log('   - Questions cleared')

    await Section.deleteMany({})
    console.log('   - Sections cleared')

    await SubmissionPlan.deleteMany({})
    console.log('   - Submission plans cleared')

    await User.deleteMany({})
    console.log('   - Users cleared')

    console.log('✅ All data cleared successfully!')
  } catch (error) {
    console.error('❌ Error clearing data:', error instanceof Error ? error.message : error)
    throw error
  }
}

export async function reseedAllData() {
  try {
    console.log('🔄 Re-seeding all data...')
    await clearAllData()
    await runAllSeeds()
    console.log('✅ Re-seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error re-seeding data:', error instanceof Error ? error.message : error)
    throw error
  }
}
