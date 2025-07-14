import htmlPdf from 'html-pdf'
import path from 'path'
import fs from 'fs'
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx'

export async function generatePdfFromHtml(html: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const options: htmlPdf.CreateOptions = {
      format: 'Letter',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
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
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          font-size: 12px;
          color: #333;
          line-height: 1.6;
        }
        h1 {
          text-align: center;
          font-size: 20px;
          margin-bottom: 30px;
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        h2 {
          background: #f5f5f5;
          padding: 8px 12px;
          margin: 25px 0 15px 0;
          font-size: 15px;
          border-left: 3px solid #007acc;
        }
        .section {
          page-break-after: always;
        }
        .section:last-child {
          page-break-after: auto;
        }
        .question {
          margin: 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px dashed #eee;
        }
        .question-text {
          font-weight: bold;
          margin-bottom: 5px;
          color: #2c3e50;
        }
        .answer {
          margin-left: 15px;
          color: #555;
          padding: 5px 0;
        }
        .answer-item {
          margin: 3px 0;
        }
        .answer-item:before {
          content: "• ";
          color: #666;
        }
        .file-link {
          color: #0066cc;
          text-decoration: underline;
        }
        .sub-question {
          margin: 8px 0 8px 15px;
          padding: 8px;
          border-left: 2px solid #666;
          background-color: #f0f0f0;
          border-radius: 4px;
        }
        .sub-question-text {
          font-weight: normal;
          color: #222;
          margin-bottom: 3px;
        }
        .no-answer {
          color: #999;
          font-style: italic;
        }
        .no-answer:before {
          content: "• ";
          color: #999;
        }
        .date-value {
          color: #006400;
        }
        .question-number {
          display: inline-block;
          margin-right: 5px;
          font-weight: bold;
          color: #007acc;
        }
      </style>
    </head>
    <body>
      <h1>Submission Preview Report</h1>`

  let questionCounter = 1;

  processedSections.forEach((section: any, sectionIdx: number) => {
    html += `
      <div class="section">
        <h2>${section.title || `Section ${section.no}`}</h2>`

    section.questions.forEach((question: any, qIdx: number) => {
      html += `
        <div class="question">
          <div class="question-text">
            <span class="question-number">Q${questionCounter++}</span>
            ${question.question}
          </div>`

      // Main question answers
      if (question.ans?.length) {
        question.ans.forEach((ans: any) => {
          if (question.qtype === 'file' && ans.value) {
            const fileName = ans.value.split('/').pop()
            html += `
              <div class="answer">
                <div class="answer-item">
                  <a href="${ans.value}" class="file-link">${fileName}</a>
                </div>
              </div>`
          } else {
            html += `
              <div class="answer">
                <div class="answer-item">${ans.value || 'No answer'}</div>
              </div>`
          }
        })
      } else {
        html += `<div class="answer no-answer">No answer provided</div>`
      }

      // Sub-questions
      ;(question.subQuestions || []).forEach((subQ: any) => {
        html += `
          <div class="sub-question">
            <div class="sub-question-text">${subQ.question}</div>`

        if (subQ.ans?.length) {
          subQ.ans.forEach((ans: any) => {
            if (subQ.qtype === 'file' && ans.value) {
              const fileName = ans.value.split('/').pop()
              html += `
                <div class="answer">
                  <div class="answer-item">
                    <a href="${ans.value}" class="file-link">${fileName}</a>
                  </div>
                </div>`
            } else if (subQ.qtype === 'date' && ans.value) {
              html += `
                <div class="answer">
                  <div class="answer-item date-value">
                    ${new Date(ans.value).toLocaleDateString()}
                  </div>
                </div>`
            } else if (subQ.qtype === 'date-range' && ans.value) {
              const from = new Date(ans.value.from).toLocaleDateString()
              const to = new Date(ans.value.to).toLocaleDateString()
              html += `
                <div class="answer">
                  <div class="answer-item date-value">
                    ${from} to ${to}
                  </div>
                </div>`
            } else {
              html += `
                <div class="answer">
                  <div class="answer-item">${ans.value || 'No answer'}</div>
                </div>`
            }
          })
        } else {
          html += `<div class="answer no-answer">No answer provided</div>`
        }

        html += `</div>` // Close sub-question
      })

      html += `</div>` // Close question
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
        children: [
          new Paragraph({
            text: 'Submission Preview Report',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
          ...sections.flatMap((section, sectionIdx) => {
            const sectionTitle = section.title || `Section ${section.no}`
            return [
              new Paragraph({
                text: sectionTitle,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 500, after: 300 },
                pageBreakBefore: sectionIdx > 0,
              }),
              ...section.questions.flatMap((question: any, qIdx: number) => {
                const paragraphs: Paragraph[] = []

                // Question title
                paragraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Q${qIdx + 1}: `,
                        bold: true,
                        color: '007acc',
                      }),
                      new TextRun({
                        text: question.question,
                        bold: true,
                      }),
                    ],
                    spacing: { before: 200, after: 100 },
                  })
                )

                // Answers
                if (question.ans?.length) {
                  question.ans.forEach((ans: any) => {
                    if (question.qtype === 'file' && ans.value) {
                      paragraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'File: ', bold: true }),
                            new TextRun({
                              text: ans.value,
                              color: '0000cc',
                              underline: {},
                            }),
                          ],
                          bullet: { level: 0 },
                        })
                      )
                    } else {
                      paragraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `• ${ans.value || 'No answer'}`,
                            }),
                          ],
                          bullet: { level: 0 },
                        })
                      )
                    }
                  })
                } else {
                  paragraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '• No answer provided',
                          italics: true,
                          color: '888888',
                        }),
                      ],
                    })
                  )
                }

                // Sub-questions
                if (question.subQuestions?.length) {
                  question.subQuestions.forEach((subQ: any, subIdx: number) => {
                    paragraphs.push(
                      new Paragraph({
                        text: `SubQ${subIdx + 1}: ${subQ.question}`,
                        indent: { left: 400 },
                        spacing: { before: 200, after: 100 },
                      })
                    )

                    if (subQ.ans?.length) {
                      subQ.ans.forEach((ans: any) => {
                        if (subQ.qtype === 'file' && ans.value) {
                          paragraphs.push(
                            new Paragraph({
                              children: [
                                new TextRun({ text: 'File: ', bold: true }),
                                new TextRun({
                                  text: ans.value,
                                  color: '0000cc',
                                  underline: {},
                                }),
                              ],
                              bullet: { level: 1 },
                              indent: { left: 600 },
                            })
                          )
                        } else if (subQ.qtype === 'date' && ans.value) {
                          paragraphs.push(
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `• ${new Date(ans.value).toLocaleDateString()}`,
                                }),
                              ],
                              bullet: { level: 1 },
                              indent: { left: 600 },
                            })
                          )
                        } else if (subQ.qtype === 'date-range' && ans.value) {
                          const from = new Date(ans.value.from).toLocaleDateString()
                          const to = new Date(ans.value.to).toLocaleDateString()
                          paragraphs.push(
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `• ${from} to ${to}`,
                                }),
                              ],
                              bullet: { level: 1 },
                              indent: { left: 600 },
                            })
                          )
                        } else {
                          paragraphs.push(
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `• ${ans.value || 'No answer'}`,
                                }),
                              ],
                              bullet: { level: 1 },
                              indent: { left: 600 },
                            })
                          )
                        }
                      })
                    } else {
                      paragraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: '• No answer provided',
                              italics: true,
                              color: '888888',
                            }),
                          ],
                          indent: { left: 600 },
                        })
                      )
                    }
                  })
                }

                return paragraphs
              }),
            ]
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outputPath, buffer)
}
