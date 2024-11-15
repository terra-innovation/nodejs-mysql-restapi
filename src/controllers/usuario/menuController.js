import * as cuentabancariaDao from "../../daos/cuentabancariaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import * as menuAdmin from "../../menu/menuAdmin.js";
import * as menuEmpresario from "../../menu/menuEmpresario.js";
import * as menuUsuario from "../../menu/menuUsuario.js";

export const getMenu = async (req, res) => {
  logger.debug(line(), req.session_user.usuario._idusuario);

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

  const menuInversionista = [];
  const menuItems = {
    items: [menuDasboard, ...menuUsuario.menuUsuario, ...menuEmpresario.menuEmpresario, ...menuAdmin.menuAdmin, ...menuInversionista],
  };
  response(res, 201, menuItems);
};
