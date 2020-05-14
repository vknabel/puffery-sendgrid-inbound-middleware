// @ts-check

const Hapi = require("@hapi/hapi");
const fetch = require("node-fetch");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
    debug: {
      log: ["*"],
      request: ["*"],
    },
    router: {
      stripTrailingSlash: true,
    },
  });

  server.route({
    method: "POST",
    path: "/inbound",
    handler: async (request, h) => {
      console.log("POST /inbound");
      // @ts-ignore
      var payload = { ...request.payload };

      for (const propName in payload) {
        try {
          payload[propName] = JSON.parse(payload[propName]);
        } catch (error) {
          continue;
        }
      }

      return fetch(process.env.PUFFERY_NOTIFY_ADDRESS, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
        .then((response) => {
          console.log("response", response);
          if (response.ok) {
            return "Success";
          } else {
            throw response;
          }
        })
        .catch((error) => {
          console.log("error", error);
          throw error;
        });
    },
  });

  server.events.on("response", function (request) {
    console.log(
      request.info.remoteAddress +
        ": " +
        request.method.toUpperCase() +
        " " +
        request.path +
        " --> " +
        // @ts-ignore
        request.response.statusCode
    );
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
