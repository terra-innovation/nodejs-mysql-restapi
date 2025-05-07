export interface SequelizeError extends Error {
  parent?: any; // `parent` puede ser un objeto con cualquier tipo de estructura, puedes ser más específico si sabes qué tipo tiene
}
