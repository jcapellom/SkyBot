const env = require('./.env');
const redeMetApi = require('./redeMetApi');
const customCommands = require('./customCommands');
const Telegraf = require('telegraf');
const bot = new Telegraf(env.token);

bot.start(ctx => {
    const from = ctx.update.message.from;
    const textStart = `Seja bem-vindo, ${from.first_name}! Utilize /help para obter informações sobre os comandos disponíveis.
*Este bot foi inspirado em @esq_gtt_bot, desenvolvido pelo Cap. Ítalo da FAB.*`
    ctx.telegram.sendMessage(ctx.chat.id, textStart, {parse_mode: 'markdown'});
});


bot.help(ctx => {
    const textHelp = '*/metar* Utilize este comando para obter o METAR das localidades solicitadas, enumerando\\-as com espaço após o comando e separando\\-as com vírgula\\.\n_Ex: /metar sbrj,sbgl,sbjr_\n\
\n*/taf*'
    ctx.telegram.sendMessage(ctx.chat.id, textHelp, {parse_mode: 'MarkdownV2'});
});

bot.command([customCommands.metar, customCommands.notam, customCommands.taf], (ctx) => {
    let text = ctx.update.message.text;
    let command = text.split(' ')[0].split('/')[1];
    let returnMessage = handleCommandMessage(text);
    if (returnMessage.reply != '') {
        ctx.reply(returnMessage.reply);
        return;
    }
    let requestedLocations = returnMessage.handledLocations;
    switch (command.toUpperCase()) {
        case customCommands.metar.toUpperCase():
        case customCommands.taf.toUpperCase():
            ctx.reply(`Buscando ${command.toUpperCase()} para as localidades ${requestedLocations}`);
            redeMetApi.getMetarOrTaf(command, requestedLocations, '').then(res =>{
                ctx.reply(res);
            });
            break;
        case customCommands.notam.toUpperCase():

        default:
            break;
    }

});

function handleLocations(locations){
    return locations !== undefined ? locations.split(',').map(location => location.toUpperCase()) : 0;
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
