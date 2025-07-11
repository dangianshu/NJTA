import htmlPdf from 'html-pdf'
import path from 'path'
import fs from 'fs'
import { Document, Packer, Paragraph, HeadingLevel } from 'docx'

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
          margin-left: 10px;
          color: #555;
          padding: 5px 0;
        }
        .answer-item {
          margin: 3px 0;
        }
        .file-link {
          color: #0066cc;
          text-decoration: underline;
        }
        .sub-question {
          margin: 8px 0 8px 15px;
          padding-left: 10px;
          border-left: 2px solid #ddd;
        }
        .sub-question-text {
          font-weight: normal;
          color: #444;
          margin-bottom: 3px;
        }
        .no-answer {
          color: #999;
          font-style: italic;
        }
        .date-value {
          color: #006400;
        }
      </style>
    </head>
    <body>
      <h1>Submission Preview Report</h1>`

  processedSections.forEach((section: any, sectionIdx: number) => {
    html += `
      <h2>${section.title || `Section ${section.no}`}</h2>`

    section.questions.forEach((question: any, qIdx: number) => {
      html += `
        <div class="question">
          <div class="question-text">${question.question}</div>`

      // Main question answers
      if (question.ans?.length) {
        question.ans.forEach((ans: any) => {
          if (question.qtype === 'file' && ans.value) {
            const fileName = ans.value.split('/').pop()
            html += `
              <div class="answer">
                <a href="${ans.value}" class="file-link">${fileName}</a>
              </div>`
          } else {
            html += `
              <div class="answer">${ans.value || 'No answer'}</div>`
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
                  <a href="${ans.value}" class="file-link">${fileName}</a>
                </div>`
            } else if (subQ.qtype === 'date' && ans.value) {
              html += `
                <div class="answer date-value">
                  ${new Date(ans.value).toLocaleDateString()}
                </div>`
            } else if (subQ.qtype === 'date-range' && ans.value) {
              const from = new Date(ans.value.from).toLocaleDateString()
              const to = new Date(ans.value.to).toLocaleDateString()
              html += `
                <div class="answer date-value">
                  ${from} to ${to}
                </div>`
            } else {
              html += `
                <div class="answer">${ans.value || 'No answer'}</div>`
            }
          })
        } else {
          html += `<div class="answer no-answer">No answer provided</div>`
        }

        html += `</div>` // Close sub-question
      })

      html += `</div>` // Close question
    })
  })

  html += `</body></html>`
  return html
}

export async function generateDocxFromSections(sections: any[], outputPath: string) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: 'Submission Preview', heading: HeadingLevel.HEADING_1 }),
          ...sections.flatMap((section, i) => [
            new Paragraph({
              text: `Section ${i + 1}: ${section.title}`,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.questions.flatMap((q: any, qIdx: number) => [
              new Paragraph({
                text: `Q${qIdx + 1}: ${q.question}`,
                heading: HeadingLevel.HEADING_3,
              }),
              ...(q.ans?.length
                ? q.ans.map((a: any) => new Paragraph({ text: a.value }))
                : [new Paragraph('No answer')]),
              ...(q.subQuestions || []).flatMap((subQ: any, subIdx: number) => [
                new Paragraph({ text: `SubQ${subIdx + 1}: ${subQ.question}` }),
                ...(subQ.ans?.length
                  ? subQ.ans.map((a: any) => new Paragraph({ text: a.value }))
                  : [new Paragraph('No answer')]),
              ]),
            ]),
          ]),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outputPath, buffer)
}
