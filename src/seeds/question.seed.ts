import mongoose from 'mongoose'
import Question from '../models/Question.models'
import Section from '../models/Section.models'

export const questionSeedData = [
  {
    options: [],
    optional: true,
    qtype: 'text',
    subQuestions: [
      {
        question: 'Please enter your first name.',
        optional: false,
        qtype: 'text',
        no: 2,
        options: [],
      },
      {
        question: 'Please enter your last name.',
        optional: false,
        qtype: 'text',
        no: 3,
        options: [],
      },
    ],
    role: ['user','evaluator'],
    no: '1',
    question: 'Please provide your full name user and evaluator.',
    sectionNo: 1,
  },
  {
    options: ['Male', 'Female', 'Other', 'Prefer not to say'],
    optional: true,
    qtype: 'radio',
    subQuestions: [
      {
        question: 'Are you comfortable sharing your gender identity?',
        optional: true,
        qtype: 'radio',
        no: 2,
        options: ['Yes', 'No'],
      },
      {
        question: 'If "Other", please specify.',
        optional: true,
        qtype: 'text',
        no: 3,
        options: [],
      },
    ],
    role: ['user'],
    sectionNo: 1,
    no: '1',
    question: 'What is your gender user?',
  },
  {
    options: ['High School', 'Bachelor', 'Master', 'PhD'],
    optional: true,
    qtype: 'select',
    subQuestions: [
      {
        question: 'What was your major?',
        optional: false,
        qtype: 'text',
        no: 2,
        options: [],
      },
      {
        question: 'Did you complete this education?',
        optional: true,
        qtype: 'radio',
        no: 3,
        options: ['Yes', 'No'],
      },
    ],
    role: ['evaluator'],
    sectionNo: 1,
    no: '1',
    question: 'Evaluator Select your highest education level.',
  },
  {
    options: [],
    optional: false,
    qtype: 'file',
    subQuestions: [
      {
        question: 'User Upload your cover letter.',
        optional: true,
        qtype: 'file',
        no: 2,
        options: [],
      },
      {
        question: 'What file format is your resume in?',
        optional: false,
        qtype: 'select',
        no: 3,
        options: ['PDF', 'DOCX', 'Other'],
      },
    ],
    role: ['user'],
    sectionNo: 2,
    no: '1',
    question: ' User Upload your resume.',
  },
  {
    options: ['JavaScript', 'Python', 'Java', 'C#', 'Go', 'Other'],
    optional: false,
    qtype: 'checkbox',
    subQuestions: [
      {
        question: 'Which one do you prefer most?',
        optional: false,
        qtype: 'select',
        no: 2,
        options: ['JavaScript', 'Python', 'Java', 'Other'],
      },
      {
        question: 'Do you want to learn more languages?',
        optional: true,
        qtype: 'radio',
        no: 3,
        options: ['Yes', 'No'],
      },
    ],
    role: ['evaluator'],
    sectionNo: 2,
    no: '2',
    question: 'Which evaluator programming languages do you know?',
  },
  {
    options: [],
    optional: true,
    qtype: 'date',
    subQuestions: [
      {
        question: 'When user and evaluator did you finish your last project?',
        optional: false,
        qtype: 'date',
        no: 2,
        options: [],
      },
      {
        question: 'When is your next project starting?',
        optional: true,
        qtype: 'date',
        no: 3,
        options: [],
      },
    ],
    role: ['user', 'evaluator'],
    sectionNo: 2,
    no: '3',
    question: 'Please provide user and evaluator your available start date.',
  },
  {
    options: [],
    optional: false,
    qtype: 'date-range',
    subQuestions: [
      {
        question: 'What evaluator was your previous employment duration?',
        optional: false,
        qtype: 'date-range',
        no: 2,
        options: [],
      },
      {
        question: 'For what time period are you available?',
        optional: true,
        qtype: 'date-range',
        no: 3,
        options: [],
      },
    ],
    role: ['evaluator'],
    sectionNo: 3,
    no: '1',
    question: 'Specify evaluator your availability range.',
  },
  {
    options: [],
    optional: true,
    qtype: 'date',
    subQuestions: [
      {
        question: 'What User date did you last update your resume?',
        optional: true,
        qtype: 'date',
        no: 2,
        options: [],
      },
      {
        question: 'What date are you expecting to apply next?',
        optional: true,
        qtype: 'date',
        no: 3,
        options: [],
      },
    ],
    role: ['user'],
    sectionNo: 3,
    no: '2',
    question: 'When User did you last apply for a job?',
  },
  {
    options: [],
    optional: false,
    qtype: 'date-range',
    subQuestions: [
      {
        question: 'Mention your internship period.',
        optional: false,
        qtype: 'date-range',
        no: 2,
        options: [],
      },
      {
        question: 'What was your last user and evaluator training program duration?',
        optional: true,
        qtype: 'date-range',
        no: 3,
        options: [],
      },
    ],
    role: ['user', 'evaluator'],
    sectionNo: 3,
    no: '3',
    question: 'Provide evaluator and user your learning experience duration.',
  },
]

export async function seedQuestions() {
  try {
    const allSections = await Section.find({}).lean()

    if (allSections.length === 0) {
      console.warn('⚠️ No sections found. Please run section seeding first.')
      return []
    }

    console.log(`📊 Found ${allSections.length} sections across all submission plans`)

    const allQuestions: any[] = []

    for (const section of allSections) {
      const sectionRoles = section.role
      const sectionNo = section.no

      // Find questions for this section number and matching role(s)
      const questionsForSection = questionSeedData.filter((q) =>
        q.sectionNo === sectionNo && q.role.some((r) => sectionRoles.includes(r))
      )

      const questionsToInsert = questionsForSection.map((questionData) => ({
        ...questionData,
        _id: new mongoose.Types.ObjectId(),
        section: section._id as mongoose.Types.ObjectId,
        sectionNo: undefined, // remove extra field
      }))

      allQuestions.push(...questionsToInsert)
    }

    console.log(`📝 Prepared ${allQuestions.length} questions for insertion`)

    // Use bulkWrite for efficient inserts
    const bulkOps = allQuestions.map((question) => ({
      updateOne: {
        filter: { _id: question._id },
        update: { $set: question },
        upsert: true,
      },
    }))

    if (bulkOps.length > 0) {
      await Question.bulkWrite(bulkOps)
      console.log(`✅ ${allQuestions.length} questions inserted/updated successfully.`)
    } else {
      console.log('ℹ️ No questions to insert or update.')
    }

    return allQuestions
  } catch (error) {
    console.error('❌ Error seeding questions:', error instanceof Error ? error.message : error)
    throw error
  }
}
