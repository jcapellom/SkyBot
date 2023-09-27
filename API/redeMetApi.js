const botCommands = require('../app/botCommands');
const util = require('../util');

const redeMetApiKey = 'OM55qUBbwLma4RYXBf1QDYRPkIEyQD99KJ6fs94L';
const baseUrlMensagens = 'https://api-redemet.decea.mil.br/mensagens/';
const baseUrlProdutos = 'https://api-redemet.decea.mil.br/produtos/';

function getMet(met, requestedLocations) {
    const endpoint = met + '/';
    const requestUrl = `${baseUrlMensagens}${endpoint}${requestedLocations}?api_key=${redeMetApiKey}`

    return fetch(requestUrl)
        .then((response) => response.json())
        .then((data) => {
            if (!data.status) {
                throw new Error("Erro na requisição")
            }

            const { data: {data: aeros} } = data
            for (location of requestedLocations) {
                const found = aeros.find((aero) => aero.id_localidade === location)
                if (!found) {
                    aeros.push({
                        id_localidade: location,
                        invalid: true,
                    })
                }
            }
            return aeros;
        })
        .catch((error) => {
            console.log(error)
            throw error;
        })
}

async function getSigwx(){
    const requestUrl = `${baseUrlProdutos}sigwx?api_key=${redeMetApiKey}`;

    return fetch(requestUrl)
        .then(res => res.text())
        .catch(error => {
            console.log(error)
            throw error;
        })
}

module.exports = {
    redeMetApiKey,
    getMet,
    getSigwx
};
