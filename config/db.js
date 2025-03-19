const { Sequelize } = require("sequelize");

// const db = new Sequelize("n17", "root", "Odil5060", {
//   host: "localhost",
//   dialect: "mysql",
// });

<<<<<<< HEAD
const db = new Sequelize("fen", "root", "billybutcher1", {
=======
const db = new Sequelize("n17", "root", "1234", {
>>>>>>> 3385de3f4ffd9fe2ae8ed23ee3cf06a77da536ea
  host: "localhost",
  dialect: "mysql",
});

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
