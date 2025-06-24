import mongoose from 'mongoose';
import {CONFIG} from './env.config'
import seedUsers from '../script/seedData';




export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(CONFIG.DB.MONGO_URL);
    seedUsers()
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
