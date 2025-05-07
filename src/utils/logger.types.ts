import { TransformableInfo } from "logform";

export interface Line {
  ruta: string;
  archivo: string;
  linea: string;
  columna: string;
}

export interface Log extends TransformableInfo {
  timestamp: string;
  level: string;
  message: string;
  ms?: string;
  file?: Line;
}
