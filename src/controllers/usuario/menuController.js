import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as menuAdmin from "#src/menu/menuAdmin.js";
import * as menuEmpresario from "#src/menu/menuEmpresario.js";
import * as menuUsuario from "#src/menu/menuUsuario.js";

export const getMenu = async (req, res) => {
  logger.debug(line(), "controller::getMenu");
  const transaction = await sequelizeFT.transaction();
  try {
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
    await transaction.commit();
    response(res, 201, menuItems);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
