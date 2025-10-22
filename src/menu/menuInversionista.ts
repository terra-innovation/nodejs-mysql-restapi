import type { UsuarioConRoles } from "#src/types/Prisma.types.js";

export const generarMenuInversionista = (usuario: UsuarioConRoles) => {
  const ispersonavalidated = usuario?.ispersonavalidated;

  const menuFactoringElectronico = {
    id: "inversionista-group-factoring-electronico",
    title: "Factorgin",
    icon: "IdcardOutlined",
    type: "group",
    children: [
      {
        id: "inversionista-factoring-factoring-lista",
        title: "Oportunidades",
        type: "item",
        url: "/inversionista/factoring/oportunidades",
        icon: "FundOutlined",
        breadcrumbs: true,
      },
    ],
  };

  const menuAdministracion = {
    id: "inversionista-group-administracion",
    title: "Administración",
    icon: "IdcardOutlined",
    type: "group",
    children: [
      {
        id: "inversionista-cuentas-bancarias",
        title: "Cuentas bancarias",
        type: "item",
        url: "/inversionista/inversionistacuentabancaria/lista",
        icon: "BankOutlined",
        breadcrumbs: true,
      },
    ],
  };

  const menuTitulo = {
    id: "inversionista-menu",
    type: "group",
    title: "Menu Inversionista",
  };

  return [
    ...(ispersonavalidated
      ? [
          {
            id: "inversionista-divider-1",
            type: "group",
          },
          menuTitulo,
          menuFactoringElectronico,
          menuAdministracion,
        ]
      : []),
  ];
};
