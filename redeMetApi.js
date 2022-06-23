const redeMetApiKey = 'OM55qUBbwLma4RYXBf1QDYRPkIEyQD99KJ6fs94L';
const baseUrl = 'https://api-redemet.decea.mil.br/mensagens/';
const util = require('./util');
const axios = require('axios');

module.exports = {

    redeMetApiKey,

    baseUrl,

    getMetarOrTaf,

    sigmet: function (pais, data_ini, data_fim, page_tam) {
        let endpoint = 'sigmet/';
        return `${baseUrl}${endpoint}?api_key=${redeMetApiKey}&data_ini=${data_ini}&data_fim=${data_fim}&page_tam=${page_tam}&pais=${pais}`;
    },

    taf: function (localidades, data_ini, data_fim, page_tam, quebra_linha) {
        let endpoint = 'taf/';
        return `${baseUrl}${endpoint}${localidades}?api_key=${redeMetApiKey}&data_ini=${data_ini}&data_fim=${data_fim}&page_tam=${page_tam}&fim_linha=${quebra_linha}`;
    },

    sigwx: function () {
        let endpoint = 'sigwx/';
        return `${baseUrl}${endpoint}?api_key=${redeMetApiKey}`;
    }

};

function getMetarOrTaf(metarOrTaf, requestedLocations, finalMessage) {
    let endpoint = metarOrTaf + '/';
    let response
    let data_ini
    let data_fim
    let page_tam
    return new Promise((resolve) => {
        let requestURL = `${baseUrl}${endpoint}${requestedLocations}?api_key=${redeMetApiKey}`;
        axios.get(requestURL).then(res => {
            response = res.data !== undefined ? res.data.data !== undefined ? res.data.data.data : 0 : 0;
            let returnedMessages = [];
            let foundLocations = [];
            if (response == 0) {
                finalMessage = `Não há ${metarOrTaf.toUpperCase()} disponível para nenhuma localidade requisitada.`;
                resolve(finalMessage)
            }
            else
                response.forEach((item) => {
                    returnedMessages.push({ location: item.id_localidade, initial: item.validade_inicial, final: item.validade_final, msg: item.mens, received: item.recebimento })
                    foundLocations.push(item.id_localidade)
                });
            let notFoundLocations = util.arrayDifference(requestedLocations, foundLocations);
            returnedMessages.forEach(item => finalMessage += (item.msg + '\n' + '\n'))
            if (notFoundLocations != 0) finalMessage += `Não há ${metarOrTaf.toUpperCase()} disponível para ${notFoundLocations}`;
            resolve(finalMessage)
        });
    });
}

