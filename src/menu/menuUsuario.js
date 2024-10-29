const menuFormulario = {
  id: "usuario-group-formulario",
  title: "Formularios",
  icon: "IdcardOutlined",
  type: "group",
  children: [
    {
      id: "usuario-verificacion-cuenta-usuario",
      title: "Verificación de cuenta",
      type: "item",
      url: "/empresario/cuentabancaria/lista",
      icon: "IdcardOutlined",
      breadcrumbs: true,
    },
  ],
};

const menuTitulo = {
  id: "usuario-menu",
  type: "group",
  title: "Menu EmUsuario",
};

export const menuUsuario = [
  {
    id: "usuario-divider-1",
    type: "group",
  },
  menuTitulo,
  menuFormulario,
];
