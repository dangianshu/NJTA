import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

export const upload = multer({ storage });

export function injectFileAnswersToSections(
  sections: any[],
  fileMapByQuestion: Record<string, any>,
  filesByName: Record<string, any>
) {
  for (const section of sections) {
    for (const question of section.questions || []) {
      const qId = question._id.toString();

      if (question.qtype === 'file') {
        const fileMeta = fileMapByQuestion[qId];
        const file = fileMeta && filesByName[fileMeta.file_name];
        if (file) {
          question.ans = [{
            type: 1,
            value: `/uploads/${file.filename}`,
            no: 1,
          }];
        }
      }

      for (const subQ of question.subQuestions || []) {
        const subQId = subQ._id.toString();
        if (subQ.qtype === 'file') {
          const fileMeta = fileMapByQuestion[subQId];
          const file = fileMeta && filesByName[fileMeta.file_name];
          if (file) {
            subQ.ans = [{
              type: 1,
              value: `/uploads/${file.filename}`,
              no: 1,
            }];
          } 
        }
      }
    }
  }
}

