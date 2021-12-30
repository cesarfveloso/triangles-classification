declare global {
  //eslint-disable-next-line no-var
  var testRequest: import('supertest').SuperTest<import('supertest').Test>;
  // eslint-disable-next-line no-var
  var db: import('aws-sdk').DynamoDB;
}

export {};
