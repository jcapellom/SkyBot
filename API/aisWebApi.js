const aisWebApiKey = '2074992786';
const aisWebApiPass = 'a3826292-ef6d-11ec-83ee-0050569ac2e1';
const baseUrlMensagens = `https://api.decea.mil.br/aisweb/?apiKey=${aisWebApiKey}&apiPass=${aisWebApiPass}&area=`;
const util = require('../util');
const axios = require('axios');
const xml2json  = require('xml-js');

module.exports = {

    aisWebApiKey,
    aisWebApiPass,
    getSol

};

function getSol(requestedLocations, finalMessage) {
    let area = 'sol';
    let response;
    let data_ini;
    let data_fim;
    return new Promise((resolve) => {
        let requestUrl = `${baseUrlMensagens}${area}&icaoCode=${requestedLocations}`;
        console.log(requestUrl);
        axios.get(requestUrl).then(res => {
            response = xml2json(res, { spaces: 2, compact: true });
            console.log(response);
            let returnedMessages = [];
            let foundLocations = [];
            if (response == 0) {
                finalMessage += `Não há aviso de aeródromo válido para nenhuma localidade requisitada.\n\n`;
                resolve(finalMessage);
            }
            else
                response.forEach((item) => {
                    returnedMessages.push({ location: item.id_localidade, initial: item.validade_inicial, final: item.validade_final, msg: item.mens, received: item.recebimento });
                    foundLocations.push(item.id_localidade);
                });
            let notFoundLocations = util.arrayDifference(requestedLocations, foundLocations);
            returnedMessages.forEach(item => finalMessage += (item.msg + '\n\n'));
            if (notFoundLocations != 0) finalMessage += `Não há aviso de aeródromo válido para ${notFoundLocations}\n\n`;
            resolve(finalMessage);
        });
    });
}