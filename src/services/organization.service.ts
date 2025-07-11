import User from '../models/User.models'
import SubmissionPlan from '../models/SubmissionPlan.models'
import Section from '../models/Section.models'
import Question from '../models/Question.models'
import Submission from '../models/Submission.models'
import { statusCode } from '../utils/statusCode'
import { SubmissionStatus } from '../utils/constant'
import { IServiceResponse } from '../types/auth.interface'
import {
  IAnswerData,
  IDashboardPaginatedResponse,
  ISubmitSurveyData,
} from '../types/question.interface'
import { IPagination } from '../types/common.interface'
import mongoose from 'mongoose'
import { injectFileAnswersToSections } from '../helper/multer'

class OrganizationService {
  private findStatus(sectionId: string, submissions: any[]): string {
    const submission = submissions.find((sub: any) => sub.section?.toString() === sectionId)

    if (!submission) return SubmissionStatus.IN_PROGRESS

    return submission.status || SubmissionStatus.IN_PROGRESS
  }

  // Helper function to get plan status from user submission array
  private getPlanStatusFromUserSubmission(
    userSubmissions: any[],
    planId: string
  ): { status: string; pdfLink: string | null } {
    const userSubmissionForPlan = userSubmissions.find(
      (sub: any) => sub.subplan?.toString() === planId.toString()
    )

    return {
      status: userSubmissionForPlan ? userSubmissionForPlan.status : 'in-progress',
      pdfLink: userSubmissionForPlan ? userSubmissionForPlan.pdfLink : null,
    }
  }

  async getDashboard(
    userId: string,
    pagination: IPagination
  ): Promise<IServiceResponse<IDashboardPaginatedResponse>> {
    const { page = 1, limit = 10 } = pagination

    const user = await User.findById(userId)
    if (!user) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'User not found',
        data: {} as IDashboardPaginatedResponse,
      }
    }

    const skip = (page - 1) * limit
    const [plans, total] = await Promise.all([
      SubmissionPlan.find({}).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
      SubmissionPlan.countDocuments({}),
    ])

    // Process each plan using common function
    const processedPlans = plans.map((plan: any) => {
      const { status, pdfLink } = this.getPlanStatusFromUserSubmission(
        user.submission || [],
        plan._id
      )

      return {
        ...plan,
        status,
        pdfLink,
      }
    })

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Dashboard data retrieved successfully',
      data: {
        plans: processedPlans,
        pagination: {
          limit,
          page,
          total,
        },
      },
    }
  }

  async takeSurvey(
    userId: string,
    planId: string,
    userRole: string
  ): Promise<IServiceResponse<any>> {
    // Fetch user and plan
    const user = await User.findById(userId)
    if (!user) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'User not found',
        data: {},
      }
    }

    const planModel = await SubmissionPlan.findById(planId)
    if (!planModel) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'Plan not found',
        data: {},
      }
    }

    // Fetch all submissions for this user and plan
    const submissions = await Submission.find({
      subplan: planId,
      user: userId,
    }).lean()

    // Build a map: { [sectionId]: { [questionId]: ans[] } }
    const submissionMap: Record<string, Record<string, any[]>> = {}
    for (const sub of submissions) {
      const sectionId = sub.section?.toString()
      if (!sectionId) continue
      if (!submissionMap[sectionId]) submissionMap[sectionId] = {}
      for (const q of sub.questionair || []) {
        submissionMap[sectionId][q.question.toString()] = q.ans || []
      }
    }

    // Fetch all sections for the plan and user role
    const allSections = await Section.find({
      subplan: planId,
      role: { $in: [userRole.toLowerCase()] },
    })
      .populate({
        path: 'questions',
        match: { role: { $in: [userRole.toLowerCase()] } },
        options: { sort: { no: 1 } },
      })
      .sort({ no: 1 })
      .lean()

    // Build response sections
    const processedSections = allSections.map((section: any) => {
      const questions = (section.questions || []).map((question: any) => {
        const ans =
          (submissionMap[section._id.toString()] &&
            submissionMap[section._id.toString()][question._id.toString()]) ||
          []

        // Find the submission for this section
        const sectionSubmission = submissions.find(
          (sub: any) => sub.section?.toString() === section._id.toString()
        )

        // Find the questionair entry for this question
        const questionairEntry = sectionSubmission?.questionair?.find(
          (q: any) => q.question.toString() === question._id.toString()
        )

        // For file-type questions, if ans is empty, try to get from questionairEntry.ans
        let finalAns = ans
        if (
          question.qtype === 'file' &&
          (!ans || ans.length === 0) &&
          questionairEntry &&
          Array.isArray(questionairEntry.ans) &&
          questionairEntry.ans.length > 0
        ) {
          finalAns = questionairEntry.ans
        }

        // Map subQuestions with their answers from the nested structure
        let subQuestions = []
        if (Array.isArray(question.subQuestions) && question.subQuestions.length > 0) {
          subQuestions = question.subQuestions.map((subQ: any) => {
            // Find the sub-question answer in the nested subQuestions array
            const subQEntry = Array.isArray(questionairEntry?.subQuestions)
              ? questionairEntry.subQuestions.find(
                  (sq: any) => sq.question.toString() === subQ._id.toString()
                )
              : undefined
            return {
              ...subQ,
              ans: subQEntry?.ans || [],
              comment: subQEntry?.comment || '',
              needimprovement: subQEntry?.needImprovement || false,
            }
          })
        }

        return {
          ...question,
          ans: finalAns,
          comment: questionairEntry?.comment || '',
          needImprovement: questionairEntry?.needImprovement || false,
          subQuestions,
        }
      })

      let sectionStatus = this.findStatus(section._id.toString(), submissions)

      return {
        _id: section._id,
        no: section.no,
        subplan: section.subplan,
        role: section.role,
        createdAt: section.createdAt,
        title: section.title,
        updatedAt: section.updatedAt,
        questions,
        status: sectionStatus,
      }
    })

    const { status: planStatus } = this.getPlanStatusFromUserSubmission(
      user.submission || [],
      planId
    )

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Survey data retrieved successfully',
      data: {
        sections: processedSections,
        plan: planId,
        title: planModel.title,
        status: planStatus,
      },
    }
  }

  async submitSurvey(
    userId: string,
    userRole: string,
    payload: ISubmitSurveyData
  ): Promise<IServiceResponse<any>> {
    try {
      if (!payload || typeof payload !== 'object') {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Request payload is required and must be a valid object',
          data: null,
        }
      }

      // Basic validation for required parameters
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          statusCode: statusCode.UNAUTHORIZED,
          message: 'Valid user ID is required',
          data: null,
        }
      }

      if (!userRole || typeof userRole !== 'string') {
        return {
          success: false,
          statusCode: statusCode.UNAUTHORIZED,
          message: 'Valid user role is required',
          data: null,
        }
      }

      // Safely destructure payload with defaults
      const { sections = [], plan = '', status = '' } = payload || {}

      // Additional validation for destructured values
      if (!plan) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Plan ID is required',
          data: null,
        }
      }

      if (!status) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Submission status is required',
          data: null,
        }
      }

      if (!Array.isArray(sections) || sections.length === 0) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Sections array is required and cannot be empty',
          data: null,
        }
      }

      // Validate user exists
      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User not found',
          data: null,
        }
      }

      // Validate plan exists
      const planModel = await SubmissionPlan.findById(plan)
      if (!planModel) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'Submission plan not found',
          data: null,
        }
      }

      // Validate status
      const validStatuses = Object.values(SubmissionStatus)
      if (!validStatuses.includes(status as SubmissionStatus)) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Invalid submission status',
          data: null,
        }
      }

      const submissionResults = []
      const failedSections = []

      // Process each section
      for (const section of sections) {
        try {
          const sectionId = section._id

          // Validate section exists and belongs to the plan
          const sectionModel = await Section.findOne({
            _id: sectionId,
            subplan: plan,
            role: { $in: [userRole.toLowerCase()] },
          })

          if (!sectionModel) {
            failedSections.push({
              sectionId,
              error:
                'Section not found, does not belong to this plan, or user does not have access',
            })
            continue
          }

          // Find existing submission for this user, plan, and section
          let submission = await Submission.findOne({
            user: userId,
            subplan: plan,
            section: sectionId,
          })

          if (!submission) {
            // Create new submission with In Progress status initially
            submission = new Submission({
              user: userId,
              subplan: plan,
              section: sectionId,
              questionair: [],
              status: SubmissionStatus.IN_PROGRESS,
            })
          }

          const questionairData = []

          // Process questions with validation
          for (const question of section.questions) {
            if (question.ans && Array.isArray(question.ans) && question.ans.length > 0) {
              // Validate question exists and belongs to the section
              const questionModel = await Question.findOne({
                _id: question._id,
                section: sectionId,
                role: { $in: [userRole.toLowerCase()] },
              })

              if (!questionModel) {
                console.warn(
                  `Question ${question._id} not found, does not belong to section ${sectionId}, or user does not have access`
                )
                continue
              }

              // Process and validate answers
              const validAnswers = this.processQuestionAnswers(question.ans)

              if (validAnswers.length > 0) {
                questionairData.push({
                  question: new mongoose.Types.ObjectId(question._id),
                  ans: validAnswers,
                })
              }
            }
          }

          // Update submission
          submission.questionair = questionairData

          // Determine section status based on actual completion (not the overall plan status)
          const totalQuestions = await Question.countDocuments({
            section: sectionId,
            role: { $in: [userRole.toLowerCase()] },
          })

          const answeredQuestions = questionairData.length

          // Preserve special statuses like NEEDS_IMPROVEMENT if they were set by admin
          const currentStatus = submission.status

          if (currentStatus === SubmissionStatus.NEEDS_IMPROVEMENT) {
            // Don't change status if it was marked for improvement
            // Keep the existing status unless all questions are answered
            if (answeredQuestions === totalQuestions) {
              submission.status = SubmissionStatus.COMPLETE
            }
            // Otherwise keep NEEDS_IMPROVEMENT status
          } else {
            // Set section status based on actual completion
            if (answeredQuestions === 0) {
              // No questions answered yet
              submission.status = SubmissionStatus.IN_PROGRESS
            } else if (answeredQuestions === totalQuestions) {
              // All questions answered - mark as completed
              submission.status = SubmissionStatus.COMPLETE
            } else {
              // Partially answered - mark as in progress
              submission.status = SubmissionStatus.IN_PROGRESS
            }
          }

          submission.updatedAt = new Date()

          const savedSubmission = await submission.save()
          submissionResults.push(savedSubmission)
        } catch (sectionError) {
          console.error(`Error processing section ${section._id}:`, sectionError)
          failedSections.push({
            sectionId: section._id,
            error: (sectionError as Error).message,
          })
        }
      }

      // Update user's submission array with overall plan status
      if (!user.submission) {
        user.submission = []
      }

      const existingPlanSubmissionIndex = user.submission.findIndex(
        (entry: any) => entry.subplan?.toString() === plan.toString()
      )

      // Determine overall plan status based on section completion and requested status
      const allSectionsForPlan = await Section.countDocuments({
        subplan: plan,
        role: { $in: [userRole.toLowerCase()] },
      })

      const completedSectionsForPlan = await Submission.countDocuments({
        user: userId,
        subplan: plan,
        status: SubmissionStatus.COMPLETE,
      })

      let overallPlanStatus: string

      if (status === SubmissionStatus.SUBMITTED) {
        // User wants to submit - check if all sections are completed
        if (completedSectionsForPlan === allSectionsForPlan) {
          overallPlanStatus = SubmissionStatus.SUBMITTED
        } else {
          overallPlanStatus = SubmissionStatus.IN_PROGRESS
        }
      } else if (status === SubmissionStatus.DRAFT) {
        // User is saving as draft - use draft status regardless of completion
        overallPlanStatus = SubmissionStatus.DRAFT
      } else {
        // For other statuses, determine based on completion
        if (completedSectionsForPlan === allSectionsForPlan) {
          overallPlanStatus = SubmissionStatus.COMPLETE
        } else if (completedSectionsForPlan > 0) {
          overallPlanStatus = SubmissionStatus.IN_PROGRESS
        } else {
          overallPlanStatus = status // Use the requested status
        }
      }

      const submissionEntry: any = {
        subplan: plan,
        status: overallPlanStatus,
        submitted: [SubmissionStatus.SUBMITTED, SubmissionStatus.COMPLETE].includes(
          overallPlanStatus as SubmissionStatus
        ),
        submissionDate: new Date(),
        pdfLink: '',
      }

      if (existingPlanSubmissionIndex !== -1) {
        user.submission[existingPlanSubmissionIndex] = submissionEntry
      } else {
        user.submission.push(submissionEntry)
      }

      await user.save()

      // Calculate completion statistics
      const completionStats = await this.calculateCompletionStats(userId, plan)

      // Prepare response
      const responseMessage =
        failedSections.length > 0
          ? `Survey submitted with ${failedSections.length} section(s) having issues`
          : 'Survey submitted successfully'

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: responseMessage,
        data: {
          submissions: submissionResults,
          totalSections: sections.length,
          processedSections: submissionResults.length,
          failedSections: failedSections,
          status: overallPlanStatus,
          planTitle: planModel.title,
          completionStats,
        },
      }
    } catch (error) {
      console.error('[OrgService] submitSurvey error:', error)
      return {
        success: false,
        statusCode: statusCode.SERVER_ERROR,
        message: (error as Error).message,
        data: null,
      }
    }
  }

  async submitSurveyLegacy(payload: any): Promise<IServiceResponse<any>> {
    try {
      if (!payload) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Request payload is required',
          data: null,
        }
      }

      const { userId, userRole, ...restPayload } = payload

      if (!userId) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'userId is required in payload',
          data: null,
        }
      }

      if (!userRole) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'userRole is required in payload',
          data: null,
        }
      }

      // Call the main submitSurvey method
      return await this.submitSurvey(userId, userRole, restPayload)
    } catch (error) {
      console.error('[OrgService] submitSurveyLegacy error:', error)
      return {
        success: false,
        statusCode: statusCode.SERVER_ERROR,
        message: (error as Error).message,
        data: null,
      }
    }
  }

  // Helper function to process question answers
  private processQuestionAnswers(answers: IAnswerData[]): IAnswerData[] {
    if (!Array.isArray(answers)) return []

    return answers
      .filter((answer: IAnswerData) => {
        return (
          answer &&
          typeof answer.type === 'number' &&
          typeof answer.value === 'string' &&
          answer.value.trim().length > 0
        )
      })
      .map((answer: IAnswerData) => ({
        ...answer,
        value: answer.value.trim(), // Clean up whitespace
      }))
  }

  // Helper function to calculate survey completion stats
  private async calculateCompletionStats(
    userId: string,
    plan: string
  ): Promise<{
    totalSections: number
    completedSections: number
    completionPercentage: number
  }> {
    const totalSections = await Section.countDocuments({ subplan: plan })
    const completedSections = await Submission.countDocuments({
      user: userId,
      subplan: plan,
      status: SubmissionStatus.COMPLETE,
    })

    const completionPercentage =
      totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

    return {
      totalSections,
      completedSections,
      completionPercentage,
    }
  }

  async submitSubmissionWithFiles(req: any) {
      const { plan, status } = req.body
      const userId = req.user?.id
      let sections = req.body.sections
      let file_map = req.body.fileMap

      if (!plan || !userId || !status || !sections) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Missing required fields',
        }
      }

      if (typeof sections === 'string') sections = JSON.parse(sections)
      if (typeof file_map === 'string') file_map = JSON.parse(file_map)

      const fileMapByQuestion = Object.fromEntries(
        (file_map || []).map((f: any) => [f.questionId.toString(), f])
      )
      const filesByName = Object.fromEntries(
        (req.files || []).map((file: any) => [file.originalname, file])
      )

      injectFileAnswersToSections(sections, fileMapByQuestion, filesByName)

      const submissionIds: any[] = []

      for (const section of sections) {
        const questionair = (section.questions || []).map((q: any) => ({
          question: q._id,
          ans: q.ans || [],
          subQuestions: (q.subQuestions || []).map((subQ: any) => ({
            question: subQ._id,
            ans: subQ.ans || [],
          })),
        }))

        let submission = await Submission.findOne({
          user: userId,
          section: section._id,
          subplan: plan,
        })

        if (submission) {
          submission.status = section.status || status
          submission.questionair = questionair
          await submission.save()
        } else {
          submission = await Submission.create({
            user: userId,
            section: section._id,
            subplan: plan,
            status: section.status || status,
            questionair,
          })
        }

        submissionIds.push(submission._id)
      }

      const userDoc = await User.findById(userId)
      if (!userDoc) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User not found',
        }
      }

      const planIdStr = plan.toString()
      if (!userDoc.submission) userDoc.submission = []

      let found = false
      for (const sub of userDoc.submission) {
        if (sub.subplan?.toString() === planIdStr) {
          sub.status = status
          if (typeof status === 'string' && status.trim().toLowerCase() === 'submitted') {
            sub.submitted = true
            sub.submissionDate = new Date()
          } else {
            sub.submitted = false
            sub.submissionDate = undefined
          }
          found = true
        }
      }

      if (!found) {
        userDoc.submission.push({
          subplan: plan,
          status,
          submitted: typeof status === 'string' && status.trim().toLowerCase() === 'submitted',
          pdfLink: '',
          submissionDate:
            typeof status === 'string' && status.trim().toLowerCase() === 'submitted'
              ? new Date()
              : undefined,
        } as any)
      }

      await userDoc.save()

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Submission saved successfully',
        data: { submissionIds },
      }

  }
}

const organizationService = new OrganizationService()
export default organizationService
