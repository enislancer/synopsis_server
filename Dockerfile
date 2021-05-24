FROM node:10

RUN apt-get update -y && apt-get install vim -y


# Add the user UID:1000, GID:1000, home at /app
#RUN groupadd -r app -g 1000 && useradd -u 1000 -r -g app -m -d /app -s /sbin/nologin -c "App user" app && \
#    chmod 755 /app

# Set the working directory to app home directory
WORKDIR /app

# Specify the user to execute all commands below
#USER app

#RUN sudo chown -R $USER:$USER $HOME

# Specific app configuration
# RUN mkdir /app/logs

COPY package.json /app
RUN npm install && npm cache verify

COPY ecosystem.config.js /app

COPY wait-for-it.sh /app
RUN chmod +x wait-for-it.sh