const botCommands = require('../app/botCommands');
const util = require('../util');

const redeMetApiKey = 'OM55qUBbwLma4RYXBf1QDYRPkIEyQD99KJ6fs94L';
const baseUrlMensagens = 'https://api-redemet.decea.mil.br/mensagens/';
const baseUrlProdutos = 'https://api-redemet.decea.mil.br/produtos/';

module.exports = {
    redeMetApiKey,
    getMet,
    getSigwx
};

function getMet(met, requestedLocations) {
    const endpoint = met + '/';

    const url = `${baseUrlMensagens}${endpoint}${requestedLocations}?api_key=${redeMetApiKey}`

    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const { data: {data: response} } = data
            if (!response) {
                return `Não há ${botCommands.commands[met].desc} válido para nenhuma localidade requisitada.\n\n`;
            }
            return response;
        });
}

//     return new Promise((resolve) => {
//         const requestUrl = `${baseUrlMensagens}${endpoint}${requestedLocations}?api_key=${redeMetApiKey}`;
//         axios.get(requestUrl).then(res => {
//             response = res.data !== undefined ? res.data.data !== undefined ? res.data.data.data : 0 : 0;
//             const returnedMessages = [];
//             const foundLocations = [];
//             const notFoundLocations = []
//             if (response == 0) {
//                 finalMessage += `Não há ${botCommands.commands[met].desc} válido para nenhuma localidade requisitada.\n\n`;
//                 resolve(finalMessage);
//             }
//             else
//                 response.forEach((item) => {
//                     if (item.id_localidade !== undefined) {
//                         foundLocations.push(item.id_localidade);
//                     } else {
//                         util.splitAdWrngLocations(item.mens.substring(0, item.mens.indexOf(' '))).forEach(element => {
//                             foundLocations.push(element);
//                         });
//                     }
//                     returnedMessages.push({ location: foundLocations, initial: item.validade_inicial, final: item.validade_final, msg: item.mens, received: item.recebimento });
//                 });
//             notFoundLocations.push(util.arrayDifference(requestedLocations, foundLocations));
//             returnedMessages.forEach(item => finalMessage += (item.msg + '\n\n'));
//             if (notFoundLocations != 0) finalMessage += `Não há ${botCommands.commands[met].desc} válido para ${notFoundLocations}\n\n`;
//             resolve(finalMessage);
//         });
//     });
// }

async function getSigwx(){
    const requestUrl = `${baseUrlProdutos}sigwx?api_key=${redeMetApiKey}`;

    return fetch(requestUrl)
        .then(res => res.text())
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
}
