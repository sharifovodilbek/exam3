const Category = require("./category");
const Comment = require("./category");
const Order = require("./order");
const OrderItem = require("./orderItem");
const Product = require("./product");
const Region = require("./region");
const User = require("./user");

// ? regionga user qo'shildi
Region.hasMany(User, { foreignKey: "regionId" });
User.belongsTo(Region, { foreignKey: "regionId" });

// ? userga order qo'shildi
Order.hasMany(User, { foreignKey: "userId" });
User.belongsTo(Order, { foreignKey: "userId" });

// ? order va orderItem ulandi
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// ? comment va user ulandi
Comment.hasMany(User, { foreignKey: "userId" });
User.belongsTo(Comment, { foreignKey: "userId" });

// ? user va product ulandi
User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

// ? comment va product ulandi
Comment.hasMany(Product, { foreignKey: "productId" });
Product.belongsTo(Comment, { foreignKey: "productId" });

// ? product va category ulandi
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

// ? orderitem va product ulandi
OrderItem.hasMany(Product, { foreignKey: "productId" });
Product.belongsTo(OrderItem, { foreignKey: "productId" });

module.exports = { Category, Comment, Order, OrderItem, Product, Region, User };
