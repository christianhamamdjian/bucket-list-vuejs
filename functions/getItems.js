const formattedReturn = require('./formattedReturn')
require('dotenv').config()
const Airtable = require('airtable-node')
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID)
  .table(process.env.AIRTABLE_TABLE_NAME)

exports.handler = async (event, context, cb) => {
  const { id } = event.queryStringParameters
  if (id) {
    try {
      const item = await airtable.retrieve(id)
      if (item.error) {
        return formattedReturn(404, `No item with id: ${id}`);
      }
      return formattedReturn(200, item);
    } catch (error) {
      return formattedReturn(500, 'Server Error');
    }
  }
  try {
    const { records } = await airtable.list()
    const items = records.map((item) => {
      const { id } = item
      const { description, do_before, done } = item.fields
      return { id, description, do_before, done }
    })
    return formattedReturn(200, items);
  } catch (error) {
    return formattedReturn(500, 'Server Error');
  }
}
