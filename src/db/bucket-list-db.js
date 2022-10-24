import mock from '../mock';
const bucketListDB = {
	items: [
		{
			"uuid": "6c6250f2-7160-439d-839e-b4e068a4d9f3",
			"description": "Hike Machu Picchu",
			"done": false,
			"do_before": 32
		},
		{
			"uuid": "54f4d47c-c656-49ed-9c32-0de7514cc39c",
			"description": "Visit antartica",
			"done": true,
			"do_before": 38
		},
		{
			"uuid": "48014eb1-6711-4127-8755-d2eaceeca80d",
			"description": "Write a novel",
			"done": false,
			"do_before": 50
		},
		{
			"uuid": "38067cb5-4502-4e74-92f0-3938e6205844",
			"description": "Visit all 7 continents",
			"done": false,
			"do_before": 50
		},
		{
			"uuid": "dc555f4c-add6-4d90-baad-0acec548a8c5",
			"description": "Go on a USA road trip",
			"done": false,
			"do_before": 26
		},
		{
			"uuid": "5cc4cede-60e9-4a71-b215-6b80f5a2f01a",
			"description": "Live in New York City",
			"done": false,
			"do_before": 25
		},
		{
			"uuid": "3e9d10ee-31b7-4936-8ce9-dcc16b32edb6",
			"description": "Go on a safari",
			"done": false,
			"do_before": 50
		},
		{
			"uuid": "0fb0e524-9473-4b9e-993c-7b890ea01406",
			"description": "Make pasta in italy",
			"done": false,
			"do_before": 32
		},
		{
			"uuid": "f2898dda-88bd-4bfc-9824-57cac12809b5",
			"description": "Become fluent in Spanish",
			"done": true,
			"do_before": 65
		},
		{
			"uuid": "8c31b2c9-9580-4a2e-a1e9-fd5ce1aeca78",
			"description": "Testing",
			"done": false,
			"do_before": 30
		}	], 
};

mock.onGet('/api/bucket-list-app/iems').reply(() => {
	let response = [];
	response = bucketListDB.items	
	return [200,
	response];
});
mock.onPost('/api/item-app/update-item').reply(request => {
	const item = JSON.parse(request.data);
	bucketListDB.items = bucketListDB.items.map(_item => {
		if (_item.id === item.id) {
			return item;
		}
		
		return _item;
	});
	return [200,
	item];
});
mock.onPost('/api/item-app/new-item').reply(request => {
	const item = JSON.parse(request.data);
	bucketListDB.items = [item, ...bucketListDB.items];
	return [200,
	item];
});
mock.onPost('/api/item-app/remove-item').reply(request => {
	const itemId = request.data;
	bucketListDB.items = bucketListDB.items.map(_item => {
		if (_item.id === itemId) {
			_item.deleted = true;
		}
		
		return _item;
	});
	return [200,
	itemId];
});