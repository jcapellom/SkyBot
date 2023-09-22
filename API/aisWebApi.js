const aisWebApiKey = '2074992786';
const aisWebApiPass = 'a3826292-ef6d-11ec-83ee-0050569ac2e1';
const baseUrlMensagens = `https://api.decea.mil.br/aisweb/?apiKey=${aisWebApiKey}&apiPass=${aisWebApiPass}&area=`;
const util = require('../util');
const axios = require('axios');
const xml2json  = require('../node_modules/xml-js/lib/xml2json');

module.exports = {

    aisWebApiKey,
    aisWebApiPass,
    getSol,
    getNotam

};

function getSol(requestedLocations) {
    let area = 'sol';
    let response;
    let data_ini;
    let data_fim;
    let returnMessage;
    return new Promise((resolve) => {
        let requestUrl = `${baseUrlMensagens}${area}&icaoCode=${requestedLocations}`;
        console.log(requestUrl);
        axios.get(requestUrl).then(res => {
            response = xml2json(res.data, { spaces: 2, compact: true });    
            console.log(response);
            resolve(JSON.parse(response));
        }).catch(err => console.log(err));
    });
}

function getNotam(requestedLocations) {
    let area = 'notam';
    let response;
    return new Promise((resolve) => {
        let requestUrl = `${baseUrlMensagens}${area}&icaoCode=${requestedLocations}`;
        console.log(requestUrl);
        axios.get(requestUrl).then(res => {
            response = xml2json(res.data, { spaces: 2, compact: true });
            console.log(response);
            resolve(JSON.parse(response));
        }).catch(err => console.log(err));
    });
}