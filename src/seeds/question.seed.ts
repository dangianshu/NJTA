import mongoose from 'mongoose'
import Question from '../models/Question.models'
import Section from '../models/Section.models'

export const questionSeedData = [
  {
    options: [],
    optional: false,
    qtype: 'text',
    subQuestions: [
      {
        question: 'Comments',
        optional: true,
        qtype: 'multi-text',
        no: 2,
        options: [],
      },
      {
        question: 'If yes, please describe the progress made in access efforts.',
        optional: true,
        qtype: 'radio',
        no: 3,
        options: ['Yes', 'No'],
      },
      {
        question: 'What discipline?.',
        optional: true,
        qtype: 'radio-multi',
        no: 4,
        options: ['Arts Education', 'County Arts Agency', 'Crafts', 'Dance', 'Film/Radio'],
      },
    ],
    role: ['user'],
    no: '1',
    question:
      'Since the submission of the organization\u2019s last ADA Plan, has the organization made progress in its access efforts?  Did they describe the process of sharing their completed/approved plan with their Board, staff and volunteers?  Q1',
    sectionNo: 1,
  },
  {
    options: [
      'Teen Arts',
      'Lectures/Workshops',
      'Concerts/Plays/Musicals',
      'Exhibits',
      'Docent tours',
      'Poetry/Play Readings',
      'Outdoor events',
      'Film',
    ],
    optional: false,
    qtype: 'checkbox',
    subQuestions: [
      {
        question: '18 Year Olds and Younger',
        optional: true,
        qtype: 'checkbox',
        no: 2,
        options: ['Yes', 'No'],
      },
      {
        question: 'Which role you want to play',
        optional: false,
        qtype: 'select',
        no: 3,
        options: ['Volunteer', 'Staff', 'Board Member'],
      },
    ],
    role: ['user'],
    sectionNo: 2,
    no: '1',
    question: 'Please indicate the types of events your organization offers. Check all that apply.',
  },
  {
    options: [],
    optional: false,
    qtype: 'file',
    subQuestions: [
      {
        question: 'write your policy here',
        optional: true,
        qtype: 'textarea',
        no: 2,
        options: [],
      },
      {
        question: 'Which date you have join.',
        optional: false,
        qtype: 'date',
        no: 3,
        options: [],
      },
      {
        question: 'If yes, please upload your policy here.',
        optional: true,
        qtype: 'date-range',
        no: 4,
        options: [],
      },
      {
        question: 'If yes, please upload your policy here.',
        optional: true,
        qtype: 'file',
        no: 5,
        options: [],
      },
    ],
    role: ['user'],
    sectionNo: 3,
    no: '1',
    question: 'If yes, upload your policy here.',
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
