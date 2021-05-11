FROM node

WORKDIR /opt/Stremio/Addon

RUN chmod -R 777 /opt

USER node


COPY --chown=node:node ./jest.config.js .
COPY --chown=node:node ./package.json .
COPY --chown=node:node ./package-lock.json .
COPY --chown=node:node ./src src
COPY --chown=node:node ./test test
COPY --chown=node:node ./tsconfig.json .
COPY --chown=node:node ./beamup.json .
COPY --chown=node:node ./now.json .
COPY --chown=node:node ./wait /wait
COPY --chown=node:node ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /wait && \
    chmod +x /docker-entrypoint.sh

RUN npm install

EXPOSE 57841

ENTRYPOINT [ "/docker-entrypoint.sh" ]
CMD [ "start" ]