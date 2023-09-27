const env = require("../.env");
const redeMetApi = require("../API/redeMetApi");
const aisWebApi = require("../API/aisWebApi");
const util = require("../util");
const botCommands = require("./botCommands");
const Telegraf = require("telegraf");
const errorMsg = require("./errorMsgs");
const { handleNotam, handleSol } = require("./services");
const { catchErrors } = require('../util');

const bot = new Telegraf(env.token);
const botLog = new Telegraf(env.tokenLog);

function replyWithStartText(ctx) {
  console.log(ctx.update.message);

  const { from } = ctx.update.message;
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `Seja bem-vindo, ${from.first_name}! Utilize /help para obter informações sobre os comandos disponíveis.
*Este bot foi inspirado em @esq_gtt_bot, desenvolvido pelo Cap. Ítalo da FAB.*`,
    { parse_mode: "markdown" }
  );
}

bot.start((ctx) => {
  replyWithStartText(ctx);
});

bot.on("message", async (ctx, next) => {
  // await next();
  // console.log(ctx.update);

  const { text } = ctx.update.message;

  logMessages(ctx.update.message);

  const command = isCommand(text);

  if (command) {
    executeCommand(command, ctx);
  } else {
    ctx.reply("Comando não reconhecido. Utilize /help para instruções.");
  }
});

bot.help((ctx) => {
  let textHelp = "";
  for (const command in botCommands.commands) {
    if (Object.hasOwnProperty.call(botCommands.commands, command)) {
      if (botCommands.commands[command].hint != "") {
        if (textHelp != "") {
          textHelp += "\n";
        }
        textHelp += botCommands.commands[command].hint;
      }
    }
  }
  textHelp +=
    "\n*icao1,icao2,icao3\\.\\.\\.* Você pode listar localidades sem comando precedente\\. Isso retornará METAR, TAF e aviso de aeródromo das localidades listadas separadas por vírgula e sem espaço\\.\n";
  ctx.telegram.sendMessage(ctx.chat.id, textHelp, { parse_mode: "MarkdownV2" });
});

function logMessages(message) {
  let senderName = message.from.first_name;
  let senderLastName = message.from.last_name;
  let timestamp = util.toISOStringWithTimezone(new Date(message.date * 1000));
  let loggedMsg = `------------------------------------\n\
${senderName} ${senderLastName} - ${timestamp}\n\
-> ${message.text}\n\
------------------------------------\n`;

  botLog.telegram.sendMessage(env.adminChatId, loggedMsg);
}

function handleLocations(locations) {
  return locations !== undefined
    ? locations.split(",").map((location) => location.toUpperCase())
    : [];
}

async function requestMetData(
  msg,
  command,
  requestedLocations,
  commandDescription,
  ctx
) {
  if (msg.reply != "") {
    await ctx.reply(msg.reply);
    return;
  }
  await ctx.reply(
    `Buscando ${commandDescription} para as localidade(s) ${requestedLocations}...`
  );

  redeMetApi.getMet(command, requestedLocations).then(async (data) => {
    for (aero of data) {
      if (aero.mens) {
        await ctx.reply(aero.mens);
      } else {
        await ctx.reply(
          `Não há ${botCommands.commands[command].desc} válido para ${aero.id_localidade}\n\n`
        );
      }
    }
  });
}

async function executeCommand(command, ctx) {
  let commandDescription;
  let returnMessage = handleCommandMessage(ctx.update.message.text);
  let requestedLocations = returnMessage.handledLocations;

  switch (command.toUpperCase()) {
    case botCommands.commands.metar.command.toUpperCase():
      commandDescription = botCommands.commands.metar.desc;
      requestMetData(
        returnMessage,
        command,
        requestedLocations,
        commandDescription,
        ctx
      );
      break;
    case botCommands.commands.aviso.command.toUpperCase():
      commandDescription = botCommands.commands.aviso.desc;
      requestMetData(
        returnMessage,
        command,
        requestedLocations,
        commandDescription,
        ctx
      );
      break;
    case botCommands.commands.taf.command.toUpperCase():
      commandDescription = botCommands.commands.taf.desc;
      requestMetData(
        returnMessage,
        command,
        requestedLocations,
        commandDescription,
        ctx
      );
      break;
    case botCommands.commands.sigwx.command.toUpperCase():
      commandDescription = botCommands.commands.sigwx.desc;
      await ctx.reply(`Buscando ${commandDescription} mais recente...`);
      redeMetApi
        .getSigwx()
        .then((res) => {
          console.log(res);
          ctx.replyWithPhoto(res);
        })
        .catch((error) => {
          catchErrors(error, errorMsg.redeMet);
        });
      break;

    case botCommands.commands.allInfo.command.toUpperCase():
      requestedLocations = handleLocations(ctx.update.message.text);
      await ctx.reply(
        `Buscando informações meteorológicas para as localidades ${requestedLocations}...`
      );

      try {
        const metar = await redeMetApi.getMet(
          botCommands.commands.metar.command,
          requestedLocations
        );
        const taf = await redeMetApi.getMet(
          botCommands.commands.taf.command,
          requestedLocations
        );
        const aviso = await redeMetApi.getMet(
          botCommands.commands.aviso.command,
          requestedLocations
        );

        console.log(metar);
        console.log(taf);
        console.log(aviso);

        await ctx.reply(`\u{1F4A7} METAR \u{1F4A7}\n`);
        for (aero in metar) {
          if (metar[aero].mens != undefined) {
            await ctx.reply(metar[aero].mens);
          }
        }
        await ctx.reply(`\u{1F4A7} TAF \u{1F4A7}\n`);
        for (aero in taf) {
          if (taf[aero].mens != undefined) {
            await ctx.reply(taf[aero].mens);
          }
        }
        await ctx.reply(`\u{1F4A7} AVISO DE AERÓDROMO \u{1F4A7}\n`);
        for (aero in aviso) {
          if (aviso[aero].mens != undefined) {
            await ctx.reply(aviso[aero].mens);
          }
        }
      } catch (error) {
        catchErrors(error, errorMsg.redeMet, ctx);
      }
      break;

    case botCommands.commands.sol.command.toUpperCase():
      handleSol(requestedLocations, ctx);
      break;
    case botCommands.commands.notam.command.toUpperCase():
      handleNotam(requestedLocations, ctx);
      break;
    default:
      break;
  }
}

function checkRequestedLocationsPattern(text) {
  return /^[a-z]{4}(,[a-z]{4})*$/gi.test(text);
}

function handleCommandMessage(message) {
  let textAfterCommand = message.split(" ")[1];

  if (textAfterCommand === undefined) {
    return { reply: "Solicite pelo menos uma localidade" };
  }

  if (!checkRequestedLocationsPattern(textAfterCommand)) {
    return {
      reply:
        "Solicite as localidades utilizando os respectivos códigos ICAO separados por vírgula, sem espaço.",
    };
  }
  return { reply: "", handledLocations: handleLocations(textAfterCommand) };
}

function isCommand(text) {
  for (const command in botCommands.commands) {
    let commandText = botCommands.commands[command].command;
    let slashCommand = `/${commandText}`;

    if (text.split(" ")[0].toLowerCase() == slashCommand) {
      return commandText;
    }
  }
  if (checkRequestedLocationsPattern(text)) {
    return botCommands.commands.allInfo.command;
  }
  return false;
}

bot.startPolling();

bot.catch((error) => {
  console.log("Erro encontrado:", error);
});

botLog.catch((error) => {
  console.log("Erro encontrado:", error);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
