# Triangle Classification API

An api to classify some triangle into the following types:

- EQUILATERAL
- ISOSCELES
- SCALENE

## Flow

- Step1: Get your own token by passing DEFAULT_USER as username and 12345 as password
- Step2: Go classify your triangle by using POST /triangles/classification with x-access-token on headers
- Step3: Get your historical classifications by using GET /triagles/history with x-access-token on headers

## Endpoint Documentation

Go to /docs and you'll view the swagger

## Tests

- For unit tests:
```sh
npm install
npm run test:unit
```
- For functional tests:
```sh
npm install
npm run test:e2e
```
- For all tests:
```sh
npm install
npm test
```

## Creating infrastructure

```sh
export NODE_ENV=production
npm run deploy
```

## Executing the api

- For docker use:
```sh
docker build -t triangles-api .
docker run --env AWS_REGION=myregion AWS_REGION=myKey AWS_REGION=mySecret NODE_ENV=production -d -p 3000:3000 triangles-api
```

- For development env:
```sh
npm install
export AWS_REGION=myregion
export AWS_ACCESS_KEY_ID=myKey
export AWS_SECRET_ACCESS_KEY=mySecret
npm run start:dev
```

- For production env:
```sh
npm install --production
export AWS_REGION=myregion
export AWS_ACCESS_KEY_ID=myKey
export AWS_SECRET_ACCESS_KEY=mySecret
export NODE_ENV=production
npm run build
npm start
```