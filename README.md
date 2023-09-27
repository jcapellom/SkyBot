# README - Bot Telegram de Informações Aeronáuticas

Este é um bot Telegram desenvolvido em Node.js que fornece informações aeronáuticas, como METAR, TAF, SIGWX, horários de nascer e pôr do sol e avisos de aeródromo. O bot permite que os usuários obtenham informações sobre localidades específicas ou várias localidades de uma só vez.

## Funcionalidades

### Comandos

1. **/metar**
   - Utilize este comando para obter o METAR das localidades solicitadas.
   - Exemplo: `/metar sbrj,sbgl,sbjr`

2. **/taf**
   - Utilize este comando para obter o TAF das localidades solicitadas.
   - Exemplo: `/taf sbrj,sbgl,sbjr`

3. **/notam**
   - (Em breve) - Esta funcionalidade estará disponível em breve.

4. **/sigwx**
   - Utilize este comando para obter a última carta SIGWX baixa disponível (SUP/FL250).
   - Exemplo: `/sigwx`

5. **/sol**
   - Utilize este comando para obter os horários do nascer e pôr do sol da localidade solicitada no dia de hoje.
   - Exemplo: `/sol sian`

6. **/aviso**
   - Utilize este comando para obter o aviso de aeródromo das localidades solicitadas.
   - Exemplo: `/aviso sbrj,sbgl,sbjr`

### Consulta direta por ICAO
Você também pode listar localidades diretamente, sem a necessidade de comandos precedentes. O bot retornará informações de METAR, TAF e aviso de aeródromo das localidades listadas, separadas por vírgula e sem espaço.
   
   - Exemplo: `sbrj,sbgl,sbjr`

## Como usar o Bot

1. **Inicie uma conversa com o bot:** Procure pelo nome de usuário do bot no Telegram e inicie uma conversa.

2. **Utilize os comandos:** Digite um dos comandos listados acima, seguido das localidades que deseja consultar, separadas por vírgula.

3. **Receba informações aeronáuticas:** O bot responderá com as informações solicitadas para as localidades especificadas.

---

**Aviso:** Este bot foi desenvolvido para fins educacionais e não deve ser utilizado para fins críticos ou de produção. As informações aeronáuticas fornecidas pelo bot podem não ser atualizadas em tempo real e não devem ser usadas para fins de aviação real.
