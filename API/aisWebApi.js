const util = require("../util");
const xml2json = require("../node_modules/xml-js/lib/xml2json");
var xml2js = require('xml2js');

const aisWebApiKey = "2074992786";
const aisWebApiPass = "a3826292-ef6d-11ec-83ee-0050569ac2e1";
const baseUrlMensagens = `https://api.decea.mil.br/aisweb/?apiKey=${aisWebApiKey}&apiPass=${aisWebApiPass}&area=`;

module.exports = {
  aisWebApiKey,
  aisWebApiPass,
  getSol,
  getNotam,
};

function getSol(requestedLocations) {
  let area = "sol";
  let response;
  let data_ini;
  let data_fim;
  let returnMessage;

  let requestUrl = `${baseUrlMensagens}${area}&icaoCode=${requestedLocations}`;

  return fetch(requestUrl)
    .then((res) => res.text())
    .then((res) => xml2js.parseStringPromise(res, {explicitArray: false}))
    .then((res) => {
      return res
    })
    .catch((err) => console.log(err));
}

function getNotam(requestedLocations) {
  console.log("getNotam", requestedLocations);

  let area = "notam";
  let response;
  let requestUrl = `${baseUrlMensagens}${area}&icaoCode=${requestedLocations}`;

  return fetch(requestUrl)
    .then((res) => res.text())
    .then((res) => xml2js.parseStringPromise(res, {explicitArray: false}))
    .then((res) => {
      return res
    })
    .catch((err) => console.log(err));
}
