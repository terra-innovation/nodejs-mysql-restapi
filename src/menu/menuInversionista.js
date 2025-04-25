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
      icon: "IdcardOutlined",
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
      icon: "IdcardOutlined",
      breadcrumbs: true,
    },
  ],
};

const menuTitulo = {
  id: "inversionista-menu",
  type: "group",
  title: "Menu Inversionista",
};

export const menuInversionista = [
  {
    id: "inversionista-divider-1",
    type: "group",
  },
  menuTitulo,
  menuFactoringElectronico,
  menuAdministracion,
];
