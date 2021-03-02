# !NOTE: If you create a local build you will be missing the config files.

## To create config files

1.  Navigate to root directory
2.  Create folder <config>
3.  Create db.js

    - Paste the following code within db.js:

    ```javascript
    const mongoose = require("mongoose");
    const config = require("config");
    const db = config.get("mongoURI");

    const connectDB = async () => {
      try {
        await mongoose.connect(db, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
        });
        console.log("MongoDB Connected...");
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    };
    module.exports = connectDB;
    ```

4.  Create default.json - Paste the following code within default.json
    ```json
    {
    "mongoURI": "mongodb+srv://<username>:<password>@devd.7tbiq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    "jwtSecret": <"secret-token">
    }
    ```
