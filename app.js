// @ts-check

const Hapi = require("@hapi/hapi");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
  });

  server.route({
    method: "POST",
    path: "/inbound",
    handler: async (request, h) => {
      // @ts-ignore
      var payload = { ...request.payload };

      for (const propName in payload) {
        try {
          payload[propName] = JSON.parse(payload[propName]);
        } catch (error) {
          continue;
        }
      }

      fetch(process.env.PUFFERY_NOTIFY_ADDRESS, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
        .then((response) => {
          console.log("response", response);
          if (response.ok) {
            h.response({ success: true });
          } else {
            h.response({
              success: false,
              error: { message: response },
            });
          }
        })
        .catch((error) => {
          console.log("error", error);
          h.response({
            success: false,
            error: error,
          });
        });
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
