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
    role: ['user'],
    no: '1',
    question: 'Please provide your full name.',
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
    question: 'What is your gender?',
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
    role: ['user'],
    sectionNo: 1,
    no: '1',
    question: 'Select your highest education level.',
  },
  {
    options: [],
    optional: false,
    qtype: 'file',
    subQuestions: [
      {
        question: 'Upload your cover letter.',
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
    no: '2',
    question: 'Upload your resume.',
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
    role: ['user'],
    sectionNo: 2,
    no: '2',
    question: 'Which programming languages do you know?',
  },
  {
    options: [],
    optional: true,
    qtype: 'date',
    subQuestions: [
      {
        question: 'When did you finish your last project?',
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
    role: ['user'],
    sectionNo: 2,
    no: '2',
    question: 'Please provide your available start date.',
  },
  {
    options: [],
    optional: false,
    qtype: 'date-range',
    subQuestions: [
      {
        question: 'What was your previous employment duration?',
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
    role: ['user'],
    sectionNo: 3,
    no: '3',
    question: 'Specify your availability range.',
  },
  {
    options: [],
    optional: true,
    qtype: 'date',
    subQuestions: [
      {
        question: 'What date did you last update your resume?',
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
    no: '3',
    question: 'When did you last apply for a job?',
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
        question: 'What was your last training program duration?',
        optional: true,
        qtype: 'date-range',
        no: 3,
        options: [],
      },
    ],
    role: ['user'],
    sectionNo: 3,
    no: '3',
    question: 'Provide your learning experience duration.',
  },
]

export async function seedQuestions() {
  try {
    // Fetch all sections to build the mapping
    const allSections = await Section.find({}).lean()

    if (allSections.length === 0) {
      console.warn('⚠️ No sections found. Please run section seeding first.')
      return []
    }

    console.log(`📊 Found ${allSections.length} sections across all submission plans`)

    // Build section mapping: sectionNo-role -> section._id
    const sectionNumberToIdMap = new Map()
    allSections.forEach((section) => {
      const key = `${section.no}-${section.role[0]}`
      // Store all section IDs for this sectionNo-role combination
      if (!sectionNumberToIdMap.has(key)) {
        sectionNumberToIdMap.set(key, [])
      }
      sectionNumberToIdMap.get(key).push(section._id)
    })

    console.log(
      `🗺️ Created section mapping for ${sectionNumberToIdMap.size} unique section-role combinations`
    )

    let allQuestions = []

    // Create questions for each section
    for (const [sectionKey, sectionIds] of sectionNumberToIdMap.entries()) {
      const [sectionNo, role] = sectionKey.split('-')

      // Find questions for this section number and role
      const questionsForSection = questionSeedData.filter(
        (q) => q.sectionNo === parseInt(sectionNo) && q.role.includes(role)
      )

      // Create questions for each section ID (across all submission plans)
      for (const sectionId of sectionIds) {
        const questionsForThisSection = questionsForSection.map((questionData) => ({
          ...questionData,
          _id: new mongoose.Types.ObjectId(),
          section: sectionId,
          // Remove sectionNo as it's not needed in the final document
          sectionNo: undefined,
        }))

        allQuestions.push(...questionsForThisSection)
      }
    }

    console.log(`📝 Prepared ${allQuestions.length} questions for insertion`)

    // Remove undefined sectionNo from questions
    const questionsToInsert = allQuestions.map(({ sectionNo, ...rest }) => rest)

    // Use bulk operations for better performance
    const bulkOps = questionsToInsert.map((question) => ({
      updateOne: {
        filter: { _id: question._id },
        update: { $set: question },
        upsert: true,
      },
    }))

    if (bulkOps.length > 0) {
      await Question.bulkWrite(bulkOps)
      console.log(`✅ ${questionsToInsert.length} questions inserted/updated successfully.`)
    } else {
      console.log('ℹ️ No questions to insert or update.')
    }

    return questionsToInsert
  } catch (error) {
    console.error('❌ Error seeding questions:', error instanceof Error ? error.message : error)
    throw error
  }
}
