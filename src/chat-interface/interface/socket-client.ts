export interface ISocketClient {
  userData?: {
    roomId?: string;
    username?: string;
  };
  handshake?: {
    headers?: {
      cookie?: string;
    };
  };
  id: string;
  join(value: string): Promise<void>;

  rooms: any;
  emit(message: string, data: any): any;
}
