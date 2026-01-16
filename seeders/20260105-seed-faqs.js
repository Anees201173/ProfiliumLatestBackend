'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const faqs = [
      // General
      {
        category: 'General',
        question: 'What is ProfiHum?',
        answer: 'ProfiHum is an AI-powered hiring platform that helps companies find, evaluate, and hire the best candidates faster.',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'General',
        question: 'How does AI matching work?',
        answer: 'Our AI analyzes candidate skills, experience, and test results to recommend the most relevant matches for your job postings — saving your team time and effort.',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'General',
        question: 'Is ProfiHum free to use?',
        answer: 'You can start with a free plan and upgrade to a paid subscription for advanced features such as more job slots, team collaboration, and detailed analytics.',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'General',
        question: 'How are candidate profiles verified?',
        answer: 'Profiles are validated through email verification, optional ID checks, and consistency checks across experience, skills, and assessments.',
        order: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'General',
        question: 'Can multiple recruiters use one company account?',
        answer: 'Yes, you can invite multiple team members to your company account and manage roles and permissions from your admin settings.',
        order: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Technical Issues
      {
        category: 'Technical Issues',
        question: 'I cannot log into my account. What should I do?',
        answer: 'First, try resetting your password. If the issue persists, clear your browser cache or try a different browser. You can also contact support using the form below.',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Technical Issues',
        question: 'The platform is slow or not loading properly.',
        answer: 'Check your internet connection and try refreshing the page. If the problem continues, please take a screenshot and contact our support team so we can investigate.',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Technical Issues',
        question: 'I am not receiving verification or notification emails.',
        answer: 'Please check your spam or promotions folder and whitelist our email domain. If you still do not receive emails, contact support to verify your email settings.',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Billing & Payment
      {
        category: 'Billing & Payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit and debit cards. For larger teams or enterprises, we also support invoicing on request.',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Billing & Payment',
        question: 'Can I change or cancel my subscription?',
        answer: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time from the billing settings page. Changes take effect from your next billing cycle.',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Billing & Payment',
        question: 'Will I receive invoices for my payments?',
        answer: 'Invoices are automatically generated for every successful payment and can be downloaded from your billing history.',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Creating a Job
      {
        category: 'Creating a Job',
        question: 'How do I create my first job posting?',
        answer: 'Go to the Jobs section and click on "Create Job". Fill in the role details, requirements, and preferences, then publish when you are ready.',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Creating a Job',
        question: 'Can I duplicate an existing job post?',
        answer: 'Yes, from the job list you can select an existing job and use the duplicate option to quickly create a similar posting.',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Creating a Job',
        question: 'How do I pause or close a job?',
        answer: 'Open the job details page and change the job status to "Paused" to stop receiving new applications, or "Closed" if the role has been filled.',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Finding Candidates
      {
        category: 'Finding Candidates',
        question: 'How can I search for candidates that match my job?',
        answer: 'Use the candidate search or recommended matches section on your job details page. You can filter by experience, skills, location, and more.',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Finding Candidates',
        question: 'What does the match score mean?',
        answer: 'The match score is calculated based on how closely a candidate\'s profile, experience, and assessments align with your job requirements.',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Finding Candidates',
        question: 'Can I save or shortlist promising candidates?',
        answer: 'Yes, you can shortlist candidates from the candidate list or job applications view to review and follow up later.',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Messaging Candidates
      {
        category: 'Messaging Candidates',
        question: 'How do I contact a candidate?',
        answer: 'Open the candidate profile or application and use the built-in messaging feature to start a conversation directly on ProfiHum.',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Messaging Candidates',
        question: 'Can I schedule interviews through the platform?',
        answer: 'Yes, you can coordinate interview times with candidates through messages and record interview details in the application notes.',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        category: 'Messaging Candidates',
        question: 'Why are my candidate messages not delivered?',
        answer: 'If messages appear undelivered, check your internet connection and try again. If the problem persists, contact support with the conversation ID.',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('faqs', faqs);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('faqs', null, {});
  },
};
