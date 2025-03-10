import cron from "node-cron";
import { Borrow } from "../models/Borrow.model.js";
import { User } from "../models/User.model.js";
import { sendEmail } from "../utils/sendEmail.js";
export const notifyUsers = async () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const borroweers = await Borrow.find({
        dueDate: {
          $lt: oneDayAgo,
        },
        returnDate: null,
        notfied: false,
      });
      for (const element of borroweers) {
        if (element.user && element.user.email) {
          const user = await User.findById(element.user.id);
          if (user) {
            sendEmail({
              to: user.email,
              subject: "Book Return Reminder",
              text: `Hello ${user.name},\n\nThis is a reminder to return the book today that you borrowed from our library.\n\nThank you.`,
            });
            element.notfied = true;
             await element.save();
          }
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  });
};
