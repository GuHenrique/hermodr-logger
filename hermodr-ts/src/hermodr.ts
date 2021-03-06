let hasMongoose: boolean, Log, mongoose;

const settings = {
  LOG: "\x1b[42m\x1b[37m%s\x1b[0m%s\x1b[33m%s\x1b[0m",
  DEBUG: "\x1b[43m\x1b[31m%s\x1b[0m%s\x1b[33m%s\x1b[0m",
  WARN: "\x1b[45m%s\x1b[0m%s\x1b[33m%s\x1b[0m",
  ERROR: "\x1b[41m%s\x1b[0m%s\x1b[33m%s\x1b[0m",
};

function formattedDateTime(date: Date) {
  let day: string;
  let month: string;
  let year: string;
  let hour: string;
  let minutes: string;
  let seconds: string;
  let dateReturn: string;

  day = date.getDate().toString();
  month = (date.getMonth() + 1).toString();
  year = date.getFullYear().toString();
  hour = date.getHours().toString();
  minutes = date.getMinutes().toString();
  seconds = date.getSeconds().toString();

  day = day.length == 1 ? "0" + day : day;
  month = month.length == 1 ? "0" + month : month;
  hour = hour.length == 1 ? "0" + hour : hour;
  minutes = minutes.length == 1 ? "0" + minutes : minutes;
  seconds = seconds.length == 1 ? "0" + seconds : seconds;

  dateReturn =
    year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;

  return dateReturn;
}

try {
  mongoose = require("mongoose");
  const logSchema = new mongoose.Schema({
    level: String,
    marker: String,
    date: String,
    messages: [],
  });

  Log = mongoose.model("Log", logSchema);
  hasMongoose = true;
} catch (error) {
  let date = formattedDateTime(new Date());
  console.log(
    `\x1b[41m%s\x1b[0m%s\x1b[33m%s\x1b[0m`,
    ` ERROR `,
    ` hermodr.ts`,
    ` ${date} `,
    ` Without MONGOOSE installation`
  );
  hasMongoose = false;
}

function makeLog(
  level: string,
  marker: string,
  date: string,
  messages: string[]
) {
  const style = settings[level];

  console.log(
    `${style}`,
    ` ${level} `,
    ` ${marker} `,
    ` ${date} `,
    ` ${messages} `
  );

  insertDatabase(level, marker, date, messages);
}

function insertDatabase(
  level: string,
  marker: string,
  date: string,
  messages: string[]
) {
  if (!hasMongoose) return;

  var object = {
    level: level,
    marker: marker,
    date: date,
    messages: messages,
  };

    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(async () => {
        await Log.create(object);
        mongoose.connection.close();
      })
      .catch((error) => {
        console.log(
          `\x1b[41m%s\x1b[0m%s\x1b[33m%s\x1b[0m`,
          ` ERROR `,
          ` hermodr.ts`,
          ` ${date} `,
          ` ${error}`
        );
      });
}

var Hermodr = {
  log: (marker: string, ...messages) => {
    let date = formattedDateTime(new Date());
    let level = "LOG";

    makeLog(level, marker, date, messages);
  },
  debug: (marker: string, ...messages) => {
    let date = formattedDateTime(new Date());
    let level = "DEBUG";

    makeLog(level, marker, date, messages);
  },
  warn: (marker: string, ...messages) => {
    let date = formattedDateTime(new Date());
    let level = "WARN";

    makeLog(level, marker, date, messages);
  },
  error: (marker: string, ...messages) => {
    let date = formattedDateTime(new Date());
    let level = "ERROR";

    makeLog(level, marker, date, messages);
  },
};

module.exports = Hermodr;
