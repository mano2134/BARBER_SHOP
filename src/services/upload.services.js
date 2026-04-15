const ImageKit = require("@imagekit/nodejs");

const upload = async (file) => {
    try {
        const imagekit = new ImageKit({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        });
        const result = await imagekit.upload({
            file: file,
            fileName: file.originalname,
            folder: "barber-shop"
        }); 
        return result;
    } catch (error) {
        console.log(error);
    }
}