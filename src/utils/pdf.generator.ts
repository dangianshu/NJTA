import htmlPdf from 'html-pdf'
import path from 'path'
import fs from 'fs'
import {
  Document, Packer, Paragraph, TextRun,
  HeadingLevel, AlignmentType, BorderStyle, ShadingType
} from 'docx'

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
        
        .marks {
          float: right;
          font-weight: bold;
        }
        
        .no-answer {
          font-style: italic;
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

  let questionCounter = 1;

  processedSections.forEach((section: any, sectionIdx: number) => {
    html += `
      <div class="section">
        <div class="section-title">${section.title || `Section ${section.no}`}</div>`

    section.questions.forEach((question: any, qIdx: number) => {
      html += `
        <div class="question-block">
          <div class="question-line">
            <span class="question-number">${questionCounter++}.</span>
            <span class="question-text">${question.question}</span>
          </div>`

      // Main question answers (immediately after main question)
      if (question.ans?.length) {
        question.ans.forEach((ans: any) => {
          if (question.qtype === 'file' && ans.value) {
            const fileName = ans.value.split('/').pop()
            html += `
              <div class="answer-line">
                <span class="answer-label">Ans.</span>
                <span class="answer-text"><a href="${ans.value}" target="_blank" class="file-link">${fileName}</a></span>
              </div>`
          } else {
            html += `
              <div class="answer-line">
                <span class="answer-label">Ans.</span>
                <span class="answer-text">${ans.value || 'No answer provided'}</span>
              </div>`
          }
        })
      } else {
        html += `
          <div class="answer-line">
            <span class="answer-label">Ans.</span>
            <span class="answer-text no-answer">No answer provided</span>
          </div>`
      }

      // Sub-questions and their answers (each sub-question immediately followed by its answer)
      if (question.subQuestions?.length) {
        question.subQuestions.forEach((subQ: any, subIdx: number) => {
          const subLabel = String.fromCharCode(105 + subIdx) // i, ii, iii, iv...
          html += `
            <div class="sub-question">
              <span class="sub-question-label">(${subLabel})</span>
              <span class="question-text">${subQ.question}</span>
            </div>`
          
          // Sub-question answer immediately after sub-question
          if (subQ.ans?.length) {
            subQ.ans.forEach((ans: any) => {
              if (subQ.qtype === 'file' && ans.value) {
                const fileName = ans.value.split('/').pop()
                html += `
                  <div class="answer-line">
                    <span class="answer-label">Ans.</span>
                    <span class="answer-text"><a href="${ans.value}" target="_blank" class="file-link">${fileName}</a></span>
                  </div>`
              } else if (subQ.qtype === 'date' && ans.value) {
                html += `
                  <div class="answer-line">
                    <span class="answer-label">Ans.</span>
                    <span class="answer-text">${new Date(ans.value).toLocaleDateString()}</span>
                  </div>`
              } else if (subQ.qtype === 'date-range' && ans.value) {
                const from = new Date(ans.value.from).toLocaleDateString()
                const to = new Date(ans.value.to).toLocaleDateString()
                html += `
                  <div class="answer-line">
                    <span class="answer-label">Ans.</span>
                    <span class="answer-text">${from} to ${to}</span>
                  </div>`
              } else {
                html += `
                  <div class="answer-line">
                    <span class="answer-label">Ans.</span>
                    <span class="answer-text">${ans.value || 'No answer provided'}</span>
                  </div>`
              }
            })
          } else {
            html += `
              <div class="answer-line">
                <span class="answer-label">Ans.</span>
                <span class="answer-text no-answer">No answer provided</span>
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
                size: 24,
                font: 'Arial'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
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
                  size: 22,
                  font: 'Arial'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 360, after: 240 }
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
                      size: 22,
                      font: 'Arial'
                    }),
                    new TextRun({
                      text: question.question,
                      size: 22,
                      font: 'Arial'
                    }),
                  ],
                  spacing: { before: 180, after: 120 }
                })
              )
 
              // Main question answers (immediately after main question)
              if (question.ans?.length) {
                question.ans.forEach((ans: any) => {
                  if (question.qtype === 'file' && ans.value) {
                    const fileName = ans.value.split('/').pop()
                    elements.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Ans. ',
                            bold: true,
                            size: 22,
                            font: 'Arial'
                          }),
                          new TextRun({
                            text: fileName,
                            size: 22,
                            font: 'Arial',
                            color: '0066cc',
                            underline: {}
                          }),
                        ],
                        spacing: { before: 60, after: 120 }
                      })
                    )
                  } else {
                    elements.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Ans. ',
                            bold: true,
                            size: 22,
                            font: 'Arial'
                          }),
                          new TextRun({
                            text: ans.value || 'No answer provided',
                            size: 22,
                            font: 'Arial'
                          }),
                        ],
                        spacing: { before: 60, after: 120 }
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
                        size: 22,
                        font: 'Arial'
                      }),
                      new TextRun({
                        text: 'No answer provided',
                        italics: true,
                        size: 22,
                        font: 'Arial'
                      }),
                    ],
                    spacing: { before: 60, after: 120 }
                  })
                )
              }
 
              // Sub-questions and their answers (each sub-question immediately followed by its answer)
              if (question.subQuestions?.length) {
                question.subQuestions.forEach((subQ: any, subIdx: number) => {
                  const subLabel = String.fromCharCode(105 + subIdx) // i, ii, iii, iv...
                  
                  // Sub-question
                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `(${subLabel}) `,
                          size: 22,
                          font: 'Arial'
                        }),
                        new TextRun({
                          text: subQ.question,
                          size: 22,
                          font: 'Arial'
                        }),
                      ],
                      indent: { left: 720 },
                      spacing: { before: 120, after: 60 }
                    })
                  )
                  
                  // Sub-question answer immediately after sub-question
                  if (subQ.ans?.length) {
                    subQ.ans.forEach((ans: any) => {
                      if (subQ.qtype === 'file' && ans.value) {
                        const fileName = ans.value.split('/').pop()
                        elements.push(
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Ans. ',
                                bold: true,
                                size: 22,
                                font: 'Arial'
                              }),
                              new TextRun({
                                text: fileName,
                                size: 22,
                                font: 'Arial',
                                color: '0066cc',
                                underline: {}
                              }),
                            ],
                            indent: { left: 720 },
                            spacing: { before: 60, after: 120 }
                          })
                        )
                      } else if (subQ.qtype === 'date' && ans.value) {
                        elements.push(
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Ans. ',
                                bold: true,
                                size: 22,
                                font: 'Arial'
                              }),
                              new TextRun({
                                text: new Date(ans.value).toLocaleDateString(),
                                size: 22,
                                font: 'Arial'
                              }),
                            ],
                            indent: { left: 720 },
                            spacing: { before: 60, after: 120 }
                          })
                        )
                      } else if (subQ.qtype === 'date-range' && ans.value) {
                        const from = new Date(ans.value.from).toLocaleDateString()
                        const to = new Date(ans.value.to).toLocaleDateString()
                        elements.push(
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Ans. ',
                                bold: true,
                                size: 22,
                                font: 'Arial'
                              }),
                              new TextRun({
                                text: `${from} to ${to}`,
                                size: 22,
                                font: 'Arial'
                              }),
                            ],
                            indent: { left: 720 },
                            spacing: { before: 60, after: 120 }
                          })
                        )
                      } else {
                        elements.push(
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Ans. ',
                                bold: true,
                                size: 22,
                                font: 'Arial'
                              }),
                              new TextRun({
                                text: ans.value || 'No answer provided',
                                size: 22,
                                font: 'Arial'
                              }),
                            ],
                            indent: { left: 720 },
                            spacing: { before: 60, after: 120 }
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
                            size: 22,
                            font: 'Arial'
                          }),
                          new TextRun({
                            text: 'No answer provided',
                            italics: true,
                            size: 22,
                            font: 'Arial'
                          }),
                        ],
                        indent: { left: 720 },
                        spacing: { before: 60, after: 120 }
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