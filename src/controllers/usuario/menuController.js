import * as cuentabancariaDao from "../../daos/cuentabancariaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";

export const getMenu = async (req, res) => {
  //console.log(req.session_user.usuario._idusuario);

  const session_idusuario = req.session_user.usuario._idusuario;
  const menuAdmin = {
    dashboard: {
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
    },
  };

  response(res, 201, menuAdmin);
};
