FROM node:20-alpine AS dev-deps
WORKDIR /app
COPY package.json package.json 
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
EXPOSE 80
COPY --from=builder /app/dist/ujbm-front/browser /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]