const redeMetApiKey = 'OM55qUBbwLma4RYXBf1QDYRPkIEyQD99KJ6fs94L';
const baseUrlMensagens = 'https://api-redemet.decea.mil.br/mensagens/';
const baseUrlProdutos = 'https://api-redemet.decea.mil.br/produtos/';
const util = require('./util');
const axios = require('axios');

module.exports = {

    redeMetApiKey,
    getMetarOrTaf,
    getSigwx

};

function getMetarOrTaf(metarOrTaf, requestedLocations, finalMessage) {
    let endpoint = metarOrTaf + '/';
    let response;
    let data_ini;
    let data_fim;
    let page_tam;
    return new Promise((resolve) => {
        let requestUrl = `${baseUrlMensagens}${endpoint}${requestedLocations}?api_key=${redeMetApiKey}`;
        axios.get(requestUrl).then(res => {
            response = res.data !== undefined ? res.data.data !== undefined ? res.data.data.data : 0 : 0;
            let returnedMessages = [];
            let foundLocations = [];
            if (response == 0) {
                finalMessage = `Não há ${metarOrTaf.toUpperCase()} disponível para nenhuma localidade requisitada.`;
                resolve(finalMessage);
            }
            else
                response.forEach((item) => {
                    returnedMessages.push({ location: item.id_localidade, initial: item.validade_inicial, final: item.validade_final, msg: item.mens, received: item.recebimento });
                    foundLocations.push(item.id_localidade);
                });
            let notFoundLocations = util.arrayDifference(requestedLocations, foundLocations);
            returnedMessages.forEach(item => finalMessage += (item.msg + '\n' + '\n'));
            if (notFoundLocations != 0) finalMessage += `Não há ${metarOrTaf.toUpperCase()} disponível para ${notFoundLocations}`;
            resolve(finalMessage);
        });
    });
}

function getSigwx(){
    return new Promise((resolve) => {
        let requestUrl = `${baseUrlProdutos}sigwx?api_key=${redeMetApiKey}`;
        axios
            .get(requestUrl)
            .then(res => {
                resolve(res.data);
            })
            .catch(error => {
                if (error.response) {
                    console.log(error.respose.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log ('Erro em /sigwx', error.message);
                }
            })
    })
}
