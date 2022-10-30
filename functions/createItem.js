const formattedReturn = require('./formattedReturn')
require('dotenv').config();
var Airtable = require('airtable');
var table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event, context, cb) => {
    const fields = JSON.parse(event.body);

    try {
        const createdItem = await table('items').create([{ fields }]);
        return formattedReturn(200, createdItem);
    } catch (err) {
        console.error(err);
        return formattedReturn(500, {});
    }
};