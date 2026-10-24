const axios = require("axios");

const client = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137 Safari/537.36"
  }
});

async function get(url, config = {}) {

  try {

    const response =
      await client.get(url, config);

    return response.data;

  } catch (error) {

    console.log("URL:", url);

    console.log(
      "STATUS:",
      error.response?.status
    );

    console.log(
      "MESSAGE:",
      error.message
    );

    throw error;

  }

}

module.exports = {
  get
};