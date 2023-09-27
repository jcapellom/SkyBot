const aisWebApi = require("../API/aisWebApi");
const { catchErrors } = require('../util');

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
      console.log("error", error);
      catchErrors(error, errorMsg.aisWeb, ctx);
      throw error;
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

module.exports = {
  handleNotam,
  handleSol,
};
