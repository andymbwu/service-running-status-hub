#!/usr/bin/env node
const request = require('request');

request({
    method: 'POST',
    url: 'http://status-qa.dev.pason.com:3000/report',
    body: JSON.stringify({
        id: '0dab5cd7-943e-4e61-9c9d-dbeea3f120f7',
        health: {
            status: 'ok'
        }
    }),
    headers: {
        'Content-Type': 'application/json'
    }
}, (error, resp, body) => {
    console.log(error, body);
});
