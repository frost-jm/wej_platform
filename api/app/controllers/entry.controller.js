const Entry = require('../models/entries.model');
const nodemailer = require('nodemailer');
const postmarkTransport = require('nodemailer-postmark-transport');

const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

const summarize = `Maintain the original tone of the feedback. Maximum of 2 sentences only. The two sentences should be short and simple. If it seems unrelated to feedback, just return 'invalid'`;

const action_steps = `
	Suggest how the person can maintain his/her performance or improve it or take it to the next step and suggest steps to go above and beyond.
  Summarize that and list main ideas in 3 points, keep it simple and short, Should be 3 sentences per description and give it to me under 5 seconds.
	Return the output in html format ex: <ul><li></li></ul>
`;

const analyze_entry_type = `
	Here are the entry types, Please determine the entry type based on this criteria, select only one:
	CRAFT: Select if it is more about successful or good technical feedback.
	SUPERVISORIAL: Select if feedback is more about successful or good managing of work/office operations.
	LEADERSHIP: Select if feedback is positive and more about successful or good managing/leading of others.
	INITIATIVE: Select if feedback is positive and more about starting a project/activity that benefits other co-workers or the company.
	FOR IMPROVEMENT: Select if feeback is constructive and is aimed towards improvement of the person's skills.
  YELLOW FLAG: Select if there are mentions of first warning, or a callout to mistake.
	ORANGE FLAG: Select if there were mentions of repeat offense, or if a yellow flag was already made.
	RED FLAG: Select if there were mentions of orange and yellow flags previously and if feedback is negative and the mistake was never corrected.

	Assign also a entryTypeID: 
	For CRAFT assign 1
	For SUPERVISORIAL assign 2
	For LEADERSHIP assign 3
	For INITIATIVE assign 4
	For ABOVE AND BEYOND assign 5
	For FOR IMPROVEMENT assign 6
	For YELLOW FLAG assign 7
	For ORANGE FLAG assign 8
	For RED FLAG, assign 9
`;

const getAnalyzedData = async (text) => {
  let summary = '';
  let startTime = Date.now();
  let gpt_response = {
      summary: "",
      action: "",
      entryType: {
        tagID: -1,
        entryType: ''
      }
  }
  try {
    let chatCompletion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `${summarize} ${text}`,
        },
      ],
      temperature: 0,
      max_tokens: 800,
    });

    console.log("summary: ", chatCompletion.data.choices[0].message.content);
    summary = chatCompletion.data.choices[0].message.content;
    
    gpt_response.summary = summary;

    if(summary.toLocaleLowerCase() != 'invalid') {
      chatCompletion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: summary,
          },
          {
            role: 'user',
            content: `From the summary you've given, ${action_steps} and categorize the feedback ${analyze_entry_type}, return your answer in JSON {actionSteps: 'actionStepsHere', entryType: {entryType: 'EntryTypeAssigned', tagID: 'numberAssigned }}`,
          },
        ],
        temperature: 0,
        max_tokens: 800,
      });
  
      let analyzedData = JSON.parse(chatCompletion.data.choices[0].message.content);
  
      gpt_response.action = analyzedData.actionSteps;
      gpt_response.entryType = analyzedData.entryType;
    }
   
    const endTime = Date.now();
    const responseTimeInSeconds = (endTime - startTime) / 1000;

    console.log(`OpenAI response time: ${responseTimeInSeconds} seconds`);
  } catch (error) {
    throw error;
  }

  return gpt_response;
};

// Create New Entry
exports.create = async (req, res) => {
  try {
    const { entry, revieweeID, revieweeEmail, reviewerName, reviewerID } =
      req.body;

    // Validate required fields
    if (!entry) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    gpt_response = await getAnalyzedData(entry);

    console.log('gpt', gpt_response);

    if (gpt_response && gpt_response.summary.toLocaleLowerCase() == 'invalid') {
      return res.status(400).json({ message: 'Invalid feedback provided' });
    }

    let gpt_obj;

    if (gpt_response) {
      try {
        gpt_obj = gpt_response;
        if (
          gpt_obj.entryType &&
          gpt_obj.entryType.tagID === 0 &&
          gpt_obj.entryType.entryType === 'Invalid'
        ) {
          return res.status(400).json({ message: 'Invalid feedback provided' });
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }

    const newEntry = {
      entry: entry,
      entryTypeID: gpt_obj.entryType.tagID,
      revieweeID: revieweeID,
      summary: gpt_obj.summary,
      createdBy: reviewerID,
      actionableSteps: gpt_obj.action,
    };

    Entry.create(newEntry, async (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: 'Error on creating entry. Please try again.' });
      }

      const link = `${process.env.BASE_URI}/entry/${result.insertId}?revieweeID=${revieweeID}`;

      res.status(201).json({
        message: `Entry created successfully`,
        entryId: result.insertId,
      });

      try {
        await sendEmail(revieweeEmail, reviewerName, entry, link);
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Error sending email:', error);
      }
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error on creating entry. Please try again.' });
  }
};

async function sendEmail(revieweeEmail, reviewerName, entry, link) {
  const transporter = nodemailer.createTransport(
    postmarkTransport({
      auth: {
        apiKey: process.env.POSTMARK_API_KEY,
      },
    })
  );

  const mailOptions = {
    from: process.env.POSTMARK_SENDER,
    to: revieweeEmail,
    subject: 'WEJ - New feedback',
    html: `
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WEJ Entry Feedback</title>
      <style>
        body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        }
        .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .header {
        text-align: center;
        padding-bottom: 20px;
        }
        .header img {
        max-width: 200px;
        height: auto;
        margin: 0 auto;
        }
        .content {
        padding: 20px;
        border-top: 1px solid #ddd;
        color:#000000!important;
        }
        .entry, .href{
        margin-top: 8px;
        }
      </style>
    </head>
    <body>
    <div class="container">
      <div class="header">
        <img src="https://uploads-ssl.webflow.com/63e622de5189785b0de9ce89/64eee44ff1e40d5e9ed4d7fa_frost-icon.jpg" alt="Frost Design and Consulting Group Inc.">
      </div>
      <div class="content">
        <h2>Feedback from : ${reviewerName}</h2>
        <p class="entry">${entry}</p>
        <p class="href">Click <a href="${link}" target="_blank" rel="noopener noreferrer">here</a> to see full feedback.</p>
      </div>
      </div>
    </body>
    </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
}

// Retrieve all entries
exports.findAll = (req, res) => {
  try {
    const { revieweeID, date, entryTypes } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const filteredDate = date || null;
    const filteredEntryTypes = entryTypes ? entryTypes.split(',') : null;

    Entry.getAll(
      revieweeID,
      filteredDate,
      filteredEntryTypes,
      options,
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(result);
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get total entries and by entry type
exports.getTotalCounts = (req, res) => {
  try {
    const { revieweeID, pointsFor } = req.query;

    if (!pointsFor) {
      Entry.getCount(revieweeID, (err, totalCountResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        const totalCount = totalCountResult[0].count;
        res.json({ totalEntries: totalCount });
      });
      return;
    }

    Entry.getCountByPointsFor(revieweeID, (err, pointsForResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const pointsForCounts = pointsForResult.map((result) => ({
        label: result.label,
        count: result.count,
        labelColor: result.labelColor,
        tagColor: result.tagColor,
      }));

      res.json(pointsForCounts);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get entry by ID
exports.findEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await Entry.getById(id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    } else {
      res.json(entry);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update entry by ID
exports.update = async (req, res) => {
  try {
    const { entry } = req.body;
    const entryId = req.params.id;

    const gpt_response = await getAnalyzedData(entry);

    if (gpt_response && gpt_response.summary.toLocaleLowerCase() == 'invalid') {
      return res.status(400).json({ message: 'Invalid feedback provided' });
    }

    let gpt_obj;

    if (gpt_response) {
      gpt_obj = gpt_response;
    }

    const updatedEntry = {
      entry: entry,
      entryTypeID: gpt_obj.entryType.tagID,
      summary: gpt_obj.summary,
      actionableSteps: gpt_obj.action,
    };

    Entry.update(entryId, updatedEntry, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Entry not found' });
      }

      res.json({ message: 'Entry updated successfully' });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error on updating entry. Please try again.' });
  }
};

// Delete entry ( Set 0 to 1 )
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Update the entry's delete column value to 1
    const result = await Entry.update(id, { deleted: 1 });

    if (result === 0) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    return res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
