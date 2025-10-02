_VibeCoded with Gemini 2.5 Pro_

# Google Calendar Meeting Cost Calculator

A lightweight Chrome extension that automatically calculates and displays the estimated cost of your Google Calendar meetings, helping you and your team be more mindful of time and resources.

The cost is displayed directly within the event details on both the "View" and "Creation" cards.

## Installation

Since this is a custom tool, it needs to be loaded into Chrome manually. Follow these simple steps to install it.

**1. Download the Code**

* Click the green `<> Code` button on the main page of this GitHub repository.
* Select **Download ZIP**.
* Unzip the downloaded folder on your computer. Remember where you saved it.

**2. Open Chrome Extensions**

* Open Google Chrome.
* Click the three-dots menu icon in the top-right corner.
* Go to **Extensions** > **Manage Extensions**.
* Alternatively, you can copy and paste this URL into your address bar: `chrome://extensions`

**3. Enable Developer Mode**

* In the top-right corner of the Extensions page, find the **Developer mode** toggle and switch it **on**. This will make a new menu appear.

**4. Load the Extension**

* Click the **Load unpacked** button that appeared on the left.
* A file selection window will open. Navigate to the folder you unzipped in Step 1.
* Select the entire folder (the one containing `manifest.json` and `content.js`) and click **Select Folder**.

**5. Done!**

* The "Calendar Meeting Cost" extension will now appear in your list of extensions. Make sure the toggle switch on the card is enabled.
* The extension is now active!

## How to Use

Simply navigate to your [Google Calendar](https://calendar.google.com).

* **View an Event:** Click on any existing event. The estimated cost will appear in the event details.
* **Create an Event:** As you create a new event and add a time and guests, the estimated cost will appear and update automatically.

You can customize the cost per hour by editing the `costPerHour` variable in the `content.js` file. If you make changes, be sure to reload the extension from the `chrome://extensions` page.