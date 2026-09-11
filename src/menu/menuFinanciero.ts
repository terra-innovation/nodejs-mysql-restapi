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

  return [
    ...(ispersonavalidated
      ? [
          {
            id: "financiero-divider-1",
            type: "group",
          },
          menuTitulo,
          menuSBS,
        ]
      : []),
  ];
};
