import cloudinary from "../config/cloudnary.js";

const uploadImage = async (fileBuffer) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                folder: "browear/products",
            },

            (error, result) => {

                if (error) {
                    return reject(error);
                }

                resolve(result);

            }

        );

        stream.end(fileBuffer);

    });

};

export default uploadImage;