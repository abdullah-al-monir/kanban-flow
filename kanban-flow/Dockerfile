FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM deps AS build
WORKDIR /app
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
