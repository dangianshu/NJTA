import mongoose from 'mongoose'
import SubmissionPlan from '../models/SubmissionPlan.models'

export const submissionPlanSeedData = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'FY 2023-2025',
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'FY 2026-2028',
  }
]

export async function seedSubmissionPlans() {
  try {
    // Use bulk operations for better performance
    const bulkOps = submissionPlanSeedData.map((plan) => ({
      updateOne: {
        filter: { _id: plan._id },
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
