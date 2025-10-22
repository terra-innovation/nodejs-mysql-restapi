const menuFormulario = {
  id: "usuario-group-formulario",
  title: "Formularios",
  icon: "IdcardOutlined",
  type: "group",
  children: [
    {
      id: "usuario-inicio",
      title: "Inicio",
      type: "item",
      url: "/usuario/inicio",
      icon: "IdcardOutlined",
      breadcrumbs: false,
    },
    {
      id: "usuario-verificacion-cuenta-usuario",
      title: "Verificación de cuenta",
      type: "item",
      url: "/usuario/persona/verificacion",
      icon: "IdcardOutlined",
      breadcrumbs: true,
    },
    {
      id: "usuario-servicio-lista",
      title: "Servicios",
      type: "item",
      url: "/usuario/usuarioservicio/lista",
      icon: "IdcardOutlined",
      breadcrumbs: true,
    },
  ],
};

const menuTitulo = {
  id: "usuario-menu",
  type: "group",
  title: "Menu Usuario",
};

export const menuUsuario = [
  {
    id: "usuario-divider-1",
    type: "group",
  },
  menuTitulo,
  menuFormulario,
];
