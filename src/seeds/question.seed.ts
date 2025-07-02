import mongoose from 'mongoose'
import Question from "../models/Question.models"
import Section from "../models/Section.models"


export const questionSeedData = [
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio-multi",
    "subQuestions": [
      {
        "question": "Comments",
        "qtype": "multi-text",
        "no": 2,
        "options": []
      }
    ],
    "role": ["user"],
    "no": "1",
    "question": "Since the submission of the organization\u2019s last ADA Plan, has the organization made progress in its access efforts?  Did they describe the process of sharing their completed/approved plan with their Board, staff and volunteers?  Q1",
    "sectionNo": 1
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["user"],
    "sectionNo": 1,
    "no": "2",
    "question": "Has the organization conducted a self-assessment or contracted a professional assessment of its facilities and programs? Q2"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio-multi",
    "subQuestions": [
      {
        "question": "Comments",
        "qtype": "multi-text",
        "no": 2,
        "options": []
      }
    ],
    "role": ["user"],
    "sectionNo": 1,
    "no": "3",
    "question": "Is the explanation of the self-assessment process acceptable? Q3-4"
  },
  {
    "options": [
      "Has provided a board-approved policy statement regarding ADA compliance.   Q5-7",
      "Has assigned or plans to assign an ADA coordinator and name has been identified. Q8-9",
      "Has established or plans to establish or share an Access Advisory Board or similar group to assure ADA compliance and program quality with explanation of members and/or plans in the establishment of an advisory board. Q10-11",
      "Offers Access Awareness Training. Q-12-13",
      "Attends Cultural Access Network workshop and other education offerings? Q14",
      "Has a budget for access programs and services. Q15-16",
      "Has an Emergency Preparedness Plan that includes provisions for patrons with disabilities. Q17-19",
      "Solicits feedback from individuals with disabilities through surveys and focus groups. Q20",
      "Has a policy for admitting service animals. Q21-22"
    ],
    "optional": true,
    "qtype": "checkbox-multi",
    "subQuestions": [
      {
        "question": "Comments",
        "qtype": "multi-text",
        "no": 2,
        "options": []
      }
    ],
    "role": ["user"],
    "sectionNo": 1,
    "no": "4",
    "question": "The plan demonstrates that the organization (check those that are applicable):"
  },
  {
    "options": ["Excellent", "Good", "Fair", "Needs Improvement"],
    "optional": true,
    "qtype": "radio-multi",
    "subQuestions": [
      {
        "question": "Comments",
        "qtype": "multi-text",
        "no": 2,
        "options": []
      }
    ],
    "role": ["user"],
    "sectionNo": 1,
    "no": "5",
    "question": "Please rate Organizational Policies and Practices (check your rating)"
  },
  {
    "options": [
      "A board approved organizational employment non-discrimination policy statement, which includes people with disabilities.  Q23-24",
      "Employment/volunteer forms that are offered in alternative formats. Q25",
      "A plan to provide reasonable accommodations for meetings and/or employee interviews if its current administrative office is not accessible. Q26",
      "Evidence of being proactive in hiring people with disabilities (artists, managers and volunteers). Q27",
      "(OPTIONAL) Job descriptions for staff and volunteer positions that outline essential and marginal functions. Q28"
    ],
    "optional": true,
    "qtype": "checkbox-multi",
    "subQuestions": [
      {
        "question": "Comments",
        "qtype": "multi-text",
        "no": 2,
        "options": []
      }
    ],
    "role": ["user"],
    "sectionNo": 2,
    "no": "6",
    "question": "The plan demonstrates that the organization has the following (check those that are applicable):"
  },
  {
    "options": ["Excellent", "Good", "Fair", "Needs Improvement"],
    "optional": true,
    "qtype": "radio-multi",
    "subQuestions": [
      {
        "question": "Comments",
        "qtype": "multi-text",
        "no": 2,
        "options": []
      }
    ],
    "role": ["user"],
    "sectionNo": 2,
    "no": "7",
    "question": "Please rate Employment Policies and Practices (check one)"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio-multi",
    "subQuestions": [
      {
        "question": "Comments",
        "qtype": "multi-text",
        "no": 2,
        "options": []
      }
    ],
    "role": ["user"],
    "sectionNo": 3,
    "no": "8",
    "question": "A reasonable board-approved patron facing grievance procedure with specific steps has been provided. Q29-31"
  },
  {
    "options": ["Excellent", "Good", "Fair", "Needs Improvement"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 3,
    "no": "9",
    "question": "Please rate Grievance Procedure (check one)"
  },
]

export async function seedQuestions() {
  try {
    // Fetch all sections to build the mapping
    const allSections = await Section.find({}).lean()
    
    if (allSections.length === 0) {
      console.warn("⚠️ No sections found. Please run section seeding first.")
      return []
    }

    console.log(`📊 Found ${allSections.length} sections across all submission plans`)
    
    // Build section mapping: sectionNo-role -> section._id
    const sectionNumberToIdMap = new Map()
    allSections.forEach(section => {
      const key = `${section.no}-${section.role[0]}`
      // Store all section IDs for this sectionNo-role combination
      if (!sectionNumberToIdMap.has(key)) {
        sectionNumberToIdMap.set(key, [])
      }
      sectionNumberToIdMap.get(key).push(section._id)
    })

    console.log(`🗺️ Created section mapping for ${sectionNumberToIdMap.size} unique section-role combinations`)

    let allQuestions = []

    // Create questions for each section
    for (const [sectionKey, sectionIds] of sectionNumberToIdMap.entries()) {
      const [sectionNo, role] = sectionKey.split('-')
      
      // Find questions for this section number and role
      const questionsForSection = questionSeedData.filter(q => 
        q.sectionNo === parseInt(sectionNo) && q.role.includes(role)
      )

      // Create questions for each section ID (across all submission plans)
      for (const sectionId of sectionIds) {
        const questionsForThisSection = questionsForSection.map(questionData => ({
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
    const bulkOps = questionsToInsert.map(question => ({
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
      console.log("ℹ️ No questions to insert or update.")
    }

    return questionsToInsert
  } catch (error) {
    console.error("❌ Error seeding questions:", error instanceof Error ? error.message : error)
    throw error
  }
}