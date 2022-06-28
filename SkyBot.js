const env = require('./.env');
const redeMetApi = require('./redeMetApi');
const util = require('./util');
const botCommands = require('./botCommands');
const Telegraf = require('telegraf');
const bot = new Telegraf(env.token);
const botLog = new Telegraf(env.tokenLog);
const util = require('./util');

function replyWithStartText(ctx) {
    let from = ctx.update.message.from;
    console.log(ctx.update.message);
    ctx.telegram.sendMessage(ctx.chat.id
        , `Seja bem-vindo, ${from.first_name}! Utilize /help para obter informações sobre os comandos disponíveis.
*Este bot foi inspirado em @esq_gtt_bot, desenvolvido pelo Cap. Ítalo da FAB.*`
        , { parse_mode: 'markdown' });
}

bot.start(ctx => {
    replyWithStartText(ctx);
});

bot.on('message', async (ctx, next) => {
    await next()
    console.log(ctx.update);
    let text = ctx.update.message.text;
    logMessages(ctx.update.message);
    isCommand(text) ? executeCommand(isCommand(text), ctx) : replyWithStartText(ctx);
});

bot.help(ctx => {
    let textHelp = '*/metar* Utilize este comando para obter o METAR das localidades solicitadas, enumerando\\-as com espaço após o comando e separando\\-as com vírgula\\.\n_Ex: /metar sbrj,sbgl,sbjr_\n\
        \n*/taf* Utilize este comando para obter o TAF das localidades solicitadas, enumerando\\-as com espaço após o comando e separando\\-as com vírgula\\.\n_Ex: /taf sbrj,sbgl,sbjr_\n\
        \n*/sigwx*  Utilize este comando para obter a última carta SIGWX baixa disponível \\(SUP/FL250\\)\\.\n_Ex: /sigwx_\n\
        \n*/notam* *EM BREVE*\n\
        \n*icao1,icao2,icao3\\.\\.\\.* Você pode listar localidades sem comando precedente\\. Isso retornará METAR e TAF das localidades listadas separadas por vírgula e sem espaço\\.\n'
    ctx.telegram.sendMessage(ctx.chat.id, textHelp, { parse_mode: 'MarkdownV2' });
});

function logMessages(message) {
    let senderName = message.from.first_name;
    let senderLastName = message.from.last_name;
    let timestamp = util.toISOStringWithTimezone(new Date(message.date * 1000));
    let loggedMsg = `------------------------------------\n\
${senderName} ${senderLastName} - ${timestamp}\n\
-> ${message.text}\n\
------------------------------------\n`

    botLog.telegram.sendMessage(env.adminChatId, loggedMsg);
}

function handleLocations(locations) {
    return locations !== undefined ? locations.split(',').map(location => location.toUpperCase()) : 0;
};

function executeCommand(command, ctx) {
    var requestedLocations;
    switch (command.toUpperCase()) {
        case botCommands.commands.notam.toUpperCase():
        case botCommands.commands.metar.toUpperCase():
        case botCommands.commands.taf.toUpperCase():
            let returnMessage = handleCommandMessage(ctx.update.message.text);
            requestedLocations = returnMessage.handledLocations;
            if (returnMessage.reply != '') {
                ctx.reply(returnMessage.reply);
                return;
            }
            ctx.reply(`Buscando ${command.toUpperCase()} para as localidades ${requestedLocations}...`);
            redeMetApi.getMetarOrTaf(command, requestedLocations, '').then(res => {
                ctx.reply(res);
            });
            break;
        case botCommands.commands.sigwx.toUpperCase():
            ctx.reply(`Buscando ${command.toUpperCase()} mais recente...`);
            redeMetApi.getSigwx().then(res => {
                console.log(res);
                ctx.replyWithPhoto(res);
            })
            break;
        case botCommands.commands.allInfo.toUpperCase():
            requestedLocations = ctx.update.message.text
            ctx.reply(`Buscando informações meteorológicas para as localidades ${requestedLocations}`)
            let chainedMessage = ''
            redeMetApi.getMetarOrTaf(botCommands.commands.metar, requestedLocations, chainedMessage).then(res => {
                chainedMessage = res;
                redeMetApi.getMetarOrTaf(botCommands.commands.taf, requestedLocations, chainedMessage).then(res => {
                    chainedMessage = res;
                    ctx.reply(chainedMessage);
                })
            })
        default:
            break;
    }
}

function checkRequestedLocationsPattern(text) {
    return (/^[a-z]{4}(,[a-z]{4})*$/gi).test(text);
};

function handleCommandMessage(message) {
    let textAfterCommand = message.split(' ')[1];
    if (textAfterCommand === undefined) {
        return { reply: 'Solicite pelo menos uma localidade' };
    }
    if (!checkRequestedLocationsPattern(textAfterCommand)) {
        return { reply: 'Solicite as localidades utilizando os respectivos códigos ICAO separados por vírgula, sem espaço.' };
    }
    return { reply: '', handledLocations: handleLocations(textAfterCommand) };
};

function isCommand(text) {
    for (const command in botCommands.commands) {
        if (Object.hasOwnProperty.call(botCommands.commands, command)) {
            let commandText = botCommands.commands[command];
            let slashCommand = `/${commandText}`
            if (text.split(' ')[0] == slashCommand) { return commandText };
        }
    }
    if (checkRequestedLocationsPattern(text)) {return botCommands.commands.allInfo}
    return false;
}

bot.startPolling();
