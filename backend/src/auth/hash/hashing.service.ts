//um class abstrata apensas para servir como um tipo
export abstract class HashingServiceProtocol {
  abstract hash(password: string): Promise<string>;

  abstract compare(password: string, passwordHash: string): Promise<boolean>;
}