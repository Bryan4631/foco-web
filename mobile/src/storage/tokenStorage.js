import * as SecureStore from 'expo-secure-store';

// El token JWT se guarda con expo-secure-store:
//   - Android: Keystore (cifrado por el sistema)
//   - iOS: Keychain
// NO se usa AsyncStorage porque guarda en texto plano.
const KEY = 'foco_token';

export const saveToken = (token) => SecureStore.setItemAsync(KEY, token);
export const getToken = () => SecureStore.getItemAsync(KEY);
export const clearToken = () => SecureStore.deleteItemAsync(KEY);
