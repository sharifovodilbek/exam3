const { Sequelize } = require("sequelize");

const db = new Sequelize("kommanda", "root", "Odil5060", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

// const db = new Sequelize("prosta", "root", "1234", {
//   host: "localhost",
//   dialect: "mysql",
//   logging:false
// });

// const db = new Sequelize("fen", "root", "billybutcher1", {
//   host: "localhost",
//   dialect: "mysql",
// });

async function connectDb() {
  try {
    await db.authenticate();
    console.log("db connected");
    // await db.sync({ force: true });
    // console.log("db synced");
  } catch (error) {
    console.log(error);
  }
}
module.exports = { connectDb, db };
