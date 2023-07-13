const env = require('../.env');
const redeMetApi = require('../API/redeMetApi');
const aisWebApi = require('../API/aisWebApi');
const util = require('../util');
const botCommands = require('./botCommands');
const Telegraf = require('telegraf');
const bot = new Telegraf(env.token);
const botLog = new Telegraf(env.tokenLog);
const errorMsg = require('./errorMsgs');

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
    let textHelp = ''
    for (const command in botCommands.commands) {
        if (Object.hasOwnProperty.call(botCommands.commands, command)) {
            if (botCommands.commands[command].hint != ''){
                if (textHelp != ''){
                    textHelp += '\n'
                }
                textHelp += botCommands.commands[command].hint
            }   
        }
    }
    textHelp += '\n*icao1,icao2,icao3\\.\\.\\.* Você pode listar localidades sem comando precedente\\. Isso retornará METAR, TAF e aviso de aeródromo das localidades listadas separadas por vírgula e sem espaço\\.\n'
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

async function requestMetData(msg, command, requestedLocations, commandDescription, ctx){
    if (msg.reply != '') {
        await ctx.reply(msg.reply);
        return;
    }
    await ctx.reply(`Buscando ${commandDescription} para as localidades ${requestedLocations}...`);
    redeMetApi.getMet(command, requestedLocations, '').then(res => {
        ctx.reply(res);
    });
}

async function executeCommand(command, ctx) {
    var commandDescription;
    var returnMessage = handleCommandMessage(ctx.update.message.text);
    var requestedLocations = returnMessage.handledLocations;
    switch (command.toUpperCase()) {
        case botCommands.commands.notam.command.toUpperCase():
            commandDescription = botCommands.commands.notam.desc;
            requestMetData(returnMessage, command, requestedLocations, commandDescription, ctx)
            break;
        case botCommands.commands.metar.command.toUpperCase():
            commandDescription = botCommands.commands.metar.desc;
            requestMetData(returnMessage, command, requestedLocations, commandDescription, ctx)
            break;
        case botCommands.commands.aviso.command.toUpperCase():
            commandDescription = botCommands.commands.aviso.desc;
            requestMetData(returnMessage, command, requestedLocations, commandDescription, ctx)
            break;
        case botCommands.commands.taf.command.toUpperCase():
            commandDescription = botCommands.commands.taf.desc;
            requestMetData(returnMessage, command, requestedLocations, commandDescription, ctx)
            break;
        case botCommands.commands.sigwx.command.toUpperCase():
            commandDescription = botCommands.commands.sigwx.desc;
            await ctx.reply(`Buscando ${commandDescription} mais recente...`);
            redeMetApi.getSigwx().then(res => {
                console.log(res);
                ctx.replyWithPhoto(res);
            }).catch(error => {
                catchErrors(error, errorMsg.redeMet);
            });
            break;

        case botCommands.commands.allInfo.command.toUpperCase():
            requestedLocations = handleLocations(ctx.update.message.text);
            await ctx.reply(`Buscando informações meteorológicas para as localidades ${requestedLocations}...`)
            let chainedMessage = ''
            redeMetApi.getMet(botCommands.commands.metar.command, requestedLocations, chainedMessage).then(res => {
                chainedMessage = res;
                redeMetApi.getMet(botCommands.commands.taf.command, requestedLocations, chainedMessage).then(res => {
                    chainedMessage = res;
                    redeMetApi.getMet(botCommands.commands.aviso.command, requestedLocations, chainedMessage).then(res => {
                        chainedMessage = res
                        ctx.reply(chainedMessage);
                    }).catch(error => {
                        catchErrors(error, errorMsg.redeMet, ctx);
                    });
                }).catch(error => {
                    catchErrors(error, errorMsg.redeMet, ctx);
                });
            }).catch(error => {
                catchErrors(error, errorMsg.redeMet, ctx);
            });
            break;
        case botCommands.commands.sol.command.toUpperCase():
            commandDescription = botCommands.commands.sol.desc;
            if (requestedLocations== undefined || requestedLocations.length > 1) {
                ctx.reply('Digite o código ICAO de uma localidade (apenas uma). Utilize /help para instruções.')
                break;
            }
            await ctx.reply(`Buscando horários da tabela do pôr do sol para ${requestedLocations}...`)
            aisWebApi.getSol(requestedLocations).then(res => {
                console.log(res);
                ctx.reply(`${res.aisweb.day.aero._text} (${res.aisweb.day.date._text}) \n \u{1F31E} ${res.aisweb.day.sunrise._text} \n \u{1F319} ${res.aisweb.day.sunset._text}`);
            }).catch(error => {
                catchErrors(error, errorMsg.aisWeb);
            });
            break;
        default:
            break;
    }
}

function catchErrors(error, msg, ctx) {
    ctx.reply(msg);
    console.log('ops!', error);
};

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
            let commandText = botCommands.commands[command].command;
            let slashCommand = `/${commandText}`
            if (text.split(' ')[0].toLowerCase() == slashCommand) { return commandText };
        }
    }
    if (checkRequestedLocationsPattern(text)) { return botCommands.commands.allInfo.command }
    return false;
}

bot.startPolling();

bot.catch(error => {
    console.log('Erro encontrado:', error)
});

botLog.catch(error => {
    console.log('Erro encontrado:', error)
});