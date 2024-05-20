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
            source: {
                dealerId: process.env.DEALER_ID,
                websiteHost: process.env.WEBSITE_HOST,
            },
            client: {
                ip: req.ip,
                session: data?.session ?? '',
                userAgent: req.headers['user-agent'] ?? '',
            },
            values: {
                clientName: data?.client?.name ?? '',
                clientPhone: data?.client?.phone ?? '',
                comment: `Lead from ${site?.name ?? ''} (${site?.domain ?? ''}) - Form: ${JSON.stringify(data?.form_name) ?? ''}`,
                utmSource: data?.utm?.utm_source ?? '',
                utmMedium: data?.utm?.utm_medium ?? '',
                utmCampaign: data?.utm?.utm_campaign ?? '',
                utmContent: data?.utm?.utm_content ?? '',
                utmTerm: data?.utm?.utm_term ?? '',
                // Add more fields from data as needed, e.g.:
                // clientBirthDate: data?.client?.birthDate ?? '',
                // clientRegion: data?.client?.region ?? '',
                // offerId: data?.offerId ?? '',
                // offerExternalId: data?.offerExternalId ?? '',
                // offerTitle: data?.offerTitle ?? '',
                // offerPrice: data?.offerPrice ?? '',
                // bankTitle: data?.bankTitle ?? '',
                // clientIncome: data?.clientIncome ?? '',
                // creditAmount: data?.creditAmount ?? '',
                // creditInitialFee: data?.creditInitialFee ?? '',
                // creditPeriod: data?.creditPeriod ?? '',
                // clientVehicleMark: data?.clientVehicleMark ?? '',
                // clientVehicleModel: data?.clientVehicleModel ?? '',
                // clientVehicleYear: data?.clientVehicleYear ?? '',
                // clientVehiclePrice: data?.clientVehiclePrice ?? '',
                // clientVehicleRun: data?.clientVehicleRun ?? '',
                // clientVehicleOwners: data?.clientVehicleOwners ?? '',
                // clientVehicleGearbox: data?.clientVehicleGearbox ?? '',
                // clientVehicleOfferUrl: data?.clientVehicleOfferUrl ?? '',
            },
            // Uncomment and populate with additional offer details if needed
            // offer: {
            //     externalId: data?.offer?.externalId ?? '',
            //     title: data?.offer?.title ?? '',
            //     mark: data?.offer?.mark ?? '',
            //     model: data?.offer?.model ?? '',
            //     generation: data?.offer?.generation ?? '',
            //     bodyType: data?.offer?.bodyType ?? '',
            //     modification: data?.offer?.modification ?? '',
            //     complectation: data?.offer?.complectation ?? '',
            //     engineType: data?.offer?.engineType ?? '',
            //     enginePower: data?.offer?.enginePower ?? '',
            //     engineVolume: data?.offer?.engineVolume ?? '',
            //     gearbox: data?.offer?.gearbox ?? '',
            //     wheelDrive: data?.offer?.wheelDrive ?? '',
            //     price: data?.offer?.price ?? '',
            //     year: data?.offer?.year ?? '',
            //     run: data?.offer?.run ?? '',
            //     vin: data?.offer?.vin ?? '',
            //     color: data?.offer?.color ?? '',
            //     owners: data?.offer?.owners ?? '',
            //     seats: data?.offer?.seats ?? '',
            //     imageUrls: data?.offer?.imageUrls ?? [],
            //     category: data?.offer?.category ?? '',
            //     condition: data?.offer?.condition ?? '',
            //     offerType: data?.offer?.offerType ?? '',
            //     url: data?.offer?.url ?? '',
            // },
            tracking: {
                utm_source: data?.utm?.utm_source ?? '',
                utm_medium: data?.utm?.utm_medium ?? '',
                utm_campaign: data?.utm?.utm_campaign ?? '',
                utm_content: data?.utm?.utm_content ?? '',
                utm_term: data?.utm?.utm_term ?? '',
                gclid: data?.utm?.gclid ?? '',
                yclid: data?.utm?.yclid ?? '',
                fbclid: data?.utm?.fbclid ?? '',
                rb_clickid: data?.utm?.rb_clickid ?? '',
                ym_goal: data?.utm?.ym_goal ?? '',
            }
        };

        try {
            console.log('Sending to Plex-CRM:', JSON.stringify(leadData, null, 2)); // Логируем отправляемые данные

            const response = await axios.post('https://plex-crm.ru/api/v3/contact/form', leadData, {
                headers: {
                    'Authorization': `Bearer ${process.env.PLEX_CRM_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response from Plex-CRM:', JSON.stringify(response.data, null, 2)); // Логируем ответ

            res.status(response.status).send(response.data);
        } catch (error) {
            console.error('Error sending lead to Plex-CRM:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(400).send('Unsupported event type');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
