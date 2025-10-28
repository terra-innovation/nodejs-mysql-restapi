import type { UsuarioConRoles } from "#src/types/Prisma.types.js";

export const generarMenuEmpresario = (usuario: UsuarioConRoles) => {
  const ispersonavalidated = usuario?.ispersonavalidated;

  const menuFactoringElectronico = {
    id: "empresario-group-factoring-electronico",
    title: "Factorgin Electrónico",
    icon: "IdcardOutlined",
    type: "group",
    children: [
      {
        id: "empresario-vendes-facturas",
        title: "Vender factura",
        type: "item",
        url: "/empresario/factoring/nuevo",
        icon: "UploadOutlined",
        breadcrumbs: true,
      },
      {
        id: "empresario-factoring-factoring-lista",
        title: "Operaciones",
        type: "item",
        url: "/empresario/factoring/lista",
        icon: "TransactionOutlined",
        breadcrumbs: true,
      },
    ],
  };

  const menuAdministracion = {
    id: "empresario-group-administracion",
    title: "Administración",
    icon: "IdcardOutlined",
    type: "group",
    children: [
      {
        id: "empresario-cuentas-bancarias",
        title: "Cuentas bancarias",
        type: "item",
        url: "/empresario/empresacuentabancaria/lista",
        icon: "BankOutlined",
        breadcrumbs: true,
      },
      {
        id: "empresario-contactos",
        title: "Contactos",
        type: "item",
        url: "/empresario/contacto/lista",
        icon: "ContactsOutlined",
        breadcrumbs: true,
      },
      {
        id: "empresario-empresas",
        title: "Empresas",
        type: "item",
        url: "/empresario/empresa/lista",
        icon: "ContactsOutlined",
        breadcrumbs: true,
      },
    ],
  };

  const menuTitulo = {
    id: "empresario-menu",
    type: "group",
    title: "Menu Empresario",
  };

  return [
    ...(ispersonavalidated
      ? [
          {
            id: "empresario-divider-1",
            type: "group",
          },
          menuTitulo,
          menuFactoringElectronico,
          menuAdministracion,
        ]
      : []),
  ];
};
