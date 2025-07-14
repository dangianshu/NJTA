import multer from 'multer'
import path from 'path'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads')
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  },
})

export const upload = multer({ storage })



function deleteOldFileIfExists(filePath: string) {
  if (!filePath) return

  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath
  const fullPath = path.join(__dirname, '../../public', relativePath)

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}

export function injectFileAnswersToSections(
  sections: any[],
  fileMapByQuestion: Record<string, any>,
  filesByName: Record<string, any>
) {
  for (const section of sections) {
    for (const question of section.questions || []) {
      const qId = question._id.toString()

      if (question.qtype === 'file') {
        const fileMeta = fileMapByQuestion[qId]
        const file = fileMeta && filesByName[fileMeta.file_name]

        if (file) {
          // ✅ Unlink old file if it exists in the current answer
          const oldFilePath = question.ans?.[0]?.value
          if (oldFilePath) deleteOldFileIfExists(oldFilePath)

          // ✅ Inject new file answer
          question.ans = [
            {
              type: 1,
              value: `/uploads/${file.filename}`,
              no: 1,
            },
          ]
        }
      }

      for (const subQ of question.subQuestions || []) {
        const subQId = subQ._id.toString()
        if (subQ.qtype === 'file') {
          const fileMeta = fileMapByQuestion[subQId]
          const file = fileMeta && filesByName[fileMeta.file_name]

          if (file) {
            // ✅ Unlink old file in sub-question if it exists
            const oldSubFilePath = subQ.ans?.[0]?.value
            if (oldSubFilePath) deleteOldFileIfExists(oldSubFilePath)

            // ✅ Inject new sub-question file answer
            subQ.ans = [
              {
                type: 1,
                value: `/uploads/${file.filename}`,
                no: 1,
              },
            ]
          }
        }
      }
    }
  }
}
