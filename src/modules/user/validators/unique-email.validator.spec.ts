import { useContainer, validate, Validate } from 'class-validator';
import { Test, type TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { UniqueEmailValidator } from './unique-email.validator';
import { User } from '../user.model';

class UserDto {
  @Validate(IsUserAlreadyExistEmail)
  readonly email: string;

  constructor(email: string) {
    this.email = email;
  }
}

describe('IsUserAlreadyExistEmail', () => {
  const alreadyExistEmail = 'test-already@test.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniqueEmailValidator],
    })
      .useMocker(() => {
        return createMock<typeof User>({
          findOne: jest
            .fn()
            .mockImplementation((options: { where: UserDto }) => {
              if (options.where.email === alreadyExistEmail) {
                return createMock<User>();
              }
            }),
        });
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it.each([
    [alreadyExistEmail, 1],
    ['another@example.com', 0],
  ])(
    'should validate whether the user already exist by their email',
    async (email, errorsCount) => {
      const user = new UserDto(email);

      await expect(validate(user)).resolves.toHaveLength(errorsCount);
    },
  );
});