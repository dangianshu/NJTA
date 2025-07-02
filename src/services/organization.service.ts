import User from '../models/User.models'
import SubmissionPlan from '../models/SubmissionPlan.models'
import Section from '../models/Section.models'
import Question from '../models/Question.models'
import Submission from '../models/Submission.models'
import { statusCode } from '../utils/statusCode'
import { SubmissionStatus } from '../utils/constante'
import { IServiceResponse } from '../types/auth.interface'
import { IDashboardData, ISurveyData, ISubmissionViewData, ISubmitQuestionData, IAnswerData } from '../types/question.interface'

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
    
    if (submission.status === SubmissionStatus.NEED_IMPROVEMENT) {
      return SubmissionStatus.NEED_IMPROVEMENT
    }
    
    if (answeredQuestions === totalQuestions) {
      return SubmissionStatus.COMPLETED
    } else if (answeredQuestions > 0) {
      return SubmissionStatus.INPROGRESS
    }
    
    return 'incomplete'
  }

  // Helper function to check all statuses
  private async checkAllStatuses(userId: string, planId: string): Promise<number> {
    const submissions = await Submission.find({
      user: userId,
      subplan: planId,
      status: SubmissionStatus.COMPLETED
    })
    
    return submissions.length
  }

  // Helper function to check if all sections are completed
  private async isAllStatusCompleted(userId: string, planId: string, totalSections: number): Promise<number> {
    const completedSubmissions = await Submission.countDocuments({
      user: userId,
      subplan: planId,
      status: SubmissionStatus.COMPLETED
    })
    
    return completedSubmissions
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

  // Helper function to find section index
  private findIndex(sections: any[], categoryId: string): { index: number; nextIndex: number; prevIndex: number } {
    const index = sections.findIndex((section: any) => section._id.toString() === categoryId)
    
    return {
      index: index >= 0 ? index : 0,
      nextIndex: index >= 0 && index < sections.length - 1 ? index + 1 : -1,
      prevIndex: index > 0 ? index - 1 : -1
    }
  }

  async getDashboard(userId: string): Promise<IServiceResponse<IDashboardData>> {
      // Find user
      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User not found',
          data: {} as IDashboardData
        }
      }

      // Fetch all submission plans with sections
      let plans = await SubmissionPlan.find({})
        .populate('sections')
        .lean()

      // Sort plans by year from title
      plans.sort((a, b) => {
        try {
          const yearA = parseInt(a.title.match(/\d{4}/)?.[0] || '0', 10)
          const yearB = parseInt(b.title.match(/\d{4}/)?.[0] || '0', 10)
          return yearA - yearB
        } catch (err) {
          console.error('Error parsing plan title for sorting:', err)
          return 0
        }
      })

      // Process each plan and determine submission status
      const processedPlans = await Promise.all(
        plans.map(async (plan: any) => {
          // Count completed submissions
          const completedCount = await Submission.countDocuments({
            subplan: plan._id,
            status: SubmissionStatus.COMPLETED,
            user: userId
          })

          // Filter user submissions for this plan
          const userSubmissions = (user.submission || []).filter(
            (sub: any) => sub.subplan?.toString() === plan._id.toString()
          )

          // Determine plan status
          let planStatus = 'incomplete'
          let pdfLink = null

          if (userSubmissions.length > 0) {
            planStatus = userSubmissions[0].status
            pdfLink = userSubmissions[0].pdfLink
          } else if (completedCount > 0) {
            const sections = await Section.find({ subplan: plan._id })
            planStatus = completedCount === sections.length ? SubmissionStatus.COMPLETED : SubmissionStatus.INPROGRESS
          }

          return {
            ...plan,
            status: planStatus,
            pdfLink
          }
        })
      )

      // Prepare submission data
      const submissions = !user.submission || user.submission.length === 0 
        ? [{ submitted: false }] 
        : user.submission

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Dashboard data retrieved successfully',
        data: {
          plans: processedPlans,
          user: {
            name: user.name || '',
            email: user.email || '',
            code: user.code || '',
            role: user.role || '',
            id: user._id.toString()
          },
          submissions: submissions || []
        }
      }
  }

  async takeSurvey(userId: string, planId: string, userRole: string, categoryId?: string): Promise<IServiceResponse<ISurveyData>> {
    try {
      // Find user
      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User not found',
          data: {} as ISurveyData
        }
      }

      const submissions = await Submission.find({
        subplan: planId,
        user: userId
      })
        .populate('questionair.question')
        .lean()

      // Check if all sections are completed
      const statusCompleted = await this.checkAllStatuses(userId, planId) === 13 // Assuming 13 is total sections

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

        return {
          ...section,
          questions,
          status: this.findStatus(section._id.toString(), submissions, section.questions.length)
        }
      })

      // Find current section index
      const sectionIndex = categoryId ? this.findIndex(processedSections, categoryId) : { index: 0, nextIndex: 1, prevIndex: -1 }

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Survey data retrieved successfully',
        data: {
          sections: processedSections,
          selectedSection: processedSections[sectionIndex.index],
          nextSection: sectionIndex.nextIndex >= 0 ? processedSections[sectionIndex.nextIndex] : null,
          plan: processedSections[0]?.subplan || planId,
          role: userRole,
          prevSectionLink: sectionIndex.prevIndex >= 0 ? processedSections[sectionIndex.prevIndex] : null,
          statusCompleted,
          user: {
            name: user.name || ''
          }
        }
      }
    } catch (error) {
      console.error('[OrgService] takeSurvey error:', error)
      return {
        success: false,
        statusCode: statusCode.SERVER_ERROR,
        message: (error as Error).message,
        data: {} as ISurveyData
      }
    }
  }

  async viewSubmissions(userId: string, planId: string, userRole: string, showSubmit: boolean): Promise<IServiceResponse<ISubmissionViewData>> {
    try {
      // Find user
      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User not found',
          data: {} as ISubmissionViewData
        }
      }

      // Get submissions
      const submissions = await Submission.find({
        user: userId,
        subplan: planId
      })
        .populate('questionair.question')
        .lean()
        .sort({ 'questionair.ans.type': 1 })

      // Get plan details
      const planModel = await SubmissionPlan.findById(planId)
      if (!planModel) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'Plan not found',
          data: {} as ISubmissionViewData
        }
      }

      // Get sections
      let sections = await Section.find({
        subplan: planId,
        role: { $in: [userRole.toLowerCase()] }
      })
        .sort({ no: 1 })
        .populate({
          path: 'questions',
          options: { sort: { no: 1 } }
        })
        .lean()

      // Get all questions
      let allQuestions = await Question.find({
        section: { $in: sections.map((sec: any) => sec._id) },
        role: { $in: [userRole.toLowerCase()] }
      })
        .sort({ no: 1 })
        .lean()

      // Process sections with status
      sections = sections.map((section: any) => ({
        ...section,
        status: this.findStatus(section._id.toString(), submissions, section.questions.length)
      }))

      // Process questions with answers
      allQuestions = allQuestions.map((question: any) => {
        const answers = this.findAnswers(question.section.toString(), question._id.toString(), submissions)
        return {
          ...question,
          ans: answers
        }
      })

      // Check completion status
      const statusCompleted = await this.checkAllStatuses(userId, planId) === 13

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Submissions retrieved successfully',
        data: {
          sections,
          allQuestions,
          previews: allQuestions, // Simplified - you might want to implement proper reorder function
          plan: planId,
          planTitle: planModel.title,
          statusCompleted,
          showSubmit,
          user: {
            name: user.name || '',
            code: user.code || '',
            id: user._id.toString()
          }
        }
      }
    } catch (error) {
      console.error('[OrgService] viewSubmissions error:', error)
      return {
        success: false,
        statusCode: statusCode.SERVER_ERROR,
        message: (error as Error).message,
        data: {} as ISubmissionViewData
      }
    }
  }

  async submitQuestionDraft(data: ISubmitQuestionData): Promise<IServiceResponse<any>> {
    try {
      const { userId, section, plan, question, ans, role } = data

      console.log('Received answers:', ans)

      // Validate answers
      const emptyAnswers = ans.filter((answer: IAnswerData) => !answer.value || answer.value.length === 0)
      const emptyAnsLength = emptyAnswers.length
      const ansLength = ans.length

      // Get total sections count
      const allSectionsLength = await Section.countDocuments({
        subplan: plan,
        role: role.toLowerCase()
      })

      // Get section with questions
      const sectionWithQuestions = await Section.findById(section).populate('questions')
      if (!sectionWithQuestions) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'Section not found',
          data: null
        }
      }

      // Update user submission status
      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User not found',
          data: null
        }
      }

      // Update user's submission array
      if (!user.submission) {
        user.submission = []
      }
      
      const existingSubmissionIndex = user.submission.findIndex(
        (sub: any) => sub.subplan?.toString() === plan
      )

      if (existingSubmissionIndex > -1) {
        user.submission[existingSubmissionIndex].status = SubmissionStatus.INPROGRESS
        user.submission[existingSubmissionIndex].submitted = false
        user.submission[existingSubmissionIndex].submissionDate = new Date()
      } else {
        const newSubmission = {
          status: SubmissionStatus.INPROGRESS,
          submitted: false,
          subplan: plan,
          pdfLink: '',
          submissionDate: new Date()
        }
        user.submission.push(newSubmission as any)
      }

      await user.save()

      // Find existing submission
      let submission = await Submission.findOne({
        subplan: plan,
        section: section,
        user: userId
      })

      if (!submission) {
        // Create new submission
        submission = await Submission.create({
          user: userId,
          section,
          subplan: plan,
          status: SubmissionStatus.INPROGRESS,
          questionair: [{ question, ans }]
        })

        return {
          success: true,
          statusCode: statusCode.CREATED,
          message: 'Draft saved successfully',
          data: submission
        }
      }

      // Update existing submission
      const existingQuestionIndex = submission.questionair.findIndex(
        (q: any) => q.question?.toString() === question
      )

      if (existingQuestionIndex > -1) {
        if (emptyAnsLength > 0 && emptyAnsLength === ansLength) {
          // Remove question if all answers are empty
          submission.questionair.splice(existingQuestionIndex, 1)
        } else {
          // Update existing question
          submission.questionair[existingQuestionIndex].ans = ans.filter(
            (answer: IAnswerData) => answer.value && answer.value.length > 0
          )
        }
      } else {
        // Add new question if not all answers are empty
        if (emptyAnsLength === 0 || emptyAnsLength < ansLength) {
          submission.questionair.push({ 
            question: question as any, 
            ans 
          })
        }
      }

      // Determine submission status based on completion
      const totalQuestions = (sectionWithQuestions as any).questions?.length || 0
      const answeredQuestions = submission.questionair.length

      // Preserve needImprovement status
      if (submission.status !== SubmissionStatus.NEED_IMPROVEMENT) {
        if (answeredQuestions === totalQuestions) {
          submission.status = SubmissionStatus.COMPLETED
        } else {
          submission.status = SubmissionStatus.INPROGRESS
        }
      }

      const savedSubmission = await submission.save()

      const completedSections = await this.isAllStatusCompleted(userId, plan, allSectionsLength)
      
      if (completedSections === allSectionsLength) {
        await this.checkSubmissionStatusAndUpdate(userId, plan, false)
      }

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Draft saved successfully',
        data: savedSubmission
      }
    } catch (error) {
      console.error('[OrgService] submitQuestionDraft error:', error)
      return {
        success: false,
        statusCode: statusCode.SERVER_ERROR,
        message: (error as Error).message,
        data: null
      }
    }
  }
}

const organizationService = new OrganizationService()
export default organizationService