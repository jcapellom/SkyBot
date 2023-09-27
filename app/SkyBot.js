const env = require("../.env");
const redeMetApi = require("../API/redeMetApi");
const util = require("../util");
const { commands } = require("./botCommands");
const Telegraf = require("telegraf");
const { handleNotam, handleSol, handleAllInfo, handleSigWx } = require("./services");
const { handleLocations } = require("../util");

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
  for (const command in commands) {
    if (Object.hasOwnProperty.call(commands, command)) {
      if (commands[command].hint != "") {
        if (textHelp != "") {
          textHelp += "\n";
        }
        textHelp += commands[command].hint;
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

async function requestMetData(command, requestedLocations, ctx) {
  await ctx.reply(
    `Buscando ${command.desc} para as localidade(s) ${requestedLocations}...`
  );

  redeMetApi.getMet(command.command, requestedLocations).then(async (data) => {
    for (aero of data) {
      if (aero.mens) {
        await ctx.reply(aero.mens);
      } else {
        await ctx.reply(
          `Não há ${command.desc} válido para ${aero.id_localidade}\n\n`
        );
      }
    }
  });
}

async function executeCommand(command, ctx) {
  const returnMessage = handleCommandMessage(ctx.update.message.text, command);
  // Se tem reply, é porque houve erro
  if (returnMessage.reply != "") {
    await ctx.reply(returnMessage.reply);
    return;
  }
  const requestedLocations = returnMessage.handledLocations;

  const { metar, aviso, taf, sigwx, allInfo, sol, notam } = commands;

  switch (command.toUpperCase()) {
    case metar.command.toUpperCase():
      requestMetData(metar, requestedLocations, ctx);
      break;
    case aviso.command.toUpperCase():
      requestMetData(aviso, requestedLocations, ctx);
      break;
    case taf.command.toUpperCase():
      requestMetData(taf, requestedLocations, ctx);
      break;
    case sigwx.command.toUpperCase():
      handleSigWx(sigwx, ctx);
      break;
    case allInfo.command.toUpperCase():
      handleAllInfo(ctx);
      break;
    case sol.command.toUpperCase():
      handleSol(requestedLocations, ctx);
      break;
    case notam.command.toUpperCase():
      handleNotam(requestedLocations, ctx);
      break;
    default:
      break;
  }
}

function checkRequestedLocationsPattern(text) {
  return /^[a-z]{4}(,[a-z]{4})*$/gi.test(text);
}

function handleCommandMessage(message, command) {
  let textAfterCommand = message.split(" ")[1];

  if (command == "allInfo" || command == "sigwx") {
    return { reply: "", handledLocations: [] };
  }

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
  for (const [_key, command] of Object.entries(commands)) {
    let commandText = command.command;
    let slashCommand = `/${commandText}`;

    if (text.split(" ")[0].toLowerCase() == slashCommand) {
      return commandText;
    }
  }
  if (checkRequestedLocationsPattern(text)) {
    return commands.allInfo.command;
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
