const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:3000/projects/1/scan');
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
