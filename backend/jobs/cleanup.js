import cron from "node-cron";
import { configDotenv } from "dotenv";
import userModel from "../models/userModel.js";
configDotenv();

cron.schedule("*/10 * * * *", async () => {
  try {
    const now = new Date();

    //! Delete Unverified Users
    const deleteUnverifiedUsers = await userModel.deleteMany({
      verificationTokenExpires: { $lt: now },
    });

    if (deleteUnverifiedUsers.deletedCount > 0) {
      console.log(
        `Deleted ${deleteUnverifiedUsers.deletedCount} unverified users.`,
      );
    } else {
      console.log("No unverified users to delete.");
    }

    //! Update Unverified Change Email Requests
    const updateUnverifiedChangeEmails = await userModel.updateMany(
      { newEmailExpires: { $lt: now } },
      { $unset: { newEmail: 1, newEmailExpires: 1, newEmailToken: 1 } },
    );

    if (updateUnverifiedChangeEmails.modifiedCount > 0) {
      console.log(
        `Updated ${updateUnverifiedChangeEmails.modifiedCount} uncompleted change email requests.`,
      );
    } else {
      console.log("No uncompleted change email requests to update.");
    }

    //! Update Unverified Change Pwd Requests
    const updateUnverifiedChangePwds = await userModel.updateMany(
      { forgetPasswordExpires: { $lt: now } },
      { $unset: { forgetPasswordExpires: 1, forgetPasswordToken: 1 } },
    );

    if (updateUnverifiedChangePwds.modifiedCount > 0) {
      console.log(
        `Updated ${updateUnverifiedChangePwds.modifiedCount} uncompleted change password requests.`,
      );
    } else {
      console.log("No uncompleted change password requests to update.");
    }
  } catch (error) {
    console.error("Error in Cleanup Job:", error);
  }
});
