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
      url: "/empresario/cuentabancaria/lista",
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
  menuAdministracion,
];
