export interface ISubmission extends Document {
  _id: string;
  status: string;
  submitted: boolean;
  subplan: string;
  pdfLink?: string;
  submissionDate?: Date;
  userId: string;
}
