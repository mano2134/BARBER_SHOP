const multer = require("multer");
const imagekit = require("../config/imagekit");
const Portfolio = require("../models/portfolio.model");

// Multer memory storage config
const storage = multer.memoryStorage();
const upload = multer({ storage });

const addPortfolio = async (req, res) => {
    try {
        const { title, customerName } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        if (!req.files || !req.files.before || !req.files.after) {
            return res.status(400).json({ message: "Both 'before' and 'after' images are required." });
        }

        // Upload Before Image
        const beforeUpload = await imagekit.upload({
            file: req.files.before[0].buffer,
            fileName: `before_${Date.now()}_${req.files.before[0].originalname.replace(/\s+/g, '_')}`,
            folder: "/portfolio"
        });

        // Upload After Image
        const afterUpload = await imagekit.upload({
            file: req.files.after[0].buffer,
            fileName: `after_${Date.now()}_${req.files.after[0].originalname.replace(/\s+/g, '_')}`,
            folder: "/portfolio"
        });

        const newPortfolio = await Portfolio.create({
            title,
            customerName: customerName || "",
            beforeImageUrl: beforeUpload.url,
            afterImageUrl: afterUpload.url,
            fileIdBefore: beforeUpload.fileId,
            fileIdAfter: afterUpload.fileId
        });

        res.status(201).json({ message: "Portfolio look added successfully", portfolio: newPortfolio });
    } catch (error) {
        console.error("Error adding portfolio:", error);
        res.status(500).json({ message: "Server error while adding portfolio." });
    }
};

const getPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.find().sort({ createdAt: -1 });
        res.status(200).json({ portfolios, success: true });
    } catch (error) {
        console.error("Error fetching portfolios:", error);
        res.status(500).json({ message: "Server error fetching portfolios.", success: false });
    }
};

const deletePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        const portfolio = await Portfolio.findById(id);
        
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found", success: false });
        }

        // Delete from imagekit
        try {
            await imagekit.deleteFile(portfolio.fileIdBefore);
            await imagekit.deleteFile(portfolio.fileIdAfter);
        } catch (imgError) {
            console.error("Failed to delete images from ImageKit, proceeding to delete document:", imgError);
        }

        await Portfolio.findByIdAndDelete(id);

        res.status(200).json({ message: "Portfolio deleted successfully", success: true });
    } catch (error) {
        console.error("Error deleting portfolio:", error);
        res.status(500).json({ message: "Server error deleting portfolio.", success: false });
    }
}

module.exports = {
    addPortfolio,
    getPortfolios,
    deletePortfolio,
    upload
};
