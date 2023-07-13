const redeMetApiKey = 'OM55qUBbwLma4RYXBf1QDYRPkIEyQD99KJ6fs94L';
const baseUrlMensagens = 'https://api-redemet.decea.mil.br/mensagens/';
const baseUrlProdutos = 'https://api-redemet.decea.mil.br/produtos/';
const botCommands = require('../app/botCommands');
const util = require('../util');
const axios = require('axios');

module.exports = {

    redeMetApiKey,
    getMet,
    getSigwx
};

function getMet(met, requestedLocations, finalMessage) {
    let endpoint = met + '/';
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
            let notFoundLocations = []
            if (response == 0) {
                finalMessage += `Não há ${botCommands.commands[met].desc} válido para nenhuma localidade requisitada.\n\n`;
                resolve(finalMessage);
            }
            else
                response.forEach((item) => {
                    if (item.id_localidade !== undefined) {
                        foundLocations.push(item.id_localidade);
                    } else {
                        util.splitAdWrngLocations(item.mens.substring(0, item.mens.indexOf(' '))).forEach(element => {
                            foundLocations.push(element);
                        });
                    }
                    returnedMessages.push({ location: foundLocations, initial: item.validade_inicial, final: item.validade_final, msg: item.mens, received: item.recebimento });
                });
            notFoundLocations.push(util.arrayDifference(requestedLocations, foundLocations));
            returnedMessages.forEach(item => finalMessage += (item.msg + '\n\n'));
            if (notFoundLocations != 0) finalMessage += `Não há ${botCommands.commands[met].desc} válido para ${notFoundLocations}\n\n`;
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
