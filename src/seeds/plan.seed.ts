import mongoose from 'mongoose'
import SubmissionPlan from '../models/SubmissionPlan.models'

export const submissionPlanSeedData = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'FY 2022-2024',
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'FY 2024-2026',
  },
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   title: 'FY 2024-2026',
  //   dueDate: new Date('2026-05-01T00:00:00.000Z'),
  //   reSubmissionDate: new Date('2024-12-31T00:00:00.000Z'),
  // },
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   title: 'FY 2025-2027',
  //   dueDate: new Date('2027-05-01T00:00:00.000Z'),
  //   reSubmissionDate: new Date('2025-12-31T00:00:00.000Z'),
  // },
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   title: 'FY 2026-2028',
  //   dueDate: new Date('2028-05-01T00:00:00.000Z'),
  //   reSubmissionDate: new Date('2026-12-31T00:00:00.000Z'),
  // },
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   title: 'FY 2036-2038',
  //   dueDate: new Date('2038-05-01T00:00:00.000Z'),
  //   reSubmissionDate: new Date('2036-12-31T00:00:00.000Z'),
  // }
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
