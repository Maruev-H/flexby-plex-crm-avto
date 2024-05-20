require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware для обработки JSON тел запросов
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    console.log('Received webhook:', JSON.stringify(req.body, null, 2)); // Логируем входящий запрос

    const { event, site, data } = req.body;

    if (event === 'lead') {
        const leadData = {
            type: 'callback',
            values: {
                clientName: data.client.name,
                clientPhone: data.client.phone,
                comment: `Lead from ${site.name} (${site.domain}) - Form: ${data.form_name}`
            },
            source: {
                dealerId: process.env.DEALER_ID,
                websiteHost: process.env.WEBSITE_HOST,
            },
        };

        try {
            console.log('Sending to Plex-CRM:', JSON.stringify(leadData, null, 2)); // Логируем отправляемые данные

            const response = await axios.post('https://plex-crm.ru/api/v3/contact/form', leadData, {
                headers: {
                    'Authorization': `Bearer ${process.env.PLEX_CRM_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response from Plex-CRM:', response.data); // Логируем ответ

            if (response.status === 200) {
                res.status(200).send('OK');
            } else {
                res.status(response.status).send(response.statusText);
            }
        } catch (error) {
            console.error('Error sending lead to Plex-CRM:', error.response ? error.response.data : error.message);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(400).send('Unsupported event type');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
