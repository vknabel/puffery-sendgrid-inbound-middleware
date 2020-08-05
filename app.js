// @ts-check

const Hapi = require("@hapi/hapi");
const fetch = require("node-fetch");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
    router: {
      stripTrailingSlash: true,
    },
  });

  server.route({
    method: "POST",
    path: "/inbound",
    options: {
      payload: {
        parse: true,
        output: "data",
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
    },
    handler: async (request, h) => {
      console.log("POST /inbound");
      // @ts-ignore
      var payload = { ...request.payload };
      // console.log(`PAYLOAD ${JSON.stringify(payload)}`);

      for (const propName in payload) {
        try {
          payload[propName] = JSON.parse(payload[propName]);
        } catch (error) {
          continue;
        }
      }
      // console.log(`BODY ${JSON.stringify(payload)}`);
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
        .catch(
          /** @param {Response} error */
          async (error) => {
            console.log(`==> POST ${process.env.PUFFERY_NOTIFY_ADDRESS}\n${JSON.stringify(payload)}`);
            console.log("<==", error.status, error.statusText, await error.text());
            return h.response(error.text()).code(error.status)
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
