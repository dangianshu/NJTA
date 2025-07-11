import { toPlainObject } from '../helper/common'
import Submission from '../models/Submission.models'
import SubmissionPlan from '../models/SubmissionPlan.models'
import User from '../models/User.models'
import { IServiceResponse, IUserPaginatedResponse } from '../types/auth.interface'
import { IPagination } from '../types/common.interface'
import { IAddFeedbackRequest } from '../types/submission.interface'
import { SubmissionStatus } from '../utils/constant'
import { statusCode } from '../utils/statusCode'

class EvaluatorService {
  async getAllSubmission(
    role: string = '',
    pagination: IPagination,
    fy: string = '',
    search: string = ''
  ): Promise<IServiceResponse<IUserPaginatedResponse>> {
    const { page = 1, limit = 10 } = pagination
    const skip = (page - 1) * limit

    const query: any = {}

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

  async addFeedbackToSubmission(data: IAddFeedbackRequest): Promise<IServiceResponse<any>> {
    const { submissionId, questionId, isSubQuestion, comment, needImprovement } = data

    const submission = await Submission.findById(submissionId)
    if (!submission) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'Submission not found',
        data: null,
      }
    }

    let feedbackAdded = false

    for (const q of submission.questionair) {
      if (!isSubQuestion && q.question?.toString() === questionId) {
        q.comment = comment
        q.needImprovement = needImprovement
        feedbackAdded = true
        break
      }

      if (isSubQuestion && Array.isArray(q.subQuestions)) {
        for (const sq of q.subQuestions) {
          if (sq.question?.toString() === questionId) {
            sq.comment = comment
            sq.needImprovement = needImprovement
            feedbackAdded = true
            break
          }
        }
      }

      if (feedbackAdded) break
    }

    if (!feedbackAdded) {
      return {
        success: false,
        statusCode: statusCode.BAD_REQUEST,
        message: 'Question or sub-question not found in submission',
        data: null,
      }
    }

    submission.status = SubmissionStatus.CORRECTION_REQUIRED
    await submission.save()
    await User.updateOne(
      { _id: submission.user, 'submission.subplan': submission.subplan },
      {
        $set: {
          'submission.$.status': SubmissionStatus.NEEDS_IMPROVEMENT,
        },
      }
    )
    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Feedback added successfully',
      data: await toPlainObject(submission),
    }
  }
}

const evaluatorService = new EvaluatorService()
export default evaluatorService
