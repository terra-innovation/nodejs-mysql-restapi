import * as menuAdmin from "#src/menu/menuAdmin.js";
import * as menuEmpresario from "#src/menu/menuEmpresario.js";
import * as menuFinanciero from "#src/menu/menuFinanciero.js";
import * as menuInversionista from "#src/menu/menuInversionista.js";
import * as menuUsuario from "#src/menu/menuUsuario.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getMenuService = (session_usuario: any) => {
  log.debug(line(), "service::getMenuService");

  const ordenMenu = [
    { idrol: 5, menu: menuUsuario.generarMenuUsuario(session_usuario) }, // Usuario
    { idrol: 2, menu: menuAdmin.generarMenuAdmin(session_usuario) }, // Admin
    { idrol: 6, menu: menuFinanciero.generarMenuFinanciero(session_usuario) }, // Financiero
    { idrol: 3, menu: menuEmpresario.generarMenuEmpresario(session_usuario) }, // Empresario
    { idrol: 4, menu: menuInversionista.generarMenuInversionista(session_usuario) }, // Inversionista
  ];

  const menuInversionistaX: any[] = [];
  const menuItems: { items: any[] } = {
    items: [],
  };

  const rolesUsuario = session_usuario?.usuario_roles?.map((rol: any) => rol.idrol) ?? [];

  // Agregar menús según el orden fijo y si el usuario tiene el rol
  for (const item of ordenMenu) {
    if (rolesUsuario.includes(item.idrol)) {
      menuItems.items.push(...(item.menu as any));
    }
  }
  menuItems.items.push(...menuInversionistaX);

  return menuItems;
};
