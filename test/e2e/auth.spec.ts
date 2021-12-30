describe('Triangles Functional Tests', () => {
  describe('Given some user wants to obtain a token', () => {
    test('When they make a request to api endpoint token', async () => {
      const responseToken = await global.testRequest.post('/auth/token').send({
        username: 'DEFAULT_USER',
        password: '12345',
      });

      // Then he obtain a access token
      expect(responseToken.status).toBe(200);
      expect(responseToken.body).toEqual(
        expect.objectContaining({
          'x-access-token': expect.any(String),
        })
      );
    });
    test('When they make a request to api endpoint token with an invalid user', async () => {
      const responseToken = await global.testRequest.post('/auth/token').send({
        username: 'INVALID_USER',
        password: '12345',
      });

      // Then he receive a 401 error
      expect(responseToken.status).toBe(401);
      expect(responseToken.body).toEqual(
        expect.objectContaining({
          code: 401,
          error: 'Unauthorized',
          message: 'User/password does not match',
        })
      );
    });
    test('When they make a request to api endpoint token with an invalid pass', async () => {
      const responseToken = await global.testRequest.post('/auth/token').send({
        username: 'INVALID_USER',
        password: '54321',
      });

      // Then he receive a 401 error
      expect(responseToken.status).toBe(401);
      expect(responseToken.body).toEqual(
        expect.objectContaining({
          code: 401,
          error: 'Unauthorized',
          message: 'User/password does not match',
        })
      );
    });
  });
});
