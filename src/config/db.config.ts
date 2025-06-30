import mongoose from 'mongoose';
import {CONFIG} from './env.config'
import seedUsers from '../scripts/seedData';
import { seedSubmissionPlans } from '../seeds/plan.seed';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(CONFIG.DB.MONGO_URL);
    // seedUsers()
    // seedSubmissionPlans()
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
