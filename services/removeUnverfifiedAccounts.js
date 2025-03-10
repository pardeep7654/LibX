import cron from "node-cron";
import { User } from "../models/User.model.js";

export const removeUnverifiedAccounts = async () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const thirtyMinAgo = new Date(Date.now() -  30 * 60 * 1000);
       
      await User.deleteMany({
        accountVerified: false,
        createdAt: {
          $lt: thirtyMinAgo,
        },
      });
    } catch (error) {
      console.error(error.message);
    }
  });
}