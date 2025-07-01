import {seedUsers} from '../seeds/users.seed';
import { seedSubmissionPlans } from '../seeds/plan.seed';
import { seedSections } from '../seeds/section.seed';
import { seedQuestions } from '../seeds/question.seed';

export async function runAllSeeds() {
  await seedUsers();
  await seedSubmissionPlans();
  await seedSections();
  await seedQuestions();
  console.log('✅ All seeds executed successfully!');
}

if (require.main === module) {
  runAllSeeds().catch((err) => {
    console.error('❌ Error running seeds:', err);
    process.exit(1);
  });
}