import Question from "../models/Question.models";
import Section from "../models/Section.models";


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
    "role": ["evaluator"],
    "no": "1",
    "question": "Since the submission of the organization\u2019s last ADA Plan, has the organization made progress in its access efforts?  Did they describe the process of sharing their completed/approved plan with their Board, staff and volunteers?  Q1",
    "sectionNo": 1
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
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
    "role": ["evaluator"],
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
    "role": ["evaluator"],
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
    "role": ["evaluator"],
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
    "role": ["evaluator"],
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
    "role": ["evaluator"],
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
    "role": ["evaluator"],
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
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 4,
    "no": "10",
    "question": "Does the organization offer or plan to offer accessible virtual programs? Q32-34"
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
    "role": ["evaluator"],
    "sectionNo": 4,
    "no": "11",
    "question": "Are the goals reasonable?"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 5,
    "no": "12",
    "question": "Assistive listening system provided in assembly areas, seating areas, and/or for guided tours or lectures (check one): Q35"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 5,
    "no": "13",
    "question": "Sign language interpretation of performances, guided tours, or lecture (check one): Q36"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 5,
    "no": "14",
    "question": "Open/closed captioning at performances, lectures, tours, workshops, or for film/video (check one): Q37"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 5,
    "no": "15",
    "question": "Advance copies of scripts or synopses (check one): Q38"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 5,
    "no": "16",
    "question": "High volume tape tours/Printed self-guided tours(check one): Q39"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 5,
    "no": "17",
    "question": "Are the goals reasonable?"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 6,
    "no": "18",
    "question": "Audio-described performances or guided tours(check one): Q40"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 6,
    "no": "19",
    "question": "Sensory seminars in conjunction with an event or exhibition (check one): Q41"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 6,
    "no": "20",
    "question": "Braille and large print materials (programs, exhibit or display signage, and/or other materials) (check one):Q42"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 6,
    "no": "21",
    "question": "Materials available online (event brochures, programs, exhibit or display information, etc.)Q43"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 6,
    "no": "22",
    "question": "Recorded, MP-3s or other digital media of exhibits or other programs: Q44"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 6,
    "no": "23",
    "question": "Are the goals reasonable?"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 7,
    "no": "24",
    "question": "Does the organization offer or plan to offer programs/services for patrons with autism, cognitive disabilities or developmental disabilities? Q45"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 7,
    "no": "25",
    "question": "Are the goals reasonable?"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 8,
    "no": "26",
    "question": " Is the achievement of all programming goals on a realistic and reasonable timeline?"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 8,
    "no": "27",
    "question": "Does it appear the organization has given reasonable, realistic, and responsible consideration to the resources that may be necessary to achieve programming goals according to the timeline and how these resources will be acquired?"
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
    "role": ["evaluator"],
    "sectionNo": 8,
    "no": "28",
    "question": " Are the areas marked N/A appropriate for the various programming goals and the discipline of the organization?"
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
    "role": ["evaluator"],
    "sectionNo": 8,
    "no": "29",
    "question": "Please rate Programs and Services (check one)"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 9,
    "no": "30",
    "question": "Organization has reviewed or plans to review its website and has or plans to incorporate basic accessibility features: Q46"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 9,
    "no": "31",
    "question": "Organization has an accessibility statement on the home page or another page of the website and an accessibility section on the website that lists accessible programs and services to patrons: Q47"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 9,
    "no": "32",
    "question": "Organization offers ticket sales on its website or through an on-line ticketing service: Q48"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 9,
    "no": "33",
    "question": "Organization offers seating diagram or chart showing location of accessible seating for ticket sales on its website or through an on-line ticketing service: Q49"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 9,
    "no": "34",
    "question": "Organization offers tickets in all price ranges to people with disabilities and up to three companions requesting accessible seating: Q50-51"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 9,
    "no": "35",
    "question": "Organization offers discounted ticket prices to individuals with disabilities and their companions: Q52"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "36",
    "question": "Brochures and other marketing materials available or offered in alternate formats (e.g. large print/Braille/electronic media): Q53"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "37",
    "question": "Social media posts are accessible? Q54"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "38",
    "question": "Brochures and other marketing materials list appropriate international access symbols and/or include a statement regarding accessibility policies: Q55"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "39",
    "question": "Organization has reasonable advance notification policy for patrons interested in utilizing its special programs and services (e.g. sign interpretation, large print programs, etc.): Q56-57"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "40",
    "question": "Organization utilizes its ADA advisory board or similar representation to reach patrons with disabilities: Q58"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "41",
    "question": "The organization has developed or is planning to develop a targeted marketing approach to reach out to patrons with disabilities: Q59"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "42",
    "question": "Keeping in mind the answers to the marketing and website questions, please answer the following: Does it appear the organization has laid out appropriate goals, objectives and strategies to overcome the barriers identified?"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "43",
    "question": "Is the achievement of these goals on a realistic and reasonable timeline?"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "44",
    "question": "Does it appear the organization has given reasonable, realistic and responsible consideration to the resources that may be necessary to achieve goals according to the timeline and how these resources will be acquired?"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "45",
    "question": "Are the areas marked N/A appropriate?"
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
    "role": ["evaluator"],
    "sectionNo": 10,
    "no": "46",
    "question": "Please rate Website, Effective Communications, and Marketing Practices (check one)"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 11,
    "no": "47",
    "question": "For touring organizations only: provides a letter of agreement or ADA checklist to the landlord or manager of the venue in which programming will take place: Q60-61"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "48",
    "question": "Accessible route from public transportation to the facility Q62-63"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "49",
    "question": "ADA compliant parking: Q64-65"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "50",
    "question": "Accessible route from parking to primary accessible entrance: Q66-67"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "51",
    "question": "ADA compliant doors to entrance, bathrooms, assembly areas, gallery and display areas: Q68-69"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "52",
    "question": "Multi-level facility has an elevator or interior ramps at level changes: Q70-71"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "53",
    "question": "Restrooms (or all-gender bathroom) used by the public are ADA compliant: Q72-73"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "54",
    "question": "Seating area(s) of the facility has the correct percentage of wheelchair locations on each level as required by law. Q74-75"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "55",
    "question": "ADA compliant signage: Q76-77"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "56",
    "question": "ADA compliant box office window/information desk: Q78-79"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "57",
    "question": "ADA compliant concession stand/gift shop: Q80-81"
  },
  {
    "options": ["Offers Now", "Plans to Offer", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "58",
    "question": "ADA compliant performance/dressing room/artist space: Q82-83"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "59",
    "question": "Does the organization identify someone responsible for facility access? Q84"
  },
  {
    "options": ["Yes", "No", "N/A"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "60",
    "question": "Has the organization budgeted for access capital needs? Q85"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "61",
    "question": "Keeping in mind the answers to the facility questions, please answer the following: Does it appear the organization has laid out appropriate goals, objectives, and strategies to overcome the barriers identified?"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "62",
    "question": "Is the achievement of these goals on a realistic and reasonable timeline?"
  },
  {
    "options": ["Yes", "No"],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "63",
    "question": "Does it appear the organization has given reasonable, realistic and responsible consideration to the resources that may be necessary to achieve goals according to the timeline and how these resources will be acquired?"
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
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "64",
    "question": "Are the areas marked N/A appropriate for the programs and discipline of the organization?"
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
    "role": ["evaluator"],
    "sectionNo": 12,
    "no": "65",
    "question": "Please rate Facility (check your rating)"
  },
  {
    "options": [
      "Excellent: most sections rated excellent with no more than 2 sections rated good and no sections rated fair or needs improvement",
      "Good: most sections rated good or better with no more than two sections rated fair and no sections rated needs improvement",
      "Fair: most sections rated fair or better with no more than two sections rated needs improvement",
      "Needs Improvement: three sections or more rated needs  improvement"
    ],
    "optional": true,
    "qtype": "radio",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 13,
    "no": "66",
    "question": "Keeping in mind your review of the entire plan, please provide an ADA Plan score. Final Score: (check one)"
  },
  {
    "options": [],
    "optional": true,
    "qtype": "multi-text",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 13,
    "no": "67",
    "question": "If this plan is evaluated as 'Needs Improvement,' identify the specific areas where the plan needs to be improved:"
  },
  {
    "options": [],
    "optional": true,
    "qtype": "multi-text",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 13,
    "no": "68",
    "question": "If this plan is evaluated as 'Excellent,' identify the elements that make it stand out as a model plan."
  },
  {
    "options": [],
    "optional": true,
    "qtype": "multi-text",
    "subQuestions": [],
    "role": ["evaluator"],
    "sectionNo": 13,
    "no": "69",
    "question": "Additional Comments:"
  }
]


export async function seedQuestions() {
  // Fetch all sections to build the mapping
  const allSections = await Section.find({});
  console.log("-------::",allSections )
  const sectionNumberToIdMap = new Map();
  console.log("Section Number to ID Map: ", sectionNumberToIdMap);
  allSections.forEach(section => {
    sectionNumberToIdMap.set(`${section.no}-${section.role[0]}`, section._id);
  });

  // Prepare questions with correct section _id
  const questionsWithSectionId = questionSeedData.map(q => {
    const sectionId = sectionNumberToIdMap.get(`${q.sectionNo}-${q.role[0]}`);
    console.log("----------->>", sectionId)
    if (!sectionId) {
      console.warn(`Section ID not found for sectionNo ${q.sectionNo} and role ${q.role[0]}`);
    }
    return {
      ...q,
      section: sectionId || undefined,
    };
  });

  // Remove sectionNo from each question before insert
  const questionsToInsert = questionsWithSectionId.map(({ sectionNo, ...rest }) => rest);

  await Question.deleteMany({});
  await Question.insertMany(questionsToInsert);
  console.log('Questions seeded!');
}