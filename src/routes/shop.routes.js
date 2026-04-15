const {Router} = require("express");
const { getShopData, getAllServices } = require("../controllers/shop.controller");
const { getPortfolios } = require("../controllers/portfolio.controller");

const shopRouter = Router();

shopRouter.get("/",getShopData);
shopRouter.get("/services", getAllServices);
shopRouter.get("/portfolio", getPortfolios);

module.exports = shopRouter;