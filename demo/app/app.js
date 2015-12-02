var application = require("application");
application.mainModule = "main-page";
application.cssFile = "./app.css";

if(application.ios) {
  GMSServices.provideAPIKey("AIzaSyAtRVvG3Be3xXiZFR7xp-K-9hy4nZ4hMFs");
}

application.start();
