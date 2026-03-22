FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve@14

COPY web/ ./web/

EXPOSE 8000

# Serve the interactive web demo on port 8000
CMD ["serve", "web", "-l", "8000", "--no-clipboard"]

