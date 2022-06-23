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
\n*/taf* Utilize este comando para obter o TAF das localidades solicitadas, enumerando\\-as com espaço após o comando e separando\\-as com vírgula\\.\n_Ex: /taf sbrj,sbgl,sbjr_\n\
\n*/sigwx*  Utilize este comando para obter a última carta SIGWX baixa disponível \\(SUP/FL250\\)\\.\n_Ex: /sigwx_' 
    ctx.telegram.sendMessage(ctx.chat.id, textHelp, {parse_mode: 'MarkdownV2'});
});

bot.command([customCommands.metar, customCommands.notam, customCommands.taf, customCommands.sigwx], (ctx) => {
    let command = extractCommandFromMessage(ctx.update.message.text);
    switch (command.toUpperCase()) {
        case customCommands.notam.toUpperCase():
        case customCommands.metar.toUpperCase():
        case customCommands.taf.toUpperCase():
            let returnMessage = handleCommandMessage(ctx.update.message.text);
            let requestedLocations = returnMessage.handledLocations;
            if (returnMessage.reply != '') {
                ctx.reply(returnMessage.reply);
                return;
            }
            ctx.reply(`Buscando ${command.toUpperCase()} para as localidades ${requestedLocations}...`);
            redeMetApi.getMetarOrTaf(command, requestedLocations, '').then(res => {
                ctx.reply(res);
            });
            break;
        case customCommands.sigwx.toUpperCase():
            ctx.reply(`Buscando ${command.toUpperCase()} mais recente...`);
            redeMetApi.getSigwx().then(res => {
                console.log(res);
                ctx.replyWithPhoto(res);
            })
        default:
            break;
    }

});

function extractCommandFromMessage(text) {
    return text.split(' ')[0].split('/')[1];
}

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
