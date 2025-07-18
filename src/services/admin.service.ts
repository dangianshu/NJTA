import path from 'path'
import fs from 'fs'
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
  getSubmissionStatus,
} from '../helper/common'
import mailTemplateService from './email.template.service'
import { IUser } from '../types/user.interface'
import { IPagination } from '../types/common.interface'
import SubmissionPlan from '../models/SubmissionPlan.models'
import Submission from '../models/Submission.models'
import Section from '../models/Section.models'
import { SubmissionStatus } from '../utils/constant'
import {
  generateHtmlTemplate,
  generatePdfFromHtml,
  generateDocxFromSections,
} from '../utils/pdf.generator'
import { ISubmissionPlan } from '../types/submissionPlan.interface'

class AdminService {
  private findStatus(sectionId: string, submissions: any[]): string {
    const submission = submissions.find((sub: any) => sub.section?.toString() === sectionId)

    if (!submission) return SubmissionStatus.IN_PROGRESS

    return submission.status || SubmissionStatus.IN_PROGRESS
  }

  private getSubmissionStatus(
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
    const reSubmitDate = plan.reSubmissionDate ? new Date(plan.reSubmissionDate) : null

    if (!regularStart || currentDate < regularStart) {
      return {
        status: 'not-started',
        pdfLink: null,
      }
    }

    // ✅ 2. Check if regular submission has ended
    const hasRegularEnded = regularEnd && currentDate > regularEnd
    if (hasRegularEnded) {
      const isInReSubmissionWindow = reSubmitDate && currentDate <= reSubmitDate

      if (!isInReSubmissionWindow) {
        return {
          status: 'submission-closed',
          pdfLink: null,
        }
      }
    }

    const userSubmissionForPlan = userSubmissions.find(
      (sub: any) => sub.subplan?.toString() === planId
    )

    return {
      status: userSubmissionForPlan ? userSubmissionForPlan.status : 'in-progress',
      pdfLink: userSubmissionForPlan?.pdfLink || null,
    }
  }

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

  // async getAllSubmission(
  //   role: string = '',
  //   pagination: IPagination,
  //   fy: string = '',
  //   search: string = ''
  // ): Promise<IServiceResponse<IUserPaginatedResponse>> {
  //   const { page = 1, limit = 10 } = pagination
  //   const skip = (page - 1) * limit

  //   // 1. Get all submission plans (no sorting)
  //   const plans = await SubmissionPlan.find({})

  //   const query: any = {}

  //   // 2. Filter by financial year plan (FY)
  //   if (fy) {
  //     const fyPlan = await SubmissionPlan.findOne({ title: fy })
  //     if (fyPlan) {
  //       query.submission = {
  //         $elemMatch: {
  //           subplan: fyPlan._id,
  //           status: { $ne: SubmissionStatus.DRAFT },
  //         },
  //       }
  //     }
  //   } else {
  //     query.submission = {
  //       $elemMatch: {
  //         status: { $ne: SubmissionStatus.DRAFT },
  //       },
  //     }
  //   }

  //   // 3. Filter by role
  //   if (role && role !== 'null') {
  //     query.code = {
  //       ...(role === 'evaluator' && { $regex: 'EVAL' }),
  //       ...(role !== 'evaluator' && { $not: /EVAL/i }),
  //     }
  //   }

  //   // 4. Filter by search keyword
  //   if (search?.trim()) {
  //     const searchRegex = new RegExp(search.trim(), 'i')
  //     query.$or = [{ name: { $regex: searchRegex } }]
  //   }

  //   // 5. Fetch users with submissions
  //   const users = await User.find(query)
  //     .populate({
  //       path: 'submission.subplan',
  //       model: 'SubmissionPlan',
  //     })
  //     .select('-password -resetPasswordToken -resetPasswordExpires -hashString')
  //     .skip(skip)
  //     .limit(limit)

  //   // 6. Remove draft submissions from each user
  //   const filteredUsers = users
  //     .map((user) => {
  //       if (!Array.isArray(user.submission)) return user
  //       user.submission = user.submission.filter(
  //         (sub) => sub.status !== SubmissionStatus.DRAFT && sub.status !== 'draft'
  //       )
  //       return user
  //     })
  //     .filter((user) => Array.isArray(user.submission) && user.submission.length > 0)

  //   // 7. Prepare response
  //   return {
  //     success: true,
  //     statusCode: statusCode.SUCCESS,
  //     message: 'Submissions fetched successfully',
  //     data: {
  //       users: filteredUsers,
  //       pagination: {
  //         page,
  //         limit,
  //         total: filteredUsers.length,
  //       },
  //     },
  //   }
  // }

  // async getPreviewSubmissions(planId: string, userId: string) {
  //   try {
  //     // 1. Fetch user and plan
  //     const user = await User.findById(userId)
  //     if (!user) {
  //       return {
  //         success: false,
  //         statusCode: 404,
  //         message: 'User not found',
  //         data: null,
  //       }
  //     }
  //     const planModel = await SubmissionPlan.findById(planId)
  //     if (!planModel) {
  //       return {
  //         success: false,
  //         statusCode: 404,
  //         message: 'Plan not found',
  //         data: null,
  //       }
  //     }

  //     // 2. Fetch all submissions for this user and plan
  //     const submissions = await Submission.find({
  //       subplan: planId,
  //       user: userId,
  //     }).lean()

  //     // 3. Build a map: { [sectionId]: { [questionId]: ans[] } }
  //     const submissionMap: Record<string, Record<string, any[]>> = {}
  //     for (const sub of submissions) {
  //       const sectionId = sub.section?.toString()
  //       if (!sectionId) continue
  //       if (!submissionMap[sectionId]) submissionMap[sectionId] = {}
  //       for (const q of sub.questionair || []) {
  //         submissionMap[sectionId][q.question.toString()] = q.ans || []
  //       }
  //     }

  //     // 4. Fetch all sections for the plan and user role (from user.role)
  //     const userRole = user.role
  //     const allSections = await Section.find({
  //       subplan: planId,
  //       role: { $in: [userRole.toLowerCase()] },
  //     })
  //       .populate({
  //         path: 'questions',
  //         match: { role: { $in: [userRole.toLowerCase()] } },
  //         options: { sort: { no: 1 } },
  //       })
  //       .sort({ no: 1 })
  //       .lean()

  //     // 5. Build response sections (same as takeSurvey)
  //     const processedSections = allSections.map((section: any) => {
  //       const sectionSubmission = submissions.find(
  //         (sub: any) => sub.section?.toString() === section._id.toString()
  //       )

  //       const questions = (section.questions || []).map((question: any) => {
  //         const ans =
  //           (submissionMap[section._id.toString()] &&
  //             submissionMap[section._id.toString()][question._id.toString()]) ||
  //           []

  //         // Find the submission for this section
  //         const sectionSubmission = submissions.find(
  //           (sub: any) => sub.section?.toString() === section._id.toString()
  //         )

  //         // Find the questionair entry for this question
  //         const questionairEntry = sectionSubmission?.questionair?.find(
  //           (q: any) => q.question.toString() === question._id.toString()
  //         )

  //         // For file-type questions, if ans is empty, try to get from questionairEntry.ans
  //         let finalAns = ans
  //         if (
  //           question.qtype === 'file' &&
  //           (!ans || ans.length === 0) &&
  //           questionairEntry &&
  //           Array.isArray(questionairEntry.ans) &&
  //           questionairEntry.ans.length > 0
  //         ) {
  //           finalAns = questionairEntry.ans
  //         }

  //         // Map subQuestions with their answers from the nested structure
  //         let subQuestions = []
  //         if (Array.isArray(question.subQuestions) && question.subQuestions.length > 0) {
  //           subQuestions = question.subQuestions.map((subQ: any) => {
  //             // Find the sub-question answer in the nested subQuestions array
  //             const subQEntry = Array.isArray(questionairEntry?.subQuestions)
  //               ? questionairEntry.subQuestions.find(
  //                   (sq: any) => sq.question.toString() === subQ._id.toString()
  //                 )
  //               : undefined
  //             return {
  //               ...subQ,
  //               ans: subQEntry?.ans || [],
  //               comment: subQEntry?.comment || '',
  //               needImprovement: subQEntry?.needImprovement || false,
  //             }
  //           })
  //         }

  //         return {
  //           ...question,
  //           ans: finalAns,
  //           comment: questionairEntry?.comment || '',
  //           needImprovement: questionairEntry?.needImprovement || false,
  //           subQuestions,
  //         }
  //       })

  //       // Section status logic
  //       let sectionStatus = this.findStatus(section._id.toString(), submissions)

  //       return {
  //         _id: section._id,
  //         no: section.no,
  //         subplan: section.subplan,
  //         role: section.role,
  //         createdAt: section.createdAt,
  //         title: section.title,
  //         updatedAt: section.updatedAt,
  //         questions,
  //         status: sectionStatus,
  //         submissionId: sectionSubmission?._id || null,
  //       }
  //     })

  //     // Get plan status from user's submission array
  //     const userSubmissionForPlan = user.submission?.find(
  //       (sub: any) => sub.subplan?.toString() === planId.toString()
  //     )
  //     const planStatus = userSubmissionForPlan ? userSubmissionForPlan.status : 'in-progress'

  //     return {
  //       success: true,
  //       statusCode: 200,
  //       message: 'Preview data retrieved successfully',
  //       data: {
  //         sections: processedSections,
  //         plan: planId,
  //         title: planModel.title,
  //         status: planStatus,
  //       },
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       statusCode: 500,
  //       message: error.message || 'Server error',
  //       data: null,
  //     }
  //   }
  // }

  async getAllSubmission(
    role: string = '',
    pagination: IPagination,
    fy: string = '',
    search: string = ''
  ): Promise<IServiceResponse<IUserPaginatedResponse>> {
    const { page = 1, limit = 10 } = pagination
    const skip = (page - 1) * limit

    const query: any = {}

    // 1. Filter by role
    if (role && role !== 'null') {
      query.code = {
        ...(role === 'evaluator' && { $regex: 'EVAL' }),
        ...(role !== 'evaluator' && { $not: /EVAL/i }),
      }
    }

    // 2. Filter by search
    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [{ name: { $regex: searchRegex } }]
    }

    // 3. Fetch users and total count
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -resetPasswordToken -resetPasswordExpires -hashString')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ])

    // 4. Get all plans (filtered by FY)
    const planQuery: any = fy ? { title: fy } : {}
    const plans = await SubmissionPlan.find(planQuery).lean()

    // 5. Map user submissions with full plan details
    const usersWithDetailedSubmissions = users
      .filter((user) => user.role !== 'evaluator') // Exclude evaluators
      .map((user) => {
        const userSubmissions = plans.map((plan) => {
          const userSubmissionForPlan = (user.submission || []).find(
            (s: any) => String(s?.subplan?._id || s?.subplan) === String(plan._id)
          )

          const { status, pdfLink } = this.getSubmissionStatus(user.submission || [], plan)

          return {
            _id: userSubmissionForPlan?._id || undefined,
            status,
            submitted: userSubmissionForPlan?.submitted || false,
            subplan: plan,
            pdfLink,
          }
        })

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          code: user.code,
          role: user.role,
          submissions: userSubmissions,
        }
      })

    // 6. Final Response
    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'All user submissions grouped by plan fetched successfully',
      data: {
        users: usersWithDetailedSubmissions,
        pagination: {
          page,
          limit,
          total,
        },
      },
    }
  }

  // async getAllSubmission(
  //   role: string = '',
  //   pagination: IPagination,
  //   fy: string = '',
  //   search: string = ''
  // ): Promise<IServiceResponse<IUserPaginatedResponse>> {
  //   const { page = 1, limit = 10 } = pagination
  //   const skip = (page - 1) * limit

  //   // 1. Get all submission plans (no sorting)
  //   const plans = await SubmissionPlan.find({})

  //   const query: any = {}

  //   // 2. Filter by financial year plan (FY)
  //   if (fy) {
  //     const fyPlan = await SubmissionPlan.findOne({ title: fy })
  //     if (fyPlan) {
  //       query.submission = {
  //         $elemMatch: {
  //           subplan: fyPlan._id,
  //           status: { $ne: SubmissionStatus.DRAFT },
  //         },
  //       }
  //     }
  //   } else {
  //     query.submission = {
  //       $elemMatch: {
  //         status: { $ne: SubmissionStatus.DRAFT },
  //       },
  //     }
  //   }

  //   // 3. Filter by role
  //   if (role && role !== 'null') {
  //     query.code = {
  //       ...(role === 'evaluator' && { $regex: 'EVAL' }),
  //       ...(role !== 'evaluator' && { $not: /EVAL/i }),
  //     }
  //   }

  //   // 4. Filter by search keyword
  //   if (search?.trim()) {
  //     const searchRegex = new RegExp(search.trim(), 'i')
  //     query.$or = [{ name: { $regex: searchRegex } }]
  //   }

  //   // 5. Fetch users with submissions
  //   const users = await User.find(query)
  //     .populate({
  //       path: 'submission.subplan',
  //       model: 'SubmissionPlan',
  //     })
  //     .select('-password -resetPasswordToken -resetPasswordExpires -hashString')
  //     .skip(skip)
  //     .limit(limit)

  //   // 6. Remove draft submissions from each user
  //   const filteredUsers = users
  //     .map((user) => {
  //       if (!Array.isArray(user.submission)) return user
  //       user.submission = user.submission.filter(
  //         (sub) => sub.status !== SubmissionStatus.DRAFT && sub.status !== 'draft'
  //       )
  //       return user
  //     })
  //     .filter((user) => Array.isArray(user.submission) && user.submission.length > 0)

  //   // 7. Prepare response
  //   return {
  //     success: true,
  //     statusCode: statusCode.SUCCESS,
  //     message: 'Submissions fetched successfully',
  //     data: {
  //       users: filteredUsers,
  //       pagination: {
  //         page,
  //         limit,
  //         total: filteredUsers.length,
  //       },
  //     },
  //   }
  // }

  async getPreviewSubmissions(planId: string, userId: string) {
    const user = await User.findById(userId).lean()
    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: 'User not found',
        data: null,
      }
    }

    const planModel = await SubmissionPlan.findById(planId).lean()
    if (!planModel) {
      return {
        success: false,
        statusCode: 404,
        message: 'Plan not found',
        data: null,
      }
    }

    const submissions = await Submission.find({
      subplan: planId,
      user: userId,
    }).lean()

    const submissionMap: Record<string, Record<string, any[]>> = {}
    for (const sub of submissions) {
      const sectionId = sub.section?.toString()
      if (!sectionId) continue
      if (!submissionMap[sectionId]) submissionMap[sectionId] = {}
      for (const q of sub.questionair || []) {
        submissionMap[sectionId][q.question.toString()] = q.ans || []
      }
    }

    const userRole = user.role.toLowerCase()
    const allSections = await Section.find({
      subplan: planId,
      role: { $in: [userRole] },
    })
      .populate({
        path: 'questions',
        match: { role: { $in: [userRole] } },
        options: { sort: { no: 1 } },
      })
      .sort({ no: 1 })
      .lean()

    const processedSections = allSections.map((section: any) => {
      const sectionIdStr = section._id.toString()
      const sectionSubmission = submissions.find((sub) => sub.section?.toString() === sectionIdStr)

      const questions = (section.questions || []).map((question: any) => {
        const questionIdStr = question._id.toString()
        const ansFromMap = submissionMap[sectionIdStr]?.[questionIdStr] || []

        const questionairEntry = sectionSubmission?.questionair?.find(
          (q: any) => q.question.toString() === questionIdStr
        )

        let finalAns = ansFromMap
        if (
          question.qtype === 'file' &&
          (!ansFromMap || ansFromMap.length === 0) &&
          questionairEntry?.ans?.length
        ) {
          finalAns = questionairEntry.ans
        }

        const subQuestions = Array.isArray(question.subQuestions)
          ? question.subQuestions.map((subQ: any) => {
              const subQEntry = questionairEntry?.subQuestions?.find(
                (sq: any) => sq.question.toString() === subQ._id.toString()
              )
              return {
                ...subQ,
                ans: subQEntry?.ans || [],
                comment: subQEntry?.comment || '',
                needImprovement: subQEntry?.needImprovement || false,
              }
            })
          : []

        return {
          ...question,
          ans: finalAns,
          comment: questionairEntry?.comment || '',
          needImprovement: questionairEntry?.needImprovement || false,
          subQuestions,
        }
      })

      return {
        _id: section._id,
        no: section.no,
        subplan: section.subplan,
        role: section.role,
        createdAt: section.createdAt,
        title: section.title,
        updatedAt: section.updatedAt,
        questions,
        status: this.findStatus(sectionIdStr, submissions),
        submissionId: sectionSubmission?._id || null,
      }
    })

    const userSubmissionForPlan = user.submission?.find(
      (sub: any) => sub.subplan?.toString() === planId.toString()
    )
    const planStatus = userSubmissionForPlan?.status

    return {
      success: true,
      statusCode: 200,
      message: 'Preview data retrieved successfully',
      data: {
        sections: processedSections,
        plan: {
          ...planModel,
        },
        title: planModel.title,
        status: planStatus,
      },
    }
  }

  async updateSubmissionStatus(
    planId: string,
    userId: string,
    status: string,
    isSubmitted: boolean
  ) {
    // Step 1: Update User's embedded submission status
    const user = await User.findOneAndUpdate(
      { _id: userId, 'submission.subplan': planId },
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
    if (!isSubmitted && status === 'needs-improvement') {
      const submissions = await Submission.find({ user: userId, subplan: planId })

      for (const submission of submissions) {
        submission.status = SubmissionStatus.CORRECTION_REQUIRED

        for (const q of submission.questionair) {
          q.needImprovement = true

          for (const subQ of q.subQuestions || []) {
            subQ.needImprovement = true
          }
        }

        await submission.save()
      }

      await User.updateOne(
        { _id: userId, 'submission.subplan': planId },
        { $set: { 'submission.$.status': SubmissionStatus.NEEDS_IMPROVEMENT } }
      )
    }

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Submission status updated successfully',
      data: user,
    }
  }

  async getPreviewExport(planId: string, userId: string, format: string) {
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, statusCode: 404, message: 'User not found', data: null }
    }

    const planModel = await SubmissionPlan.findById(planId)
    if (!planModel) {
      return { success: false, statusCode: 404, message: 'Plan not found', data: null }
    }

    const submissions = await Submission.find({ subplan: planId, user: userId }).lean()

    const submissionMap: Record<string, Record<string, any[]>> = {}
    for (const sub of submissions) {
      const sectionId = sub.section?.toString()
      if (!sectionId) continue
      if (!submissionMap[sectionId]) submissionMap[sectionId] = {}
      for (const q of sub.questionair || []) {
        submissionMap[sectionId][q.question.toString()] = q.ans || []
      }
    }

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

    const processedSections = allSections.map((section: any) => {
      const questions = (section.questions || []).map((question: any) => {
        const ans = submissionMap[section._id.toString()]?.[question._id.toString()] || []

        const sectionSubmission = submissions.find(
          (sub) => sub.section?.toString() === section._id.toString()
        )
        const questionairEntry = sectionSubmission?.questionair?.find(
          (q) => q.question.toString() === question._id.toString()
        )

        let finalAns = ans
        if (
          question.qtype === 'file' &&
          (!ans || ans.length === 0) &&
          questionairEntry?.ans?.length
        ) {
          finalAns = questionairEntry.ans
        }

        const subQuestions = (question.subQuestions || []).map((subQ: any) => {
          const subQEntry = questionairEntry?.subQuestions?.find(
            (sq: any) => sq.question.toString() === subQ._id.toString()
          )
          return {
            ...subQ,
            ans: subQEntry?.ans || [],
            qtype: subQ.qtype,
          }
        })

        return {
          ...question,
          ans: finalAns,
          subQuestions,
          qtype: question.qtype,
        }
      })

      return {
        _id: section._id,
        no: section.no,
        subplan: section.subplan,
        role: section.role,
        createdAt: section.createdAt,
        title: section.title,
        updatedAt: section.updatedAt,
        questions,
        status: 'in-progress',
      }
    })

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileName = `submission-preview-${timestamp}.${format}`
    const uploadsDir = path.join(__dirname, '../../public/uploads')
    const filePath = path.join(uploadsDir, fileName)

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    if (format === 'pdf') {
      const html = generateHtmlTemplate(processedSections)
      await generatePdfFromHtml(html, filePath)
    } else {
      await generateDocxFromSections(processedSections, filePath)
    }

    return {
      success: true,
      statusCode: 200,
      message: `${format.toUpperCase()} generated successfully`,
      data: { url: `/uploads/${fileName}` },
    }
  }

  async getAllUsers(): Promise<IServiceResponse<IUser[]>> {
    const users = await User.find({ role: { $ne: 'admin' } }).select(
      '-password -resetPasswordToken -resetPasswordExpires -hashString'
    )

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Users fetched successfully',
      data: users,
    }
  }

  async updateProfile(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IServiceResponse<IUser | null>> {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select('-password -resetPasswordToken -resetPasswordExpires -hashString')

    if (!updatedUser) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'User not found',
        data: null,
      }
    }

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'User updated successfully',
      data: updatedUser,
    }
  }
}

const adminService = new AdminService()
export default adminService
