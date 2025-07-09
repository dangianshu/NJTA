import User from '../models/User.models'
import { encrypt } from '../helper/encrypt'
import { statusCode } from '../utils/statusCode'
import {
  IAuthResponse,
  IinvaiteRequest,
  IServiceResponse,
  IUserPaginatedResponse,
} from '../types/auth.interface'
import {
  getRoleByCode,
  generateCustomPassword,
  getTypeByCode,
  findStatus,
  getUserRoleById,
} from '../helper/common'
import mailTemplateService from './email.template.service'
import { IUser } from '../types/user.interface'
import { IPagination } from '../types/common.interface'
import SubmissionPlan from '../models/SubmissionPlan.models'
import Submission from '../models/Submission.models'
import Section from '../models/Section.models'
import Question from '../models/Question.models'
import { SubmissionStatus } from '../utils/constant'

class AdminService {
  async createInvitation(userData: IinvaiteRequest): Promise<IAuthResponse> {
    const { name, email, contact, code, redirectUrl } = userData
    const existingUser = await User.findOne({ code })

    if (!existingUser) {
      return {
        success: false,
        statusCode: statusCode.BAD_REQUEST,
        message: 'Provided Organization/Evaluator ID Is Invalid',
      }
    }

    if (existingUser.password) {
      return {
        success: false,
        statusCode: statusCode.CONFLICT,
        message: 'Organization/Evaluator ID Has Already Been Registered',
      }
    }
    // Check if email already exists
    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return {
        success: false,
        statusCode: statusCode.CONFLICT,
        message: 'Email is already registered',
      }
    }
    // Generate random password
    const randomPassword = generateCustomPassword()
    const hashedPassword = await encrypt(randomPassword)
    const hashString = await encrypt(email)

    existingUser.name = name
    existingUser.email = email
    existingUser.contact = contact
    existingUser.password = hashedPassword
    existingUser.role = getRoleByCode(code)
    existingUser.hashString = hashString
    existingUser.isVerified = true

    await existingUser.save()
    const emailRole = getTypeByCode(code)

    // Send invitation email
    await mailTemplateService.sendInvitationMail({
      email: existingUser.email || '',
      name: existingUser.contact || '',
      code: existingUser.code || '',
      password: randomPassword,
      redirectUrl: redirectUrl || '',
      role: emailRole,
    })

    const userObj = existingUser.toObject()
    delete userObj.password
    delete userObj.resetPasswordToken
    delete userObj.resetPasswordExpires
    delete userObj.hashString

    return {
      success: true,
      statusCode: statusCode.CREATED,
      message: 'invitation send successfully',
      data: {
        user: userObj,
      },
    }
  }

  async updateUser(id: string, payload: Partial<IUser>): Promise<IAuthResponse> {
    const { name, contact } = payload

    const user = await User.findById(id)
    if (!user) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'User not found',
      }
    }

    if (name) user.name = name
    if (typeof contact !== 'undefined') user.contact = contact

    await user.save()

    const userObj = user.toObject()
    delete userObj.password
    delete userObj.resetPasswordToken
    delete userObj.resetPasswordExpires
    delete userObj.hashString

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'User updated successfully',
      data: {
        user: userObj,
      },
    }
  }

  async findAll(
    search: string = '',
    pagination: IPagination,
    type: string
  ): Promise<IServiceResponse<IUserPaginatedResponse>> {
    const { page = 1, limit = 10 } = pagination
    const query: any = { email: { $ne: null } }

    if (type) {
      query.role = type
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      User.find(query)
        .skip(skip)
        .limit(limit)
        .select('-password -resetPasswordToken -resetPasswordExpires -hashString'),
      User.countDocuments(query),
    ])

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Users fetched successfully',
      data: {
        users,
        pagination: {
          limit,
          page,
          total,
        },
      },
    }
  }

  async getAllSubmission(
    role: string = '',
    pagination: IPagination,
    fy: string = '',
    search: string = ''
  ): Promise<IServiceResponse<IUserPaginatedResponse>> {
    const { page = 1, limit = 10 } = pagination
    const skip = (page - 1) * limit

    // 1. Get all submission plans (no sorting)
    const plans = await SubmissionPlan.find({})

    // 2. Build query
    const query: any = {}

    // if (fy) {
    //   const fyPlan = await SubmissionPlan.findOne({ title: fy })
    //   console.log("🚀 ~ AdminService ~ fyPlan:", fyPlan?._id)
    //   if (fyPlan) {
    //     query['submission.subplan'] = fyPlan._id
    //   }
    // }

    if (fy) {
      const fyPlan = await SubmissionPlan.findOne({ title: fy })
      if (fyPlan) {
        query.submission = {
          $elemMatch: {
            subplan: fyPlan._id,
            status: { $ne: SubmissionStatus.DRAFT },
          },
        }
      }
    }

    if (role && role !== 'null') {
      query.code = {
        ...(role === 'evaluator' && { $regex: 'EVAL' }),
        ...(role !== 'evaluator' && { $not: /EVAL/i }),
      }
    }

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [{ name: { $regex: searchRegex } }]
    }

    const users = await User.find(query)
      .populate({
        path: 'submission.subplan',
        model: 'SubmissionPlan',
      })
      .select('-password -resetPasswordToken -resetPasswordExpires -hashString')
      .skip(skip)
      .limit(limit)

    // Remove draft submissions from each user
    const filteredUsers = users
      .map((user) => {
        if (!Array.isArray(user.submission)) return user
        user.submission = user.submission.filter(
          (sub) => sub.status !== SubmissionStatus.DRAFT && sub.status !== 'draft'
        )
        return user
      })
      // Only include users with at least one non-draft submission
      .filter((user) => Array.isArray(user.submission) && user.submission.length > 0)

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Submissions fetched successfully',
      data: {
        users: filteredUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
        },
      },
    }
  }

  async getPreviewSubmissions(planId: string, userId: string) {
    try {
      // 1. Fetch user and plan
      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          statusCode: 404,
          message: 'User not found',
          data: null,
        }
      }
      const planModel = await SubmissionPlan.findById(planId)
      if (!planModel) {
        return {
          success: false,
          statusCode: 404,
          message: 'Plan not found',
          data: null,
        }
      }

      // 2. Fetch all submissions for this user and plan
      const submissions = await Submission.find({
        subplan: planId,
        user: userId,
      }).lean()

      // 3. Build a map: { [sectionId]: { [questionId]: ans[] } }
      const submissionMap: Record<string, Record<string, any[]>> = {}
      for (const sub of submissions) {
        const sectionId = sub.section?.toString()
        if (!sectionId) continue
        if (!submissionMap[sectionId]) submissionMap[sectionId] = {}
        for (const q of sub.questionair || []) {
          submissionMap[sectionId][q.question.toString()] = q.ans || []
        }
      }

      // 4. Fetch all sections for the plan and user role (from user.role)
      const userRole = user.role
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

      // 5. Build response sections (same as takeSurvey)
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
              }
            })
          }

          return {
            ...question,
            ans: finalAns,
            subQuestions,
          }
        })

        // Section status logic
        let sectionStatus = findStatus(
          section._id.toString(),
          submissions,
          section.questions.length,
          SubmissionStatus
        )
        if (sectionStatus === 'incomplete' || sectionStatus === SubmissionStatus.IN_PROGRESS) {
          sectionStatus = 'in-progress'
        } else if (sectionStatus === SubmissionStatus.COMPLETE) {
          sectionStatus = 'complete'
        } else if (sectionStatus === SubmissionStatus.NEEDS_IMPROVEMENT) {
          sectionStatus = 'correction-required'
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
          status: sectionStatus,
        }
      })

      // Get plan status from user's submission array
      const userSubmissionForPlan = user.submission?.find(
        (sub: any) => sub.subplan?.toString() === planId.toString()
      )
      const planStatus = userSubmissionForPlan ? userSubmissionForPlan.status : 'in-progress'

      return {
        success: true,
        statusCode: 200,
        message: 'Preview data retrieved successfully',
        data: {
          sections: processedSections,
          plan: planId,
          title: planModel.title,
          status: planStatus,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        statusCode: 500,
        message: error.message || 'Server error',
        data: null,
      }
    }
  }

  async updateSubmissionStatus(userId: string, subID: string, status: string) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: userId, 'submission._id': subID },
        { $set: { 'submission.$.status': status } },
        { new: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires -hashString')
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.NOTFOUND,
          message: 'User or submission not found',
          data: null,
        }
      }
      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Submission status updated successfully',
        data: user,
      }
    } catch (error: any) {
      return {
        success: false,
        statusCode: statusCode.SERVER_ERROR,
        message: error.message || 'Server error',
        data: null,
      }
    }
  }
}

const adminService = new AdminService()
export default adminService
