FROM node:10

MAINTAINER gautigadu091@gmail.com
USER root

# Create app directory
WORKDIR /app
ADD . /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
RUN apt-get update || : && apt-get install python3 -y
RUN apt-get install -y python3-pip
RUN pip3 install sklearn
RUN pip3 install pandas
# If you are building your code for production
# RUN npm ci --only=production



EXPOSE 8080
CMD [ "node", "app.js" ]
