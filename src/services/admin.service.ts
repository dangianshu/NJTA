import User from '../models/User.models'
import { encrypt } from '../helper/encrypt'
import { statusCode } from '../utils/statusCode'
import {
  IAuthResponse,
  IinvaiteRequest,
  IServiceResponse,
  IUserPaginatedResponse,
} from '../types/auth.interface'
import { getRoleByCode, generateCustomPassword, getTypeByCode } from '../helper/common'
import mailTemplateService from './email.template.service'
import { IUser } from '../types/user.interface'
import { IPagination } from '../types/common.interface'
import SubmissionPlan from '../models/SubmissionPlan.models'


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
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
  
    // 1. Get all submission plans (no sorting)
    const plans = await SubmissionPlan.find({});
  
    // 2. Build query
    const query: any = {};
  
    if (fy) {
      const fyPlan = await SubmissionPlan.findOne({ title: fy });
      if (fyPlan) {
        query['submission.subplan'] = fyPlan._id;
      }
    }
  
    if (role && role !== 'null') {
      query.code = {
        ...(role === 'evaluator' && { $regex: 'EVAL' }),
        ...(role !== 'evaluator' && { $not: /EVAL/i }),
      };
    }
  
      if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
      ];
    }
  
    const users = await User.find(query)
    .populate({
      path: 'submission.subplan',
      model: 'SubmissionPlan',
    })
     .select('-password -resetPasswordToken -resetPasswordExpires -hashString')
        .skip(skip)
        .limit(limit)
  
    const filteredUsers = users.filter(user => Array.isArray(user.submission) && user.submission.length > 0);
  
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
    };
  }


  // async getPreviewSubmissions(planId: string, userId: string) {
  //     const submissions = await Submission.find({
  //       user: userId,
  //       subplan: planId,
  //     })
  //       .populate({ path: 'questionair.question' })
  //       .lean()

  //     // 2. Get user and plan
  //     const userModel = await User.findById(userId)
  //     const planModel = await SubmissionPlan.findById(planId)
  //     if (!userModel || !planModel) {
  //       return {
  //         success: false,
  //         statusCode: 404,
  //         message: 'User or Plan not found',
  //       }
  //     }
  //     // 3. Get sections for plan and user role
  //     let sections = await Section.find({
  //       subplan: planId,
  //       role: { $in: [userModel.role?.toLowerCase()] },
  //     })
  //       .sort({ no: 1 })
  //       .populate([
  //         {
  //           path: 'questions',
  //           match: { role: { $in: [userModel.role?.toLowerCase()] } },
  //           options: { sort: { no: 1 } },
  //         },
  //       ])
  //       .lean()
  //     // 4. Get all questions for these sections and user role
  //     let allQuestions = await Question.find({
  //       section: { $in: sections.map((sec: any) => sec._id) },
  //       role: { $in: [userModel.role?.toLowerCase()] },
  //     })
  //       .sort({ no: 1 })
  //       .lean()
  //     // 5. Calculate status for each section
  //     sections = sections.map((section: any) => {
  //       let sectionQuestions = allQuestions.filter(
  //         (q: any) => q.section.toString() === section._id.toString()
  //       )
  //       return {
  //         ...section,
  //         status: findStatus(
  //           section._id,
  //           submissions,
  //           sectionQuestions.length,
  //           SubmissionStatus
  //         ),
  //       }
  //     })
  //     // 6. Attach answers to each question
  //     allQuestions = allQuestions.map((question: any) => {
  //       let ans = []
  //       for (const submission of submissions) {
  //         if (submission.section?.toString() === question.section.toString()) {
  //           const qair = submission.questionair.find(
  //             (q: any) => q.question.toString() === question._id.toString()
  //           )
  //           if (qair) {
  //             ans = qair.ans || []
  //             break
  //           }
  //         }
  //       }
  //       return {
  //         ...question,
  //         ans,
  //       }
  //     })
  //     return {
  //       success: true,
  //       statusCode: 200,
  //       message: 'Preview data fetched successfully',
  //       data: {
  //         sections,
  //         allQuestions,
  //         // previews, // Uncomment if you implement reorder
  //         user: userId,
  //         plan: planId,
  //         planTitle: planModel.title,
  //       },
  //     }
  // }
}

const adminService = new AdminService()
export default adminService
