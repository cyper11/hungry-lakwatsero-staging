const bcrypt = require('bcryptjs');

const hash = '$2b$10$rBrEyBBkj5nLJKjfvmIYsuvXR5IYkNQJRl9ZE/HISQ1pG0tJhM3aS';

async function test() {
  console.log('Testing Admin@123!:');
  console.log(await bcrypt.compare('Admin@123!', hash));
  
  console.log('Testing Admin@123:');
  console.log(await bcrypt.compare('Admin@123', hash));

  console.log('Testing Admin@123! with generated salt:');
  const salt = await bcrypt.genSalt(10);
  const genHash = await bcrypt.hash('Admin@123!', salt);
  console.log('Generated hash:', genHash);
  console.log(await bcrypt.compare('Admin@123!', genHash));
}

test();
