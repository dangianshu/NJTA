import User from '../models/User.models'
import { ISubmissionPlan } from '../types/submissionPlan.interface'
import { SubmissionStatus } from '../utils/constant'

export function getRoleByCode(code: string): 'user' | 'evaluator' {
  if (code.startsWith('EVAL')) return 'evaluator'
  if (code.startsWith('NJA')) return 'user'
  return 'user'
}

export function generateCustomPassword(): string {
  const upper = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const lowers = Array.from({ length: 3 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join('')
  const specialChars = '@#$%&*!'
  const special = specialChars[Math.floor(Math.random() * specialChars.length)]
  const digits = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('')
  return upper + lowers + special + digits
}

export function getTypeByCode(code: string) {
  if (code.startsWith('EVAL')) return 'Evaluator'
  if (code.startsWith('NJA')) return 'Organization'
  return 'Unknown'
}

// Find answers for a question in submissions
export function findAnswers(sectionId: string, questionId: string, submissions: any[]): any[] {
  for (const submission of submissions) {
    if (submission.section?.toString() === sectionId) {
      const questionair = submission.questionair.find(
        (q: any) => q.question.toString() === questionId
      )
      if (questionair) {
        return questionair.ans || []
      }
    }
  }
  return []
}

// Find section status
export function findStatus(
  sectionId: string,
  submissions: any[],
  totalQuestions: number,
  SubmissionStatus: any
): string {
  const submission = submissions.find((sub: any) => sub.section?.toString() === sectionId)
  if (!submission) return 'incomplete'
  const answeredQuestions = submission.questionair?.length || 0
  if (submission.status === SubmissionStatus.NEEDS_IMPROVEMENT) {
    return SubmissionStatus.NEEDS_IMPROVEMENT
  }
  if (answeredQuestions === totalQuestions) {
    return SubmissionStatus.COMPLETED
  } else if (answeredQuestions > 0) {
    return SubmissionStatus.IN_PROGRESS
  }
  return 'incomplete'
}

// Validate submission payload
export function validateSubmissionPayload(payload: any): { isValid: boolean; message?: string } {
  const { sections, plan, status } = payload
  if (!plan || typeof plan !== 'string') {
    return { isValid: false, message: 'Invalid or missing plan ID' }
  }
  if (!status || typeof status !== 'string') {
    return { isValid: false, message: 'Invalid or missing status' }
  }
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return { isValid: false, message: 'Invalid or empty sections array' }
  }
  for (const section of sections) {
    if (!section._id || typeof section._id !== 'string') {
      return { isValid: false, message: 'Section missing valid _id' }
    }
    if (!section.questions || !Array.isArray(section.questions)) {
      return { isValid: false, message: `Section ${section._id} missing valid questions array` }
    }
    for (const question of section.questions) {
      if (!question._id || typeof question._id !== 'string') {
        return { isValid: false, message: `Question missing valid _id in section ${section._id}` }
      }
      if (question.ans && !Array.isArray(question.ans)) {
        return { isValid: false, message: `Question ${question._id} has invalid answers format` }
      }
    }
  }
  return { isValid: true }
}

// Process question answers
export function processQuestionAnswers(answers: any[]): any[] {
  if (!Array.isArray(answers)) return []
  return answers
    .filter((answer: any) => {
      return (
        answer &&
        typeof answer.type === 'number' &&
        typeof answer.value === 'string' &&
        answer.value.trim().length > 0
      )
    })
    .map((answer: any) => ({
      ...answer,
      value: answer.value.trim(),
    }))
}

// Calculate survey completion stats
export async function calculateCompletionStats(
  Section: any,
  Submission: any,
  userId: string,
  plan: string,
  SubmissionStatus: any
) {
  const totalSections = await Section.countDocuments({ subplan: plan })
  const completedSections = await Submission.countDocuments({
    user: userId,
    subplan: plan,
    status: SubmissionStatus.COMPLETED,
  })
  const completionPercentage =
    totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0
  return {
    totalSections,
    completedSections,
    completionPercentage,
  }
}

export async function getUserRoleById(userId: string): Promise<string | null> {
  const user = await User.findById(userId).select('role')
  return user?.role?.toLowerCase() || null
}

export async function toPlainObject<T = any>(doc: T, excludeFields: string[] = []): Promise<T> {
  if (!doc) return doc
  const obj = typeof (doc as any).toObject === 'function' ? (doc as any).toObject() : doc
  excludeFields.forEach(field => delete obj[field])
  return obj
}

export function getSubmissionStatus(
  userSubmissions: any[],
  plan: ISubmissionPlan
): { status: string; pdfLink: string | null } {
  const planId = plan._id.toString()
  const currentDate = new Date()

  const regularStart = plan.regularSubmissionStartDate
    ? new Date(plan.regularSubmissionStartDate)
    : null

  const regularEnd = plan.regularSubmissionEndDate
    ? new Date(plan.regularSubmissionEndDate)
    : null

  const reSubmitDate = plan.reSubmissionDate
    ? new Date(plan.reSubmissionDate)
    : null

  // If plan hasn't started
  if (!regularStart || currentDate < regularStart) {
    return {
      status: 'not-started',
      pdfLink: null,
    }
  }

  // Get user's submission entry for this plan
  const userSubmission = userSubmissions.find(
    (sub: any) => sub.subplan?.toString() === planId
  )

  // If submission exists and has a defined status, use it (unless we override below)
  let finalStatus = userSubmission?.status || SubmissionStatus.IN_PROGRESS
  let pdfLink = userSubmission?.pdfLink || null

  const hasRegularEnded = regularEnd && currentDate > regularEnd

  if (hasRegularEnded) {
    const isInReSubmissionWindow = reSubmitDate && currentDate <= reSubmitDate

    if (!isInReSubmissionWindow) {
      finalStatus = 'submission-closed'
    }
  }

  return {
    status: finalStatus,
    pdfLink,
  }
}
