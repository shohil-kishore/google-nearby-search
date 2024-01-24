const axios = require("axios");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const apiKey = "YOUR-API-KEY"; // Replace with your Google API key
const csvWriter = createCsvWriter({
  path: "places_data.csv",
  header: [
    { id: "name", title: "Name" },
    { id: "address", title: "Address" },
    { id: "price_level", title: "Price Level" },
    { id: "rating", title: "Rating" },
    { id: "types", title: "Types" },
    { id: "loc", title: "Location" },
  ],
});

const locations = [
  "-36.9202206,174.7837058", // Onehunga
  "-36.883600,174.901000", // Half Moon Bay
  // Add more locations as needed
];

// Fetches results from a specific location - pagination when required
async function fetchPlaces(location, nextPageToken = null) {
  // Radius (1600) and keyword (food) should be adjusted accordingly
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=1600&keyword=food&key=${apiKey}&pagetoken=${
    nextPageToken || ""
  }`;

  try {
    const response = await axios.get(url);
    const places = response.data.results.map((place) => ({
      name: place.name,
      address: place.vicinity,
      price_level: place.price_level,
      rating: place.rating,
      types: place.types,
      loc: location,
    }));

    const nextToken = response.data.next_page_token;
    console.log(nextToken);
    return { places, nextToken };
  } catch (error) {
    console.error(
      `Error fetching data for location ${location}: ${error.message}`
    );
    return { places: [], nextToken: null };
  }
}

// Creates request for each location and saves to a CSV
async function makeRequestsAndSaveToCSV(locations) {
  let allPlaces = [];

  for (const location of locations) {
    let nextPageToken = null;

    do {
      const { places, nextToken } = await fetchPlaces(location, nextPageToken);
      allPlaces = allPlaces.concat(places);
      nextPageToken = nextToken;

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delayed to allow next tokens to become valid
    } while (nextPageToken);
  }

  try {
    await csvWriter.writeRecords(allPlaces);
    console.log("Data saved to places_data.csv");
  } catch (error) {
    console.error(`Error writing data to CSV: ${error.message}`);
  }
}

makeRequestsAndSaveToCSV(locations);
