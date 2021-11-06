import { Account } from '@src/models/account';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Accounts functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john2@mail.com',
    password: '1234',
  };

  let token: string;
  beforeEach(async () => {
    await Account.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());
  });

  describe('When creating a new account', () => {

    it.only('should successfully create a new account with encrypted password', async () => {
      const newAccount = {
        username: 'johndoe',
        password: '1234',
        social: 'instagram'
      }
      const response = await global.testRequest.post('/accounts/new').set({ 'x-access-token': token }).send(newAccount);

      expect(response.status).toBe(201);
      await expect(
        AuthService.comparePasswords(newAccount.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        {
          ...newAccount,
          ...{ id: expect.any(String) },
          ...{ password: expect.any(String) },
          ...{ user: expect.any(String) },
          ...{ username: expect.any(String) },
        }
      );
    });

    it('should return validation error when a field is invalid', async () => {
      const newAccount = {
        username: "John Doe",
        password: 123123,
        social: "my new social"
      }

      const response = await global.testRequest
        .post('/accounts/new')
        .set({ 'x-access-token': token })
        .send(newAccount);

      //tests will be broken, not middleware
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: 400,
        error: 'Bad Request',
        message: 'request.body.lat should be number',
      });
    });

    it.skip('should return 500 when there is any error other than validation error', async () => {
      //TODO think in a way to throw a 500
    });
  });
});