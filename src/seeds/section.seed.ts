import mongoose from 'mongoose'
import Section from '../models/Section.models'
import SubmissionPlan from '../models/SubmissionPlan.models'

export const sectionSeedData = [
  {
    no: 1,
    role: ['user'],
    title: 'Organizational Policies and Practices',
  },
  {
    no: 2,
    role: ['user'],
    title: 'Employment/Volunteer Practices',
  },
  {
    no: 3,
    role: ['user'],
    title: 'Program Practices',
  },
]

export async function seedSections() {
  try {
    // Get all submission plans
    const submissionPlans = await SubmissionPlan.find({}).lean()

    if (submissionPlans.length === 0) {
      console.warn('⚠️ No submission plans found. Please run submission plan seeding first.')
      return []
    }

    let allSections = []

    // Create sections for each submission plan
    for (const plan of submissionPlans) {
      const sectionsForPlan = sectionSeedData.map((section) => ({
        _id: new mongoose.Types.ObjectId(),
        ...section,
        subplan: plan._id,
      }))

      allSections.push(...sectionsForPlan)
    }

    // Use bulk operations for better performance
    const bulkOps = allSections.map((section) => ({
      updateOne: {
        filter: {
          no: section.no,
          subplan: section.subplan,
          role: section.role,
        },
        update: { $set: section },
        upsert: true,
      },
    }))

    if (bulkOps.length > 0) {
      await Section.bulkWrite(bulkOps)
      console.log(
        `✅ ${allSections.length} sections inserted/updated successfully across ${submissionPlans.length} submission plans.`
      )
    }

    return allSections
  } catch (error) {
    console.error('❌ Error seeding sections:', error instanceof Error ? error.message : error)
    throw error
  }
}
