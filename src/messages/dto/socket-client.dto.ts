export class SocketClientDto {
  userData?: {
    chatid: string;
    username: string;
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
  emit(message: string, data: any): any {
    return;
  }
}
