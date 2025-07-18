import htmlPdf from 'html-pdf'
import path from 'path'
import fs from 'fs'
import {
  Document, Packer, Paragraph, TextRun,
   AlignmentType, BorderStyle, ExternalHyperlink
} from 'docx'
import { CONFIG } from '../config/env.config'

export async function generatePdfFromHtml(html: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const options: htmlPdf.CreateOptions = {
      format: 'A4',
      border: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in',
      },
      timeout: 60000,
      phantomPath: require('phantomjs-prebuilt').path,
      childProcessOptions: {
        env: {
          OPENSSL_CONF: '/dev/null',
        },
      } as any,
    }

    htmlPdf.create(html, options).toFile(outputPath, (err: any, res: any) => {
      if (err) {
        console.error('PDF generation error:', err)
        return reject(err)
      }
      console.log('PDF generated successfully at:', res.filename)
      resolve(res.filename)
    })
  })
}

export function generateHtmlTemplate(processedSections: any[]): string {
  const fileBaseUrl = CONFIG.FRONTEND_URL 

  const displayAnswer = (val: any): string =>
    val !== undefined && val !== null && val !== '' ? val : 'Not Provided'

  let html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Submission Preview Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000000;
          margin: 0;
          padding: 0;
          background: white;
        }

        .header {
          text-align: center;
          margin-bottom: 25px;
          border-top: 2px solid #000000;
          border-bottom: 2px solid #000000;
          padding: 8px 0;
        }

        .header h1 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
        }

        .section {
          margin-bottom: 25px;
        }

        .section-title {
          font-size: 11pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .question-block {
          margin-bottom: 15px;
        }

        .question-line {
          margin-bottom: 8px;
        }

        .question-number {
          font-weight: bold;
          margin-right: 5px;
        }

        .question-text {
          font-weight: normal;
        }

        .sub-question {
          margin-left: 20px;
          margin-top: 5px;
          margin-bottom: 5px;
        }

        .sub-question-label {
          font-weight: normal;
          margin-right: 8px;
        }

        .answer-line {
          margin-top: 3px;
          margin-bottom: 8px;
        }

        .answer-label {
          font-weight: bold;
          margin-right: 5px;
        }

        .answer-text {
          font-weight: normal;
        }

        .file-link {
          color: #0066cc;
          text-decoration: underline;
        }

        .file-link:hover {
          color: #0052a3;
        }

        .no-answer {
          font-style: italic;
          color: #666666;
        }

        @media print {
          body {
            font-size: 10pt;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Submission Preview Report</h1>
      </div>`

  let questionCounter = 1

  processedSections.forEach((section: any) => {
    html += `
      <div class="section">
        <div class="section-title">${section.title || `Section ${section.no}`}</div>`

    section.questions.forEach((question: any) => {
      html += `
        <div class="question-block">
          <div class="question-line">
            <span class="question-number">${questionCounter++}.</span>
            <span class="question-text">${question.question}</span>
          </div>`

      // Main answers
if (question.ans?.length) {
  question.ans.forEach((ans: any) => {
    const answerValue = displayAnswer(ans.value);

    if (question.qtype === 'date-range' && ans.value?.from && ans.value?.to) {
      const from = new Date(ans.value.from).toLocaleDateString();
      const to = new Date(ans.value.to).toLocaleDateString();
      html += `
        <div class="answer-line">
          <span class="answer-label">Ans.</span>
          <span class="answer-text">${from} to ${to}</span>
        </div>`;
    } else if (question.qtype === 'file' && ans.value && answerValue !== 'Not Provided') {
      const fileName = ans.value.split('/').pop();
      const fileUrl = `${fileBaseUrl}/${fileName}`;
      html += `
        <div class="answer-line">
          <span class="answer-label">Ans.</span>
          <span class="answer-text"><a href="${fileUrl}" target="_blank" class="file-link">${fileName}</a></span>
        </div>`;
    } else {
      const cssClass = answerValue === 'Not Provided' ? 'answer-text no-answer' : 'answer-text';
      html += `
        <div class="answer-line">
          <span class="answer-label">Ans.</span>
          <span class="${cssClass}">${answerValue}</span>
        </div>`;
    }
  });
} else {
  html += `
    <div class="answer-line">
      <span class="answer-label">Ans.</span>
      <span class="answer-text no-answer">Not Provided</span>
    </div>`;
}

      // Sub-questions
if (question.subQuestions?.length) {
  question.subQuestions.forEach((subQ: any, subIdx: number) => {
    const subLabel = String.fromCharCode(105 + subIdx) // i, ii, iii...

    html += `
      <div class="sub-question">
        <span class="sub-question-label">(${subLabel})</span>
        <span class="question-text">${subQ.question}</span>
      </div>`

    if (subQ.ans?.length) {
      subQ.ans.forEach((ans: any) => {
        const answerValue = displayAnswer(ans.value)

        if (subQ.qtype === 'date-range' && ans.value?.from && ans.value?.to) {
          const from = new Date(ans.value.from).toLocaleDateString()
          const to = new Date(ans.value.to).toLocaleDateString()
          html += `
            <div class="answer-line">
              <span class="answer-label">Ans.</span>
              <span class="answer-text">${from} to ${to}</span>
            </div>`
        } else if (subQ.qtype === 'file' && ans.value && answerValue !== 'Not Provided') {
          const fileName = ans.value.split('/').pop()
          const fileUrl = `${fileBaseUrl}/${fileName}`
          html += `
            <div class="answer-line">
              <span class="answer-label">Ans.</span>
              <span class="answer-text"><a href="${fileUrl}" target="_blank" class="file-link">${fileName}</a></span>
            </div>`
        } else if (subQ.qtype === 'date' && ans.value && answerValue !== 'Not Provided') {
          html += `
            <div class="answer-line">
              <span class="answer-label">Ans.</span>
              <span class="answer-text">${new Date(ans.value).toLocaleDateString()}</span>
            </div>`
        } else {
          const cssClass = answerValue === 'Not Provided' ? 'answer-text no-answer' : 'answer-text'
          html += `
            <div class="answer-line">
              <span class="answer-label">Ans.</span>
              <span class="${cssClass}">${answerValue}</span>
            </div>`
        }
      })
    } else {
      html += `
        <div class="answer-line">
          <span class="answer-label">Ans.</span>
          <span class="answer-text no-answer">Not Provided</span>
        </div>`
    }
  })
}

      html += `</div>` // Close question-block
    })

    html += `</div>` // Close section
  })

  html += `</body></html>`
  return html
}

export async function generateDocxFromSections(sections: any[], outputPath: string) {
  const fileBaseUrl = CONFIG.FRONTEND_URL || 'http://localhost:3002/uploads'
  
  const displayAnswer = (val: any): string =>
    val !== undefined && val !== null && val !== '' ? val : 'Not Provided'

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
          }
        },
        children: [
          // Title with borders
          new Paragraph({
            children: [
              new TextRun({
                text: 'SUBMISSION PREVIEW REPORT',
                bold: true,
                size: 24, // Keep title slightly larger
                font: 'Arial'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 },
            border: {
              top: { color: "000000", size: 6, style: BorderStyle.SINGLE },
              bottom: { color: "000000", size: 6, style: BorderStyle.SINGLE }
            }
          }),
 
          ...sections.flatMap((section: any, sectionIdx: number) => {
            const sectionTitle = section.title || `Section ${section.no}`
            let questionCounter = 1
 
            // Section Heading
            const sectionHeading = new Paragraph({
              children: [
                new TextRun({
                  text: sectionTitle.toUpperCase(),
                  bold: true,
                  size: 22, // 11pt
                  font: 'Arial'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 500, after: 300 }
            })
 
            // Questions
            const questionParagraphs = section.questions.flatMap((question: any, qIdx: number) => {
              const elements: Paragraph[] = []
 
              // Main question
              elements.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${questionCounter++}. `,
                      bold: true,
                      size: 22, // 11pt
                      font: 'Arial'
                    }),
                    new TextRun({
                      text: question.question,
                      size: 22, // 11pt
                      font: 'Arial'
                    }),
                  ],
                  spacing: { before: 120, after: 60 }
                })
              )
 
              // Main question answers (immediately after main question)
              if (question.ans?.length) {
                question.ans.forEach((ans: any) => {
                  const answerValue = displayAnswer(ans.value)
                  
                  if (question.qtype === 'file' && ans.value && answerValue !== 'Not Provided') {
                    const fileName = ans.value.split('/').pop()
                    const fileUrl = `${fileBaseUrl}/${fileName}`
                    elements.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Ans. ',
                            bold: true,
                            size: 22, // 11pt
                            font: 'Arial'
                          }),
                          new ExternalHyperlink({
                            children: [
                              new TextRun({
                                text: fileName,
                                size: 22, // 11pt
                                font: 'Arial',
                                color: '0066cc',
                                underline: {}
                              }),
                            ],
                            link: fileUrl
                          }),
                        ],
                        spacing: { before: 60, after: 160 }
                      })
                    )
                  } else {
                    const isNotProvided = answerValue === 'Not Provided'
                    elements.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Ans. ',
                            bold: true,
                            size: 22, // 11pt
                            font: 'Arial'
                          }),
                          new TextRun({
                            text: answerValue,
                            size: 22, // 11pt
                            font: 'Arial',
                            italics: isNotProvided,
                            color: isNotProvided ? '666666' : '000000'
                          }),
                        ],
                        spacing: { before: 60, after: 160 }
                      })
                    )
                  }
                })
              } else {
                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Ans. ',
                        bold: true,
                        size: 22, // 11pt
                        font: 'Arial'
                      }),
                      new TextRun({
                        text: 'Not Provided',
                        italics: true,
                        size: 22, // 11pt
                        font: 'Arial',
                        color: '666666'
                      }),
                    ],
                    spacing: { before: 60, after: 160 }
                  })
                )
              }
 
              // Sub-questions and their answers (each sub-question immediately followed by its answer)
              if (question.subQuestions?.length) {
                question.subQuestions.forEach((subQ: any, subIdx: number) => {
                  const subLabel = String.fromCharCode(105 + subIdx) // i, ii, iii, iv...
                  
                  // Sub-question with proper indentation
                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `(${subLabel}) `,
                          size: 22, // 11pt
                          font: 'Arial'
                        }),
                        new TextRun({
                          text: subQ.question,
                          size: 22, // 11pt
                          font: 'Arial'
                        }),
                      ],
                      indent: { left: 576 }, // 20px equivalent in twentieths of a point
                      spacing: { before: 100, after: 60 }
                    })
                  )
                  
                  // Sub-question answer immediately after sub-question
                  if (subQ.ans?.length) {
                    subQ.ans.forEach((ans: any) => {
                      const answerValue = displayAnswer(ans.value)
                      
                      if (subQ.qtype === 'file' && ans.value && answerValue !== 'Not Provided') {
                        const fileName = ans.value.split('/').pop()
                        const fileUrl = `${fileBaseUrl}/${fileName}`
                        elements.push(
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Ans. ',
                                bold: true,
                                size: 22, // 11pt
                                font: 'Arial'
                              }),
                              new ExternalHyperlink({
                                children: [
                                  new TextRun({
                                    text: fileName,
                                    size: 22, // 11pt
                                    font: 'Arial',
                                    color: '0066cc',
                                    underline: {}
                                  }),
                                ],
                                link: fileUrl
                              }),
                            ],
                            spacing: { before: 60, after: 160 }
                          })
                        )
                      } else if (subQ.qtype === 'date' && ans.value && answerValue !== 'Not Provided') {
                        elements.push(
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Ans. ',
                                bold: true,
                                size: 22, // 11pt
                                font: 'Arial'
                              }),
                              new TextRun({
                                text: new Date(ans.value).toLocaleDateString(),
                                size: 22, // 11pt
                                font: 'Arial'
                              }),
                            ],
                            spacing: { before: 60, after: 160 }
                          })
                        )
                      } else if (subQ.qtype === 'date-range' && ans.value?.from && ans.value?.to) {
                        const from = new Date(ans.value.from).toLocaleDateString()
                        const to = new Date(ans.value.to).toLocaleDateString()
                        elements.push(
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Ans. ',
                                bold: true,
                                size: 22, // 11pt
                                font: 'Arial'
                              }),
                              new TextRun({
                                text: `${from} to ${to}`,
                                size: 22, // 11pt
                                font: 'Arial'
                              }),
                            ],
                            spacing: { before: 60, after: 160 }
                          })
                        )
                      } else {
                        const isNotProvided = answerValue === 'Not Provided'
                        elements.push(
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Ans. ',
                                bold: true,
                                size: 22, // 11pt
                                font: 'Arial'
                              }),
                              new TextRun({
                                text: answerValue,
                                size: 22, // 11pt
                                font: 'Arial',
                                italics: isNotProvided,
                                color: isNotProvided ? '666666' : '000000'
                              }),
                            ],
                            spacing: { before: 60, after: 160 }
                          })
                        )
                      }
                    })
                  } else {
                    elements.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Ans. ',
                            bold: true,
                            size: 22, // 11pt
                            font: 'Arial'
                          }),
                          new TextRun({
                            text: 'Not Provided',
                            italics: true,
                            size: 22, // 11pt
                            font: 'Arial',
                            color: '666666'
                          }),
                        ],
                        spacing: { before: 60, after: 160 }
                      })
                    )
                  }
                })
              }
 
              return elements
            })
 
            return [sectionHeading, ...questionParagraphs]
          }),
        ],
      },
    ],
  })
 
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
 
  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outputPath, buffer)
}



