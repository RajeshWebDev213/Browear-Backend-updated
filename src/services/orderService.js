import transporter from "../config/mail.js";

const sendOrderEmail = async (
    email,
    subject,
    title,
    message
) => {

    try {

        await transporter.sendMail({

            from: `"Browear" <${process.env.EMAIL_USER}>`,

            to: email,

            subject,

            html: `
            <div style="font-family:Arial,sans-serif;padding:20px">

                <h2 style="color:#111827;">
                    ${title}
                </h2>

                <p>${message}</p>

                <hr>

                <p>
                    Thank you for shopping with
                    <strong>Browear</strong>.
                </p>

            </div>
            `

        });

        return true;

    } catch (error) {

        console.log(error);

        return false;

    }

};

export default sendOrderEmail;