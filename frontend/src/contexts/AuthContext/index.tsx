import { createContext, useEffect, useState } from 'react';
import { IAuthProvider, IContext, IUser } from './types';
import { getUserLocalStorage, LoginRequest, setUserlocalStorage } from './util';

export const AuthContext = createContext<IContext>({} as IContext);

export const AuthProvider = ({ children }: IAuthProvider) => {
  const [user, setUser] = useState<IUser | null>();

  useEffect(() => {
    const userLocal = getUserLocalStorage();
    console.log('1 ' + user);

    if (userLocal) {
      setUser(userLocal);
      console.log('2 ' + user);
    }

    console.log(user);
  }, []);

  async function authenticate(email: string, password: string) {
    const { status, data } = await LoginRequest(email, password);

    if (status == 401) throw new Error('Algo deu errado');

    const payload = { token: data.data.token, email };

    setUser(payload);
    setUserlocalStorage(payload);
  }

  function logout() {
    setUser(null);
    setUserlocalStorage(null);
  }

  return (
    <AuthContext.Provider value={{ ...user, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
