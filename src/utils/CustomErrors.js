export class ArchivoError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.statusCode = status;
  }
}
export class ClientError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.statusCode = status;
  }
}

export class ConexionError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.statusCode = status;
  }
}

export class AuthClientError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.statusCode = status;
  }
}
