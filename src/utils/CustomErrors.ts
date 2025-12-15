export class CORSError extends Error {
  public statusCode: number;
  constructor(message: string, status = 400) {
    super(message);
    this.statusCode = status;
  }
}
export class ArchivoError extends Error {
  public statusCode: number;
  constructor(message: string, status = 400) {
    super(message);
    this.statusCode = status;
  }
}
export class ClientError extends Error {
  public statusCode: number;
  constructor(message: string, status = 400) {
    super(message);
    this.statusCode = status;
  }
}

export class ConexionError extends Error {
  public statusCode: number;
  constructor(message: string, status = 400) {
    super(message);
    this.statusCode = status;
  }
}

export class AuthClientError extends Error {
  public statusCode: number;
  constructor(message: string, status = 400) {
    super(message);
    this.statusCode = status;
  }
}
