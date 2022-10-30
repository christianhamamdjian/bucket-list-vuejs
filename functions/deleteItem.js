const formattedReturn = require('./formattedReturn')
require('dotenv').config()
const Airtable = require('airtable')
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID)
    .table(process.env.AIRTABLE_TABLE_NAME)

exports.handler = async (event, context, cb) => {
    const { id } = event.queryStringParameters
    if (id) {
        try {
            const deletedItem = await airtable.destroy(id)
            return formattedReturn(200, deletedItem);
        } catch (err) {
            console.error(err);
            return formattedReturn(500, {});
        }
    }
}
