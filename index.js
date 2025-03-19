const express = require("express");
const { db, connectDb } = require("./config/db");
const User = require("./routes/user");
const Region = require("./routes/region");
const Comment = require("./routes/comment");
const logger = require("./middleware/logger")
// const Product = require("./routes/product");
// const Category = require("./routes/category");
// const Order = require("./routes/order");
// const orderItem = require("./routes/orderItem");

const app = express();
app.use(logger)
app.use(express.json());
app.use("/api/users", User);
app.use("/api/regions", Region);
app.use("/api/comments", Comment);
// app.use("/api/products", Product);
// app.use("/api/categories", Category);
// app.use("/api/orders", Order);
// app.use("/api/orderItems", orderItems);

connectDb();
app.listen(3000, () => console.log("server started on port 3000"));
