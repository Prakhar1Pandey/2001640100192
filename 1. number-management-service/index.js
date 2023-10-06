const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8008;

app.get('/', (req, res)=>{
    res.send("Server is running");
})

app.use('/numbers', async (req, res) => {
    const urls = req.query.url;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'Invalid URL parameter' });
    }

    const responses = [];
    const promises = urls.map(url => {
        return axios.get(url)
            .then(response => response.data.numbers)
            .catch(error => {
                console.error(`Error fetching data from ${url}: ${error.message}`);
                return [];
            });
    });

    try {
        const numbersArrays = await Promise.allSettled(promises);

        numbersArrays.forEach(result => {
            if (result.status === 'fulfilled') {
                responses.push(...result.value);
            }
        });

        const uniqueNumbers = Array.from(new Set(responses));
        uniqueNumbers.sort((a, b) => a - b);

        res.json({ numbers: uniqueNumbers });
    } catch (error) {
        console.error(`Error processing data: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Number Management Service is running on port ${PORT}`);
});
