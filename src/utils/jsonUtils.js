// Función para remover atributos de un json
export const removeAttributes = (json, rules) => {
  if (typeof json !== "object" || json === null) {
    return json;
  }

  if (Array.isArray(json)) {
    return json.map((item) => removeAttributes(item, rules));
  }

  const newObj = {};
  for (const key in json) {
    if (Object.prototype.hasOwnProperty.call(json, key)) {
      const value = json[key];
      if (!rules.some((rule) => (typeof rule === "string" && rule === key) || (rule instanceof RegExp && rule.test(key)))) {
        newObj[key] = removeAttributes(value, rules);
      }
    }
  }
  return newObj;
};

// Función para ofuscar el correo electrónico
export function ofuscarAtributos(objeto, atributosOfuscar, patron) {
  // Copia profunda del objeto para evitar modificar el objeto original
  const objetoOfuscado = JSON.parse(JSON.stringify(objeto));

  // Función recursiva para ofuscar atributos en todos los niveles del objeto
  function ofuscarRecursivo(objeto) {
    for (const clave in objeto) {
      if (Object.prototype.hasOwnProperty.call(objeto, clave)) {
        // Si el valor es un objeto, llama recursivamente a la función de ofuscación
        if (typeof objeto[clave] === "object") {
          ofuscarRecursivo(objeto[clave]);
        } else if (atributosOfuscar.includes(clave)) {
          // Si el atributo debe ser ofuscado, aplica el patrón de ofuscación
          const valor = objeto[clave];
          let valorOfuscado;
          if (patron === PATRON_OFUSCAR_EMAIL) {
            valorOfuscado = ofuscarEmail(valor);
          } else if (patron === PATRON_OFUSCAR_CUENTA) {
            valorOfuscado = ofuscarCuenta(valor);
          } else if (patron === PATRON_OFUSCAR_TELEFONO) {
            valorOfuscado = ofuscarTelefono(valor);
          } else if (patron === PATRON_OFUSCAR_NOMBRE) {
            valorOfuscado = ofuscarNombre(valor);
          } else {
            // Si el patrón no es reconocido, mantener el valor sin cambios
            valorOfuscado = valor;
          }
          // Asigna el valor ofuscado al atributo en el objeto
          objeto[clave] = valorOfuscado;
        }
      }
    }
  }

  // Llama a la función recursiva para ofuscar atributos en todos los niveles del objeto
  ofuscarRecursivo(objetoOfuscado);

  // Devuelve el objeto JSON ofuscado
  return objetoOfuscado;
}

export function ofuscarEmail(email) {
  if (!email.includes("@")) {
    return email;
  }

  const [nombreUsuario, dominio] = email.split("@");
  if (nombreUsuario.length < 3) {
    // Ofuscar el dominio con asteriscos y mantener el nombre de usuario
    return nombreUsuario + "@" + "*".repeat(dominio.length);
  } else {
    // Ofuscar el nombre de usuario como antes
    const primeraLetra = nombreUsuario.charAt(0);
    const ultimaLetra = nombreUsuario.charAt(nombreUsuario.length - 1);
    const medioOfuscado = "*".repeat(nombreUsuario.length - 2);
    return primeraLetra + medioOfuscado + ultimaLetra + "@" + dominio;
  }
}

export function ofuscarCuenta(cuenta) {
  // Verifica si el texto tiene al menos 10 caracteres
  if (cuenta.length < 5) {
    return cuenta;
  }

  // Extrae los últimos 4 dígitos del texto
  const ultimosCuatroDigitos = cuenta.slice(-4);

  // Genera una cadena de asteriscos de longitud 6 seguida de un espacio
  const asteriscos = "*".repeat(6);

  // Devuelve la cadena de asteriscos seguida de los últimos cuatro dígitos
  return `${asteriscos} ${ultimosCuatroDigitos}`;
}

export function ofuscarTelefono(telefono) {
  // Verifica si el texto tiene al menos 10 caracteres
  if (telefono.length < 3) {
    return telefono;
  }

  // Extrae los últimos 4 dígitos del texto
  const ultimosDosDigitos = telefono.slice(-2);

  // Genera una cadena de asteriscos de longitud 6 seguida de un espacio
  const asteriscos = "*".repeat(6);

  // Devuelve la cadena de asteriscos seguida de los últimos cuatro dígitos
  return `${asteriscos} ${ultimosDosDigitos}`;
}

function ofuscarNombre(nombre) {
  // Dividir el nombre en palabras
  const palabras = nombre.split(" ");

  // Mapear sobre las palabras y ofuscar cada una
  const nombresOfuscados = palabras.map((palabra) => {
    // Verificar si la palabra tiene menos de 3 caracteres
    if (palabra.length < 3) {
      return palabra; // Devolver la misma palabra sin ofuscar
    }
    // Extraer los dos primeros caracteres de la palabra
    const primerosDosCaracteres = palabra.substring(0, 2);
    // Calcular la cantidad de asteriscos necesarios
    const asteriscos = "*".repeat(palabra.length - 2);
    // Combinar los dos primeros caracteres con los asteriscos
    return primerosDosCaracteres + asteriscos;
  });

  // Unir las palabras ofuscadas con un espacio
  return nombresOfuscados.join(" ");
}

export const PATRON_OFUSCAR_EMAIL = "OFUSCAR_EMAIL";
export const PATRON_OFUSCAR_CUENTA = "OFUSCAR_CUENTA";
export const PATRON_OFUSCAR_TELEFONO = "OFUSCAR_TELEFONO";
export const PATRON_OFUSCAR_NOMBRE = "OFUSCAR_NOMBRE";
