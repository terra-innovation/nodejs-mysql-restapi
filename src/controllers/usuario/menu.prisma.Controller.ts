import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as menuAdmin from "#src/menu/menuAdmin.js";
import * as menuEmpresario from "#src/menu/menuEmpresario.js";
import * as menuInversionista from "#src/menu/menuInversionista.js";
import * as menuUsuario from "#src/menu/menuUsuario.js";

export const getMenu = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getMenu");

  const session_idusuario = req.session_user.usuario.idusuario;
  log.debug(line(), "session_idusuario", session_idusuario);

  const menuDasboard = {
    id: "group-dashboard",
    title: "dashboard",
    type: "group",
    icon: "dashboard",
    children: [
      {
        id: "dashboard",
        title: "dashboard",
        type: "collapse",
        icon: "dashboard",
        children: [
          {
            id: "default",
            title: "default",
            type: "item",
            url: "/dashboard/default",
            breadcrumbs: false,
          },
          {
            id: "analytics",
            title: "analytics",
            type: "item",
            url: "/dashboard/analytics",
            breadcrumbs: false,
          },
        ],
      },
      {
        id: "components",
        title: "components",
        type: "item",
        url: "/components-overview/buttons",
        icon: "components",
        target: true,
        chip: {
          label: "new",
          color: "primary",
          size: "small",
          variant: "combined",
        },
      },
    ],
  };

  const ordenMenu = [
    { idrol: 2, menu: menuAdmin.menuAdmin }, // Admin
    { idrol: 3, menu: menuEmpresario.menuEmpresario }, // Empresario
    { idrol: 4, menu: menuInversionista.menuInversionista }, // Inversionista
    { idrol: 5, menu: menuUsuario.menuUsuario }, // Usuario
  ];

  const menuInversionistaX = [];
  const menuItems = {
    //items: [menuDasboard, ...menuInversionista.menuInversionista, ...menuUsuario.menuUsuario, ...menuEmpresario.menuEmpresario, ...menuAdmin.menuAdmin, ...menuInversionistaX],
    items: [menuDasboard],
  };

  const rolesUsuario = req.session_user.usuario.usuario_roles.map((rol: any) => rol.idrol);

  // Agregar menús según el orden fijo y si el usuario tiene el rol
  for (const item of ordenMenu) {
    if (rolesUsuario.includes(item.idrol)) {
      menuItems.items.push(...(item.menu as any));
    }
  }
  menuItems.items.push(...menuInversionistaX);
  response(res, 201, menuItems);
};
