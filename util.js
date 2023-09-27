function arrayDifference(arr1, arr2) {
  return Array.isArray(arr1) && Array.isArray(arr2)
    ? arr1.filter((x) => !arr2.includes(x))
    : 0;
}

const toISOStringWithTimezone = (date) => {
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? "+" : "-";
  const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    diff +
    pad(tzOffset / 60) +
    ":" +
    pad(tzOffset % 60)
  );
};

function splitAdWrngLocations(rawLoc) {
  rawLoc.split("/").map((location) => location.toUpperCase());
  return rawLoc.split("/").map((location) => location.toUpperCase());
}

function catchErrors(error, msg, ctx) {
  if (ctx) {
    ctx.reply(msg);
  }
  console.log("ops!", error);
}

function handleLocations(locations) {
  return locations !== undefined
    ? locations.split(",").map((location) => location.toUpperCase())
    : [];
}

module.exports = {
  arrayDifference,
  toISOStringWithTimezone,
  splitAdWrngLocations,
  catchErrors,
  handleLocations
};
