import { contactUsEmail } from "../mail/templates/contactFormRes";
import mailSender from "../utils/mailSender";

export const contactUsController = async (req, res) => {
  const { email, firstname, lastname, message, phoneNo, countrycode } =
    req.body;
  console.log(req.body);
  try {
    const emailRes = await mailSender(
      email,
      "Your Data send successfully",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
    );
    return res.json({
      success: true,
      message: "Email send successfully",
      data: emailRes,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Something went wrong...",
      error: error.message,
    });
  }
};
