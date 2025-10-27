const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Task = require('./models/Task');
require('dotenv').config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

     await User.deleteMany({});
    await Expense.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

     const adminUser = new User({
      name: 'AMN',
      email: 'anegi@admin.com',
      password: 'Admin1234',  
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

   
    const regularUser = new User({
      name: 'Alice  ',
      email: 'alice@user.com',
      password: 'User1234', 
      role: 'user'
    });
    await regularUser.save();
    console.log('Regular user created');

  
    const adminExpenses = [
      { title: 'Admin Salary', amount: 5000, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: new Date(), description: 'Monthly salary', userId: adminUser._id },
      { title: 'Admin Groceries', amount: 150, type: 'expense', category: 'Food', paymentMethod: 'Card', date: new Date(), description: 'Weekly groceries', userId: adminUser._id },
    ];
    await Expense.insertMany(adminExpenses);
    console.log('Admin expenses created');

     const adminTasks = [
      { title: 'Review Q3 Report', description: 'Analyze financial performance', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'pending', priority: 'high', category: 'Work', userId: adminUser._id },
      { title: 'Plan Team Meeting', description: 'Schedule and prepare agenda', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), status: 'in-progress', priority: 'medium', category: 'Work', userId: adminUser._id },
    ];
    await Task.insertMany(adminTasks);
    console.log('Admin tasks created');

     const userExpenses = [
      { title: 'Freelance Project', amount: 1200, type: 'income', category: 'Freelance', paymentMethod: 'Bank Transfer', date: new Date(), description: 'Payment for web development', userId: regularUser._id },
      { title: 'Coffee', amount: 5, type: 'expense', category: 'Food', paymentMethod: 'Card', date: new Date(), description: 'Morning coffee', userId: regularUser._id },
    ];
    await Expense.insertMany(userExpenses);
    console.log('User expenses created');

     const userTasks = [
      { title: 'Finish Blog Post', description: 'Write about Next.js features', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'pending', priority: 'high', category: 'Personal', userId: regularUser._id },
      { title: 'Go to Gym', description: 'Evening workout session', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), status: 'completed', priority: 'low', category: 'Health', userId: regularUser._id },
    ];
    await Task.insertMany(userTasks);
    console.log('User tasks created');

    console.log('\nSeed done! Demo credentials:');
    console.log(`Admin: ${adminUser.email}  /  Admin1234`);
    console.log(`User : ${regularUser.email}   /  User1234`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();