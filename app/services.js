const aisWebApi = require("../API/aisWebApi");
const redeMetApi = require("../API/redeMetApi");
const errorMsg = require("./errorMsgs");
const botCommands = require("./botCommands");
const { catchErrors, handleLocations } = require('../util');

async function handleNotam(requestedLocations, ctx) {
  if (requestedLocations == undefined || requestedLocations.length > 1) {
    ctx.reply(
      "Digite o código ICAO de uma localidade (apenas uma). Utilize /help para instruções.."
    );
    return false;
  }

  await ctx.reply(`Buscando NOTAMs para ${requestedLocations}...`);

  aisWebApi
    .getNotam(requestedLocations)
    .then(async (res) => {
      let msgNotams = "";

      const { item: items } = res.aisweb.notam;

      /**
       * TelegramError: 400: Bad Request: message is too long
       * Enviando um Notam por mensagem para contornar esse problema por enquanto
       */

      for (const notam of items) {
        console.log("notam", notam);
        const notamMessage = `${notam.number}\n${notam.state}\n${notam.loc}, ${notam.cidade}, ${notam.uf}\n${notam.fir}/${notam.cod}/${notam.traffic}/${notam.purpose} /${notam.scope} /${notam.lower}/${notam.upper}/${notam.geo} \n${notam.e} \nORIGEM: ${notam.origem} \n\u{2B07}${notam.f} \u{2B06}${notam.g}\n\n`;
        msgNotams += notamMessage;

        await ctx.reply(notamMessage);
      }

      // ctx.reply(msgNotams);
    })
    .catch((error) => {
      catchErrors(error, errorMsg.aisWeb, ctx);
    });
}

async function handleSol(requestedLocations, ctx) {
  if (requestedLocations == undefined || requestedLocations.length > 1) {
    ctx.reply(
      "Digite o código ICAO de uma localidade (apenas uma). Utilize /help para instruções."
    );
    return false;
  }

  await ctx.reply(
    `Buscando horários da tabela do pôr do sol para ${requestedLocations}...`
  );

  aisWebApi
    .getSol(requestedLocations)
    .then((res) => {
      const { day } = res.aisweb;
      const { date, sunrise, sunset, weekDay, aero, geo } = day;

      const responseMessage = `${aero} (${date}) \n \u{1F31E} ${sunrise} \n \u{1F319} ${sunset}`;

      ctx.reply(responseMessage);
    })
    .catch((error) => {
      catchErrors(error, errorMsg.aisWeb);
    });
}

async function handleAllInfo(ctx) {
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

    await ctx.reply(`\u{1F4A7} METAR \u{1F4A7}\n`);
    for (aero of metar) {
      if (aero.mens != undefined) {
        await ctx.reply(aero.mens);
      } else {
        await ctx.reply(`Não há METAR de aeródromo válido para ${aero.id_localidade}`);
      }
    }

    await ctx.reply(`\u{1F4A7} TAF \u{1F4A7}\n`);
    for (aero of taf) {
      if (aero.mens != undefined) {
        await ctx.reply(aero.mens);
      } else {
        await ctx.reply(`Não há TAF de aeródromo válido para ${aero.id_localidade}`);
      }
    }
    
    await ctx.reply(`\u{1F4A7} AVISO DE AERÓDROMO \u{1F4A7}\n`);
    for (aero of aviso) {
      if (aero.mens != undefined) {
        await ctx.reply(aero.mens);
      } else {
        // O aviso nao e definido pelo id_localidade, entao nao temos certeza se existe ou nao
        // await ctx.reply(`Não há AVISO de aeródromo válido para ${aero.id_localidade}`);
      }
    }

  } catch (error) {
    catchErrors(error, errorMsg.redeMet, ctx);
  }
}

async function handleSigWx(sigwx, ctx) {
  await ctx.reply(`Buscando ${sigwx.desc} mais recente...`);
  return redeMetApi
    .getSigwx()
    .then((res) => {
      ctx.replyWithPhoto(res);
    })
    .catch((error) => {
      catchErrors(error, errorMsg.redeMet);
    });
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

module.exports = {
  handleNotam,
  handleSol,
  handleAllInfo,
  handleSigWx,
  requestMetData
};
