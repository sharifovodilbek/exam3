const Category = require("./category");
const Comment = require("./comment"); // ✅
const Order = require("./order");
const OrderItem = require("./orderItem");
const Product = require("./product");
const Region = require("./region");
const User = require("./user");

// ? region va user ulandi
Region.hasMany(User, { foreignKey: "regionId" });
User.belongsTo(Region, { foreignKey: "regionId" });

// ? user va order ulandi
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

// ? order va orderItem ulandi
Order.hasMany(OrderItem, { foreignKey: "orderId" }, { onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// ? user va comment ulandi
User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

// ? user va product ulandi
User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

// ? product va comment ulandi
Product.hasMany(Comment, { foreignKey: "productId" });
Comment.belongsTo(Product, { foreignKey: "productId" });

// ? product va category ulandi
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

// ? orderitem va product ulandi
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

module.exports = { Category, Comment, Order, OrderItem, Product, Region, User };
