export class SocketClientDto {
  userData?: {
    chatid?: string;
  };
  handshake?: {
    headers: {
      cookie: string;
    };
  };
  id?: string;
  join(value: string): Promise<void> {
    return;
  }
  rooms: any;
}
