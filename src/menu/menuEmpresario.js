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
      icon: "IdcardOutlined",
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
      icon: "IdcardOutlined",
      breadcrumbs: true,
    },
    {
      id: "empresario-contactos",
      title: "Contactos",
      type: "item",
      url: "/empresario/contacto/lista",
      icon: "IdcardOutlined",
      breadcrumbs: true,
    },
  ],
};

const menuTitulo = {
  id: "empresario-menu",
  type: "group",
  title: "Menu Empresario",
};

export const menuEmpresario = [
  {
    id: "empresario-divider-1",
    type: "group",
  },
  menuTitulo,
  menuFactoringElectronico,
  menuAdministracion,
];
