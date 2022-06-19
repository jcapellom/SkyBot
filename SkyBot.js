const env = require('./.env')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const https = require('https')
const axios = require('axios')

const bot = new Telegraf(env.token)

bot.start(ctx => {
    const from = ctx.update.message.from

    console.log(from)

    ctx.reply(`Seja bem-vindo, ${from.first_name}!`)
})



bot.command('metar', (ctx) => {
        let text = ctx.update.message.text
        let localidades = text.split(' ')[1]
        console.log(`localidades:${localidades}`)
        ctx.reply('Buscando METAR para as localidades '+ localidades)
        let resposta
        axios
            .get(`https://api-redemet.decea.mil.br/mensagens/metar/${localidades}?api_key=${env.redeMetApiKey}`)
            .then(res => {
                resposta = res.data.data.data
                console.log(`resposta:${resposta}`)
                console.log(resposta.length)
                if (resposta == 0) 
                    ctx.reply('Não há METAR disponível para nenhuma localidade requisitada.')
                else
                    resposta.forEach((item) => {
                        ctx.reply(item.mens)
                    })
            })
    })

bot.startPolling()
