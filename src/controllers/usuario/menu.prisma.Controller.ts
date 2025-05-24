import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
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

  log.debug(line(), "session_user", req.session_user.usuario._idusuario);

  const session_idusuario = req.session_user.usuario._idusuario;
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

  const menuInversionistaX = [];
  const menuItems = {
    items: [menuDasboard, ...menuInversionista.menuInversionista, ...menuUsuario.menuUsuario, ...menuEmpresario.menuEmpresario, ...menuAdmin.menuAdmin, ...menuInversionistaX],
  };
  response(res, 201, menuItems);
};
