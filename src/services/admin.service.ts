import User from '../models/User.models'
import { encrypt } from '../helper/encrypt'
import { statusCode } from '../utils/statusCode'
import crypto from 'crypto'
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
    const query: any = { email: { $ne: null } };

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
}

const adminService = new AdminService()
export default adminService
