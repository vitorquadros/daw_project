import { inject, injectable } from 'tsyringe';
import { getRepository } from 'typeorm';
import { User } from '../../Users/models/User';
import { v4 as uuid } from 'uuid';
import nodemailer from 'nodemailer';
// import { IAdressesRepository } from '../repositories/IAdressesRepository';
import { IUsersRepository } from '../repositories/IUsersRepository';
import { UserKey } from '../models/UserKey';

@injectable()
export class RegisterUsecase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository // @inject('AdressesRepository') // private adressesRepository: IAdressesRepository
  ) {}

  async register(email: string, redirectUrl: string): Promise<User> {
    if (await this.usersRepository.findByEmail(email)) {
      throw new Error('Email already exists');
    }

    const user = await this.usersRepository.registerUser(email);

    const keysRepository = getRepository(UserKey);
    const key = uuid();
    const userKey = keysRepository.create({ userId: user, key });
    await keysRepository.save(userKey);

    const link = `${redirectUrl.replace(/\/$/, '')}/${key}`;

    const transport = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '7c73252f3b2703',
        pass: '161a2c0cea727d'
      }
    });

    const message = {
      from: 'noreply@test.com',
      to: 'user@test.com',
      subject: 'Finalize seu cadastro',
      text: `Para finalizar seu cadastro acesse o link: ${link}`,
      html: `<p>Para finalizar seu cadastro acesse o link:</p> <a>${link}</a>`
    };

    transport.sendMail(message, (e) => console.log(e.message));

    return user;
  }

  async getUncompletedRegister(key: string) {
    const usersRepository = getRepository(User);

    const user = await usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.keys', 'key')
      .where('key.key = :key', { key })
      .getOne();

    return user;
  }
}
