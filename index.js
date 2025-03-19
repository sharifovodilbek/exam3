const express = require("express");
const { db, connectDb } = require("./config/db");
const User = require("./routes/user");
const Product = require("./routes/product");
const Category = require("./routes/category");
const Order = require("./routes/order");
const orderItem = require("./routes/orderItem");

const app = express();
app.use(express.json());
app.use("/api/users", User);
<<<<<<< HEAD
// app.use("/api/products", Product);
// app.use("/api/categories", Category);
// app.use("/api/orders", Order);
// app.use("/api/orderItems", orderItems);
=======
app.use("/api/products", Product);
app.use("/api/categories", Category);
app.use("/api/orders", Order);
app.use("/api/orderItems", orderItem);
>>>>>>> 3385de3f4ffd9fe2ae8ed23ee3cf06a77da536ea

connectDb();
app.listen(3000, () => console.log("server started on port 3000"));
