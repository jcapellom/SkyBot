const env = require('./.env');
const redeMetApi = require('./redeMetApi')
const Telegraf = require('telegraf');
const axios = require('axios');
const bot = new Telegraf(env.token);

bot.start(ctx => {
    const from = ctx.update.message.from;
    const textStart = `Seja bem-vindo, ${from.first_name}! Utilize /help para obter informações sobre os comandos disponíveis.
*Este bot foi inspirado em @esq_gtt_bot, desenvolvido pelo Cap. Ítalo da FAB.*`
    ctx.telegram.sendMessage(ctx.chat.id, textStart, {parse_mode: 'markdown'});
});


bot.command('help', (ctx) => {
    const textHelp = '*/metar* Utilize este comando para obter o METAR das localidades solicitadas, enumerando\\-as com espaço após o comando e separando\\-as com vírgula\\.\n_Ex: /metar sbrj,sbgl,sbjr_\n\
\n*/taf*'
    ctx.telegram.sendMessage(ctx.chat.id, textHelp, {parse_mode: 'MarkdownV2'});

});

bot.command('metar', (ctx) => {
    let text = ctx.update.message.text;
    let returnMessage = handleCommandMessage(text);
    if (returnMessage.reply != '') {
        ctx.reply(returnMessage.reply);
        return;
    }
    let requestedLocations = returnMessage.handledLocations;
    ctx.reply('Buscando METAR para as localidades '+ requestedLocations);
    let response;
    try {
        let request = redeMetApi.metar(requestedLocations);
        axios
            .get(request)
            .then(res => {
                response = res.data !== undefined ? res.data.data !== undefined ? res.data.data.data : 0 : 0;
                let foundLocations =[];
                if (response == 0){
                    ctx.reply('Não há METAR disponível para nenhuma localidade requisitada.');
                    return;
                } 
                else
                    response.forEach((item) => {
                        foundLocations.push(item.id_localidade)
                        ctx.reply(item.mens)
                    });
                let notFoundLocations = arrayDifference(requestedLocations, foundLocations);
                if (notFoundLocations != 0) ctx.reply(`Não há METAR disponível para ${notFoundLocations}`);
            })
        
    } catch (error) {
        console.log(error);
    }
});

bot.command('taf', (ctx) => {

})

function handleLocations(locations){
    return locations !== undefined ? locations.split(',').map(location => location.toUpperCase()) : 0;
};

function arrayDifference(arr1, arr2){
    return Array.isArray(arr1) && Array.isArray(arr2) ? arr1.filter(x => !arr2.includes(x)) : 0;
};

function checkRequestedLocationsPattern(text){
    return (/^[a-z]{4}(,[a-z]{4})*$/gi).test(text);
};

function handleCommandMessage(message){
    let textAfterCommand = message.split(' ')[1];
    if (textAfterCommand === undefined){
        return {reply: 'Solicite pelo menos uma localidade'};
    }
    if (!checkRequestedLocationsPattern(textAfterCommand)){
        return {reply: 'Solicite as localidades utilizando os respectivos códigos ICAO separados por vírgula, sem espaço.'};
    }
    return {reply: '', handledLocations: handleLocations(textAfterCommand)};
};

bot.startPolling();
