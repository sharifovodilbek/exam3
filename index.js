const express = require("express");
const { db, connectDb } = require("./config/db");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const User = require("./routes/user.routes");
const Region = require("./routes/region.routes");
const Comment = require("./routes/comment.routes");
const uploads = require("./routes/uploads.routes");
const logger = require("./middleware/logger");
const Product = require("./routes/product.routes");
const Category = require("./routes/category.routes");
const Order = require("./routes/order.routes");
const orderItem = require("./routes/orderItem.routes");
const path = require("path");


const app = express();
app.use(logger);
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRUD API",
      version: "1.0.0",
      description: "API documentation for CRUD operations",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

app.use("/api/", User);
app.use("/api/", Region);
app.use("/api/", Comment);
app.use("/api/", Product);
app.use("/api/", Category);
app.use("/api/", Order);
app.use("/api/", orderItem);
app.use("/api/", uploads);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

connectDb();
app.listen(3000, () => console.log("server started on port 3000"));


//userId jwt dan olinsin
//ordersda productId va count arrayda beriladi
//user get qilishda role admin sorashi kerak
//swagger data korinishida mas