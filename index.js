const express = require("express");
const { db, connectDb } = require("./config/db");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const User = require("./routes/user");
const Region = require("./routes/region");
const Comment = require("./routes/comment");
const logger = require("./middleware/logger")
const Product = require("./routes/product");
const Category = require("./routes/category");
const Order = require("./routes/order");
const orderItem = require("./routes/orderItem");

const app = express();
app.use(logger)
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
          url: "http://localhost:3000",
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

app.use("/api/users", User);
app.use("/api/regions", Region);
app.use("/api/comments", Comment);
app.use("/api/products", Product);
app.use("/api/categories", Category);
app.use("/api/orders", Order);
app.use("/api/orderItems", orderItem);

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

connectDb();
app.listen(3000, () => console.log("server started on port 3000"));
