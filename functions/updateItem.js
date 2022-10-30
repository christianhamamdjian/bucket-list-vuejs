const formattedReturn = require('./formattedReturn')
require('dotenv').config();
var Airtable = require('airtable');
var airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event, context, cb) => {
    const { id } = event.queryStringParameters
    const { fields } = JSON.parse(event.body);
    console.log(fields)
    try {
        const updatedItem = await airtable('items').update([{ id, fields }]);
        return formattedReturn(200, updatedItem);
    } catch (err) {
        console.error(err);
        return formattedReturn(500, {});
    }
};
