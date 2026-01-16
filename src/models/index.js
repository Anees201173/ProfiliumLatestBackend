const { Sequelize } = require("sequelize");
// Explicitly require pg so bundlers (like Vercel) include it in the deployment bundle
// This avoids "Please install pg package manually" when Sequelize dynamically loads the dialect.
// eslint-disable-next-line no-unused-vars
const pg = require("pg");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

let sequelize;
if (dbConfig && dbConfig.use_env_variable) {
  const connectionString = process.env[dbConfig.use_env_variable];
  if (!connectionString) {
    throw new Error(
      `Missing environment variable: ${dbConfig.use_env_variable}`
    );
  }
  if (
    typeof connectionString !== "string" ||
    !connectionString.includes("://")
  ) {
    throw new Error(
      `Invalid DATABASE URL provided in ${dbConfig.use_env_variable}`
    );
  }
  try {
    // Pass pg explicitly as dialectModule so Sequelize doesn't need to require('pg') internally.
    // Also set short timeouts to avoid long hangs in serverless environments when the DB is unreachable.
    sequelize = new Sequelize(connectionString, {
      ...dbConfig,
      dialectModule: pg,
      pool: {
        // max time (ms) to try getting connection from pool before throwing
        acquire: 10000,
        // default pool settings fallback
        max: dbConfig.pool?.max || 5,
        min: dbConfig.pool?.min || 0,
        idle: dbConfig.pool?.idle || 10000,
      },
      dialectOptions: {
        ...(dbConfig.dialectOptions || {}),
        // pg client connection timeout in milliseconds
        connectionTimeoutMillis: 10000,
      },
    });
  } catch (err) {
    const masked =
      connectionString.length > 20
        ? `${connectionString.slice(0, 10)}...${connectionString.slice(-10)}`
        : connectionString;
    console.error(
      "Failed to initialize Sequelize with connection string:",
      //======================== models ========================//
      masked
    );
    throw err;
  }
  //======================== user associations ==================//
} else if (dbConfig) {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      ...dbConfig,
      dialectModule: pg,
      pool: {
        acquire: 10000,
        max: dbConfig.pool?.max || 5,
        min: dbConfig.pool?.min || 0,
        idle: dbConfig.pool?.idle || 10000,
      },
      dialectOptions: {
        ...(dbConfig.dialectOptions || {}),
        connectionTimeoutMillis: 10000,
      },
    }
  );
} else {
  throw new Error(`No database configuration found for environment: ${env}`);
}

const db = {};

//======================== test -> question -> option ==================//
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models here
db.User = require("./User")(sequelize);
db.Candidate = require("./Candidate")(sequelize);
db.Company = require("./Company")(sequelize);
db.PricingPlan = require("./PricingPlan")(sequelize);
db.Faq = require("./Faq")(sequelize);
// Jobs (company posts)
db.Job = require("./Job")(sequelize);
db.JobApplication = require("./JobApplication")(sequelize);
//======================== candidate and answer ==================//

// Skills and experiences
db.Skill = require("./Skill")(sequelize);
db.CandidateSkill = require("./CandidateSkill")(sequelize);
db.CandidateExperience = require("./CandidateExperience")(sequelize);
// Messaging models
db.Conversation = require("./Conversation")(sequelize);
db.ConversationParticipant = require("./ConversationParticipant")(sequelize);
db.Message = require("./Message")(sequelize);

// Define associations
// A User may have a candidate profile or a company profile depending on role
db.User.hasOne(db.Candidate, { foreignKey: "userId", as: "candidateProfile" });
db.Candidate.belongsTo(db.User, { foreignKey: "userId", as: "user" });

db.User.hasOne(db.Company, { foreignKey: "userId", as: "companyProfile" });
db.Company.belongsTo(db.User, { foreignKey: "userId", as: "user" });

// Company -> Jobs
db.Company.hasMany(db.Job, { foreignKey: "companyId", as: "jobs" });
db.Job.belongsTo(db.Company, { foreignKey: "companyId", as: "company" });

// Job applications associations
db.Job.hasMany(db.JobApplication, { foreignKey: "jobId", as: "applications" });
db.JobApplication.belongsTo(db.Job, { foreignKey: "jobId", as: "job" });

db.Candidate.hasMany(db.JobApplication, {
  foreignKey: "candidateId",
  as: "applications",
});
db.JobApplication.belongsTo(db.Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

// Psychometric tests models
db.Test = require("./Test")(sequelize);
db.Question = require("./Question")(sequelize);
db.Option = require("./Option")(sequelize);
db.CandidateTest = require("./CandidateTest")(sequelize);
db.CandidateAnswer = require("./CandidateAnswer")(sequelize);

// Test -> Question -> Option
db.Test.hasMany(db.Question, { foreignKey: "testId", as: "questions" });
db.Question.belongsTo(db.Test, { foreignKey: "testId", as: "test" });

db.Question.hasMany(db.Option, { foreignKey: "questionId", as: "options" });
db.Option.belongsTo(db.Question, { foreignKey: "questionId", as: "question" });

//======================== candidate assignment and answer ==================//

// Candidate assignments and answers
db.Candidate.hasMany(db.CandidateTest, {
  foreignKey: "candidateId",
  as: "candidateTests",
});
db.CandidateTest.belongsTo(db.Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

db.Test.hasMany(db.CandidateTest, { foreignKey: "testId", as: "assignments" });
db.CandidateTest.belongsTo(db.Test, { foreignKey: "testId", as: "test" });

db.CandidateTest.hasMany(db.CandidateAnswer, {
  foreignKey: "candidateTestId",
  as: "answers",
});
db.CandidateAnswer.belongsTo(db.CandidateTest, {
  foreignKey: "candidateTestId",
  as: "candidateTest",
});

db.Question.hasMany(db.CandidateAnswer, {
  foreignKey: "questionId",
  as: "candidateAnswers",
});
db.CandidateAnswer.belongsTo(db.Question, {
  foreignKey: "questionId",
  as: "question",
});

db.Option.hasMany(db.CandidateAnswer, {
  foreignKey: "optionId",
  as: "selectedAnswers",
});
db.CandidateAnswer.belongsTo(db.Option, {
  foreignKey: "optionId",
  as: "option",
});

//======================== candidate skills & experiences ==================//
// Candidate <-> Skill (many-to-many through CandidateSkill)
db.Candidate.belongsToMany(db.Skill, {
  through: db.CandidateSkill,
  as: "skills",
  foreignKey: "candidateId",
  otherKey: "skillId",
});
db.Skill.belongsToMany(db.Candidate, {
  through: db.CandidateSkill,
  as: "candidates",
  foreignKey: "skillId",
  otherKey: "candidateId",
});
// Expose pivot for direct access if needed
db.Candidate.hasMany(db.CandidateSkill, {
  foreignKey: "candidateId",
  as: "candidateSkills",
});
db.CandidateSkill.belongsTo(db.Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});
db.Skill.hasMany(db.CandidateSkill, {
  foreignKey: "skillId",
  as: "skillLinks",
});
db.CandidateSkill.belongsTo(db.Skill, { foreignKey: "skillId", as: "skill" });

// Candidate -> Experiences (one-to-many)
db.Candidate.hasMany(db.CandidateExperience, {
  foreignKey: "candidateId",
  as: "experiences",
});
db.CandidateExperience.belongsTo(db.Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

// Messaging associations
// Conversation <-> Message
db.Conversation.hasMany(db.Message, {
  foreignKey: "conversationId",
  as: "messages",
});
db.Message.belongsTo(db.Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});
// Message sender relation to User
db.Message.belongsTo(db.User, { foreignKey: "senderId", as: "sender" });

// Conversation <-> User through ConversationParticipant
db.Conversation.belongsToMany(db.User, {
  through: db.ConversationParticipant,
  foreignKey: "conversationId",
  otherKey: "userId",
  as: "participants",
});
db.User.belongsToMany(db.Conversation, {
  through: db.ConversationParticipant,
  foreignKey: "userId",
  otherKey: "conversationId",
  as: "conversations",
});

db.Conversation.hasMany(db.ConversationParticipant, {
  foreignKey: "conversationId",
  as: "participantLinks",
});
db.ConversationParticipant.belongsTo(db.Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

db.User.hasMany(db.ConversationParticipant, {
  foreignKey: "userId",
  as: "conversationLinks",
});
db.ConversationParticipant.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = db;
