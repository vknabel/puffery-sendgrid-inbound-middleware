FROM node:12

COPY . /app/
WORKDIR /app

RUN /usr/local/bin/npm install

ENV PUFFERY_NOTIFY_ADDRESS=https://vapor.puffery.app/notify/inbound-email
CMD /usr/local/bin/node app.js