const commands = {
    metar: {command:'metar', desc:'METAR', hint:'*/metar* Utilize este comando para obter o METAR das localidades solicitadas, enumerando\\-as com espaço após o comando e separando\\-as com vírgula\\.\n_Ex: /metar sbrj,sbgl,sbjr_\n'},
    taf: {command:'taf', desc:'TAF', hint:'*/taf* Utilize este comando para obter o TAF das localidades solicitadas, enumerando\\-as com espaço após o comando e separando\\-as com vírgula\\.\n_Ex: /taf sbrj,sbgl,sbjr_\n'},
    notam: {command:'notam', desc:'NOTAM', hint:'*/notam* *EM BREVE*\n'},
    allInfo: {command:'allInfo', desc:'', hint:''},
    sigwx: {command:'sigwx', desc: 'SIGWX', hint:'*/sigwx* Utilize este comando para obter a última carta SIGWX baixa disponível \\(SUP/FL250\\)\\.\n_Ex: /sigwx_\n'},
    help: {command:'help', desc:'', hint:''},
    start: {command:'start', desc:'', hint:''},
    sol: {command:'sol', desc:'nascer e pôr do sol', hint:'*/sol* Utilize este comando para obter os horários do nascer e pôr do sol da localidade solicitada no dia de hoje\\.\n_Ex: /sol sian_\n'},
    aviso: {command:'aviso', desc: 'aviso de aeródromo', hint:'*/aviso* Utilize este comando para obter o aviso de aeródromo das localidades solicitadas, enumerando\\-as com espaço após o comando e separando\\-as com vírgula\\.\n_Ex: /aviso sbrj,sbgl,sbjr_\n'}
}

module.exports = {
    commands
};