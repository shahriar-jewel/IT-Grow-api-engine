
// System
import path from "path";
import fs from "fs";
import { exit } from "process";

// Core
import { mongoInit } from "./init";
import { Application } from "./core/Application";
import { Config } from "./core/Config";

// Providers
import { DataProvider } from "./providers/DataProvider";

// Formatters
import { dateFormatter } from "./ftms/date";

// Controllers
import { DataController } from "./controllers/DataController";

// Crons
import { SendReportMail } from "./crons/SendReportMail";

// config
const CONFIG_FILE = "config.json";

if (!fs.existsSync(CONFIG_FILE)) {
    console.warn(`Can't find '${CONFIG_FILE}' please make sure config file is present in the current directory`);
    exit(0);
}

const APP_CONFIG: Config = new Config(JSON.parse(fs.readFileSync(CONFIG_FILE).toString()));

// Initialize mongo db
mongoInit(APP_CONFIG.mongoUrl);

const app = new Application(APP_CONFIG);

app.viewDir("views");
app.viewEngine("pug");
app.setStatic(path.join(__dirname, "public"), { maxAge: 0 }); // 31557600000 turned off caching for now

app.set("DataProvider", new DataProvider());

// Add any formatters, you can access it by fmt.date in views like fmt.date.ymd()
app.setFormatter("date", dateFormatter);

// Lets register the controllers
app.registerController(DataController);

// start the express server
app.listen(APP_CONFIG.port, () => {
    console.log(`server started at http://localhost:${APP_CONFIG.port}`);
});