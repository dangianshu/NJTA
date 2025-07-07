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

export function injectFileAnswersToSections(sections: any[], fileMapByQuestion: Record<string, any>, filesByName: Record<string, any>) {
  for (const section of sections) {
    for (const question of section.questions || []) {
      // Main question (qtype: file)
      if (question.qtype === 'file' && fileMapByQuestion[question._id]) {
        const fileMeta = fileMapByQuestion[question._id];
        const file = filesByName[fileMeta.file_name];
        if (file) {
          // Store file URL in ans array
          question.ans = [{
            type: 1, // or use appropriate type
            value: `/uploads/${file.filename}`,
            no: 1
          }];
        }
      }
      // SubQuestions
      for (const subQ of question.subQuestions || []) {
        if (subQ.qtype === 'file' && fileMapByQuestion[subQ._id]) {
          const fileMeta = fileMapByQuestion[subQ._id];
          const file = filesByName[fileMeta.file_name];
          if (file) {
            subQ.ans = [{
              type: 1,
              value: `/uploads/${file.filename}`,
              no: 1
            }];
          }
        }
      }
    }
  }
}
