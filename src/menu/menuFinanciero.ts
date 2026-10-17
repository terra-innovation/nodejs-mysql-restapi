import type { UsuarioConRoles } from "#src/types/Prisma.types.js";

export const generarMenuFinanciero = (usuario: UsuarioConRoles) => {
  const ispersonavalidated = usuario?.ispersonavalidated;

  const menuSBS = {
    id: "financiero-group-sbs",
    title: "SBS",
    icon: "IdcardOutlined",
    type: "group",
    children: [
      {
        id: "financiero-factoring-empresa",
        title: "Factoring empresa",
        type: "collapse",
        icon: "ClusterOutlined",
        children: [
          {
            id: "financiero-factoring-pendientes-factura-cedente",
            title: "Pendientes de facturar al cedente",
            type: "item",
            url: "/financiero/servicio/factoring/factoring/pendientes-factura-cedente",
            breadcrumbs: true,
          },
          {
            id: "financiero-factoring-pendientes-detraccion",
            title: "Pendientes de pago de detracción",
            type: "item",
            url: "/financiero/servicio/factoring/factoring/pendientes-detraccion",
            breadcrumbs: true,
          },
          {
            id: "financiero-factoring-factoring-lista",
            title: "Operaciones",
            type: "item",
            url: "/financiero/servicio/factoring/factoring/lista",
            breadcrumbs: true,
          },
        ],
      },
      {
        id: "financiero-sbs-tipo_de_cambio",
        title: "SBS Tipo de cambio",
        type: "item",
        url: "/financiero/sbstipocambio/lista",
        icon: "BankOutlined",
        breadcrumbs: true,
      },
      {
        id: "financiero-sunat-tipo_de_cambio",
        title: "Sunat Tipo de cambio",
        type: "item",
        url: "/financiero/sunattipocambio/lista",
        icon: "BankOutlined",
        breadcrumbs: true,
      },
    ],
  };

  const menuTitulo = {
    id: "financiero-menu",
    type: "group",
    title: "Menu Financiero",
  };

  const menuBanca = {
    id: "financiero-transacciones-bancarias",
    title: "Sincronización de transacciones bancarias",
    type: "collapse",
    icon: "BankOutlined",
    children: [
      { id: "financiero-banco-origen", title: "Datos del origen remoto", type: "item", url: "/financiero/transaccionbancaria/origen", breadcrumbs: true },
      { id: "financiero-banco-movimientos", title: "Transacciones bancarias", type: "item", url: "/financiero/transaccionbancaria/movimientos", breadcrumbs: true },
      { id: "financiero-banco-cuentas", title: "Cuentas de origen", type: "item", url: "/financiero/transaccionbancaria/cuentas", breadcrumbs: true },
      { id: "financiero-banco-sincronizar", title: "Sincronizar manualmente", type: "item", url: "/financiero/transaccionbancaria/sincronizar", breadcrumbs: true },
      { id: "financiero-banco-ejecuciones", title: "Ejecuciones y log", type: "item", url: "/financiero/transaccionbancaria/ejecuciones", breadcrumbs: true },
      { id: "financiero-banco-incidencias", title: "Incidencias", type: "item", url: "/financiero/transaccionbancaria/incidencias", breadcrumbs: true },
      { id: "financiero-banco-historial", title: "Historial de cambios", type: "item", url: "/financiero/transaccionbancaria/historial", breadcrumbs: true },
    ],
  };

  return [
    ...(ispersonavalidated
      ? [
          {
            id: "financiero-divider-1",
            type: "group",
          },
          menuTitulo,
          menuSBS,
          { id: "financiero-group-banca", type: "group", children: [menuBanca] },
        ]
      : []),
  ];
};
