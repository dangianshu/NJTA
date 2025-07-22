import mongoose from 'mongoose'
import SubmissionPlan from '../models/SubmissionPlan.models'

export const submissionPlanSeedData = [
  {
    title: 'FY 2024-2026',
  },
  {
    title: 'FY 2027-2029',
  }
]

export async function seedSubmissionPlans() {
  try {
    // Use bulk operations for better performance
    const bulkOps = submissionPlanSeedData.map((plan) => ({
      updateOne: {
        filter: { title: plan.title },
        update: { $set: plan },
        upsert: true,
      },
    }))

    if (bulkOps.length > 0) {
      await SubmissionPlan.bulkWrite(bulkOps)
      console.log(
        `✅ ${submissionPlanSeedData.length} submission plans inserted/updated successfully.`
      )
    }

    return submissionPlanSeedData
  } catch (error) {
    console.error(
      '❌ Error seeding submission plans:',
      error instanceof Error ? error.message : error
    )
    throw error
  }
}
