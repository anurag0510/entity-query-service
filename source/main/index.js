const express = require("express");

const log = require("./utility/logger");
const config = require("../../config/config");
const entityConsumer = require("./entity/entity-consumer");
// const userRouters = require('./apis/v1/users/user-router');

class Application {
  async _initDependencies() {
    await entityConsumer.initKafka();
  }

  async _start() {
    await this._initDependencies();

    const app = express();

    app.use(express.json());
    // app.use('/v1/users', userRouters);

    app.get("*", (request, response) => {
      response
        .status(404)
        .json({ message: `No such route '${request.url}' to respond.` });
    });

    app.listen(3000, () => {
      log.info(`Listening to port ${config.service_port}`);
    });
  }
}

new Application()._start();
