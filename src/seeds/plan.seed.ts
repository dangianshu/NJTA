
import SubmissionPlan from '../models/SubmissionPlan.models'

export const submissionPlanSeedData = [
  {
    title: 'FY 2022-2024',
    dueDate: new Date('2024-05-01T00:00:00.000Z'),
    reSubmissionDate: new Date('2021-10-22T00:00:00.000Z'),

  },
  {
    title: 'FY 2023-2025',
    dueDate: new Date('2025-05-01T00:00:00.000Z'),
    reSubmissionDate: new Date('2023-07-01T00:00:00.000Z'),

  },
  {
    title: 'FY 2024-2026',
    dueDate: new Date('2026-05-01T00:00:00.000Z'),
    reSubmissionDate: new Date('2024-12-31T00:00:00.000Z'),

  },
  {
    title: 'FY 2025-2027',
    dueDate: new Date('2027-05-01T00:00:00.000Z'),
    reSubmissionDate: new Date('2025-12-31T00:00:00.000Z'),
  }
  ,
  {
    title: 'FY 2026-2028',
    dueDate: new Date('2028-05-01T00:00:00.000Z'),
    reSubmissionDate: new Date('2026-12-31T00:00:00.000Z'),
  },
  {
    title: 'FY 2036-2038',
    dueDate: new Date('2028-05-01T00:00:00.000Z'),
    reSubmissionDate: new Date('2026-12-31T00:00:00.000Z'),
  }
]

export async function seedSubmissionPlans() {
  await SubmissionPlan.deleteMany({})
  await SubmissionPlan.insertMany(submissionPlanSeedData)
  console.log('Submission plans seeded!')
}