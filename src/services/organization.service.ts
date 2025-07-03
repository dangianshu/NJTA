import User from '../models/User.models'
import SubmissionPlan from '../models/SubmissionPlan.models'
import Section from '../models/Section.models'
import Question from '../models/Question.models'
import Submission from '../models/Submission.models'
import { statusCode } from '../utils/statusCode'
import { SubmissionStatus } from '../utils/constante'
import { IServiceResponse } from '../types/auth.interface'
import { ISubmissionViewData, ISubmitQuestionData, IAnswerData, IDashboardPaginatedResponse, ISubmitSurveyPayload, ISubmitSurveyData } from '../types/question.interface'
import { IPagination } from '../types/common.interface'
import mongoose from 'mongoose'

class OrganizationService {
  // Helper function to find answers in submissions
  private findAnswers(sectionId: string, questionId: string, submissions: any[]): IAnswerData[] {
    for (const submission of submissions) {
      if (submission.section?.toString() === sectionId) {
        const questionair = submission.questionair.find(
          (q: any) => q.question?.toString() === questionId
        )
        if (questionair) {
          return questionair.ans || []
        }
      }
    }
    return []
  }

  // Helper function to find section status
  private findStatus(sectionId: string, submissions: any[], totalQuestions: number): string {
    const submission = submissions.find(
      (sub: any) => sub.section?.toString() === sectionId
    )
    
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

  // Helper function to check all statuses - simplified
  private async checkAllStatuses(userId: string, planId: string): Promise<number> {
    const submissions = await Submission.find({
      user: userId,
      subplan: planId,
      status: SubmissionStatus.COMPLETED
    })
    
    return submissions.length
  }

  // Helper function to check if all sections are completed - simplified
  private async isAllStatusCompleted(userId: string, planId: string): Promise<number> {
    const completedSubmissions = await Submission.countDocuments({
      user: userId,
      subplan: planId,
      status: SubmissionStatus.COMPLETED
    })
    
    return completedSubmissions
  }

  // Helper function to get plan status from user submission array
  private getPlanStatusFromUserSubmission(userSubmissions: any[], planId: string): { status: string, pdfLink: string | null } {
    const userSubmissionForPlan = userSubmissions.find(
      (sub: any) => sub.subplan?.toString() === planId.toString()
    )

    return {
      status: userSubmissionForPlan ? userSubmissionForPlan.status : 'In Progress',
      pdfLink: userSubmissionForPlan ? userSubmissionForPlan.pdfLink : null
    }
  }

  // Helper function to update user submission status
  private async checkSubmissionStatusAndUpdate(userId: string, planId: string, submitted: boolean): Promise<void> {
    const user = await User.findById(userId)
    if (!user || !user.submission) return

    const existingSubmissionIndex = user.submission.findIndex(
      (sub: any) => sub.subplan?.toString() === planId
    )

    if (existingSubmissionIndex > -1) {
      user.submission[existingSubmissionIndex].status = SubmissionStatus.COMPLETED
      user.submission[existingSubmissionIndex].submitted = submitted
      user.submission[existingSubmissionIndex].submissionDate = new Date()
    } else {
      const newSubmission = {
        status: SubmissionStatus.COMPLETED,
        submitted: submitted,
        subplan: planId,
        pdfLink: '',
        submissionDate: new Date()
      }
      user.submission.push(newSubmission as any)
    }

    await user.save()
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
        data: {} as IDashboardPaginatedResponse
      }
    }

    const skip = (page - 1) * limit
    const [plans, total] = await Promise.all([
      SubmissionPlan.find({})
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SubmissionPlan.countDocuments({})
    ])

    // Process each plan using common function
    const processedPlans = plans.map((plan: any) => {
      const { status, pdfLink } = this.getPlanStatusFromUserSubmission(user.submission || [], plan._id)
      
      return {
        ...plan,
        status,
        pdfLink
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

  async takeSurvey(userId: string, planId: string, userRole: string): Promise<IServiceResponse<any>> {
      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User not found',
          data: {}
        }
      }

      // Get plan details to include title
      const planModel = await SubmissionPlan.findById(planId)
      if (!planModel) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'Plan not found',
          data: {}
        }
      }

      const submissions = await Submission.find({
        subplan: planId,
        user: userId
      })
        .populate('questionair.question')
        .lean()

      // Get all sections for the plan and user role
      const allSections = await Section.find({
        subplan: planId,
        role: { $in: [userRole.toLowerCase()] }
      })
        .populate({
          path: 'questions',
          match: { role: { $in: [userRole.toLowerCase()] } },
          options: { sort: { no: 1 } }
        })
        .sort({ no: 1 })
        .lean()

      // Process sections with questions and answers
      const processedSections = allSections.map((section: any) => {
        const questions = section.questions.map((question: any) => {
          const answers = this.findAnswers(section._id.toString(), question._id.toString(), submissions)
          return {
            ...question,
            ans: answers
          }
        })

        // Determine section status
        let sectionStatus = this.findStatus(section._id.toString(), submissions, section.questions.length)

        if (sectionStatus === 'incomplete') {
          sectionStatus = 'In Progress'
        } else if (sectionStatus === SubmissionStatus.IN_PROGRESS) {
          sectionStatus = 'In Progress'
        } else if (sectionStatus === SubmissionStatus.COMPLETED) {
          sectionStatus = 'Completed'
        } else if (sectionStatus === SubmissionStatus.NEEDS_IMPROVEMENT) {
          sectionStatus = 'Correction Required'
        }

        return {
          _id: section._id,
          no: section.no,
          subplan: section.subplan,
          role: section.role,
          createdAt: section.createdAt,
          title: section.title,
          updatedAt: section.updatedAt,
          questions,
          status: sectionStatus
        }
      })

      // Get plan status from user's submission array using common helper function
      const { status: planStatus } = this.getPlanStatusFromUserSubmission(user.submission || [], planId)

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Survey data retrieved successfully',
        data: {
          sections: processedSections,
          plan: planId,
          title: planModel.title,
          status: planStatus,
        }
      }
    
  }



  /**
   * Submit survey responses for a user
   * 
   * @param userId - User ID from authentication token
   * @param userRole - User role from authentication token  
   * @param payload - The survey submission data containing sections, plan ID, and status
   * @returns Promise<IServiceResponse<any>> - Service response with submission results
   * 
   * Status Logic:
   * - Submission Model: Stores actual section completion status (In Progress/Completed/Needs Improvement)
   * - User Model: Stores overall plan status (Draft/In Progress/Submitted/Completed)
   * - Section status is determined by question completion, not the requested status
   * - Plan status in user table uses the requested status (Draft/Submitted) or calculated status
   * 
   * Features:
   * - Comprehensive input validation
   * - Individual section processing with error isolation
   * - Question and answer validation against database
   * - User submission status tracking
   * - Completion statistics calculation
   * - Detailed error reporting for failed sections
   */
  async submitSurvey(userId: string, userRole: string, payload: ISubmitSurveyData): Promise<IServiceResponse<any>> {
    try {
      // Check if payload exists and is an object
      if (!payload || typeof payload !== 'object') {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Request payload is required and must be a valid object',
          data: null
        }
      }

      // Basic validation for required parameters
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          statusCode: statusCode.UNAUTHORIZED,
          message: 'Valid user ID is required',
          data: null
        }
      }

      if (!userRole || typeof userRole !== 'string') {
        return {
          success: false,
          statusCode: statusCode.UNAUTHORIZED,
          message: 'Valid user role is required',
          data: null
        }
      }

      // Safely destructure payload with defaults
      const { 
        sections = [], 
        plan = '', 
        status = '' 
      } = payload || {}

      // Additional validation for destructured values
      if (!plan) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Plan ID is required',
          data: null
        }
      }

      if (!status) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Submission status is required',
          data: null
        }
      }

      if (!Array.isArray(sections) || sections.length === 0) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Sections array is required and cannot be empty',
          data: null
        }
      }

      // Validate payload using helper method
      const validation = this.validateSubmissionPayload(payload)
      if (!validation.isValid) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: validation.message || 'Invalid payload',
          data: null
        }
      }

      // Validate user exists
      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User not found',
          data: null
        }
      }

      // Validate plan exists
      const planModel = await SubmissionPlan.findById(plan)
      if (!planModel) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'Submission plan not found',
          data: null
        }
      }

      // Validate status
      const validStatuses = Object.values(SubmissionStatus)
      if (!validStatuses.includes(status as SubmissionStatus)) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Invalid submission status',
          data: null
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
            role: { $in: [userRole.toLowerCase()] }
          })
          
          if (!sectionModel) {
            failedSections.push({ 
              sectionId, 
              error: 'Section not found, does not belong to this plan, or user does not have access' 
            })
            continue
          }

          // Find existing submission for this user, plan, and section
          let submission = await Submission.findOne({
            user: userId,
            subplan: plan,
            section: sectionId
          })

          if (!submission) {
            // Create new submission with In Progress status initially
            submission = new Submission({
              user: userId,
              subplan: plan,
              section: sectionId,
              questionair: [],
              status: SubmissionStatus.IN_PROGRESS
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
                role: { $in: [userRole.toLowerCase()] }
              })
              
              if (!questionModel) {
                console.warn(`Question ${question._id} not found, does not belong to section ${sectionId}, or user does not have access`)
                continue
              }

              // Process and validate answers
              const validAnswers = this.processQuestionAnswers(question.ans)

              if (validAnswers.length > 0) {
                questionairData.push({
                  question: new mongoose.Types.ObjectId(question._id),
                  ans: validAnswers
                })
              }
            }
          }

          // Update submission
          submission.questionair = questionairData
          
          // Determine section status based on actual completion (not the overall plan status)
          const totalQuestions = await Question.countDocuments({
            section: sectionId,
            role: { $in: [userRole.toLowerCase()] }
          })
          
          const answeredQuestions = questionairData.length

          // Preserve special statuses like NEEDS_IMPROVEMENT if they were set by admin
          const currentStatus = submission.status
          
          if (currentStatus === SubmissionStatus.NEEDS_IMPROVEMENT) {
            // Don't change status if it was marked for improvement
            // Keep the existing status unless all questions are answered
            if (answeredQuestions === totalQuestions) {
              submission.status = SubmissionStatus.COMPLETED
            }
            // Otherwise keep NEEDS_IMPROVEMENT status
          } else {
            // Set section status based on actual completion
            if (answeredQuestions === 0) {
              // No questions answered yet
              submission.status = SubmissionStatus.IN_PROGRESS
            } else if (answeredQuestions === totalQuestions) {
              // All questions answered - mark as completed
              submission.status = SubmissionStatus.COMPLETED
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
            error: (sectionError as Error).message 
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
        role: { $in: [userRole.toLowerCase()] }
      })

      const completedSectionsForPlan = await Submission.countDocuments({
        user: userId,
        subplan: plan,
        status: SubmissionStatus.COMPLETED
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
          overallPlanStatus = SubmissionStatus.COMPLETED
        } else if (completedSectionsForPlan > 0) {
          overallPlanStatus = SubmissionStatus.IN_PROGRESS
        } else {
          overallPlanStatus = status // Use the requested status
        }
      }

      const submissionEntry: any = {
        subplan: plan,
        status: overallPlanStatus,
        submitted: [SubmissionStatus.SUBMITTED, SubmissionStatus.COMPLETED].includes(overallPlanStatus as SubmissionStatus),
        submissionDate: new Date(),
        pdfLink: ""
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
      const responseMessage = failedSections.length > 0 
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
          completionStats
        }
      }

    } catch (error) {
      console.error('[OrgService] submitSurvey error:', error)
      return {
        success: false,
        statusCode: statusCode.SERVER_ERROR,
        message: (error as Error).message,
        data: null
      }
    }
  }

  /**
   * Alternative submitSurvey method that handles payload-only calls (for backward compatibility)
   * This method extracts userId and userRole from the payload if they exist
   */
  async submitSurveyLegacy(payload: any): Promise<IServiceResponse<any>> {
    try {
      if (!payload) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Request payload is required',
          data: null
        }
      }

      const { userId, userRole, ...restPayload } = payload

      if (!userId) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'userId is required in payload',
          data: null
        }
      }

      if (!userRole) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'userRole is required in payload',
          data: null
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
        data: null
      }
    }
  }

  // Helper function to validate submission payload
  private validateSubmissionPayload(payload: ISubmitSurveyData): { isValid: boolean; message?: string } {
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

    // Validate each section structure
    for (const section of sections) {
      if (!section._id || typeof section._id !== 'string') {
        return { isValid: false, message: 'Section missing valid _id' }
      }

      if (!section.questions || !Array.isArray(section.questions)) {
        return { isValid: false, message: `Section ${section._id} missing valid questions array` }
      }

      // Validate questions structure
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

  // Helper function to process question answers
  private processQuestionAnswers(answers: IAnswerData[]): IAnswerData[] {
    if (!Array.isArray(answers)) return []

    return answers.filter((answer: IAnswerData) => {
      return answer && 
             typeof answer.type === 'number' && 
             typeof answer.value === 'string' && 
             answer.value.trim().length > 0
    }).map((answer: IAnswerData) => ({
      ...answer,
      value: answer.value.trim() // Clean up whitespace
    }))
  }

  // Helper function to calculate survey completion stats
  private async calculateCompletionStats(userId: string, plan: string): Promise<{
    totalSections: number
    completedSections: number
    completionPercentage: number
  }> {
    const totalSections = await Section.countDocuments({ subplan: plan })
    const completedSections = await Submission.countDocuments({
      user: userId,
      subplan: plan,
      status: SubmissionStatus.COMPLETED
    })

    const completionPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

    return {
      totalSections,
      completedSections,
      completionPercentage
    }
  }

}

const organizationService = new OrganizationService()
export default organizationService