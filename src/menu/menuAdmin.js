const menuMantenimiento = {
  id: "admin-group-mantenimiento",
  title: "Mentenimiento",
  type: "group",
  icon: "dashboard",
  children: [
    {
      id: "admin-mantenimiento-cuentas-bancarias",
      title: "Mantenimiento",
      type: "collapse",
      icon: "dashboard",
      children: [
        {
          id: "admin-mantenimiento-cuentas-bancarias",
          title: "Cuentas bancarias",
          type: "item",
          url: "/admin/cuentabancaria/lista",
          breadcrumbs: true,
        },
        {
          id: "admin-mantenimiento-empresas",
          title: "Empresas",
          type: "item",
          url: "/admin/empresa/lista",
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "admin-persona",
      title: "Personas",
      type: "collapse",
      icon: "dashboard",
      children: [
        {
          id: "admin-persona-lista",
          title: "Personas",
          type: "item",
          url: "/admin/persona/lista",
          breadcrumbs: true,
        },
        {
          id: "admin-persona-verificacion",
          title: "Verificación",
          type: "item",
          url: "/admin/persona/verificacion",
          breadcrumbs: true,
        },
      ],
    },
  ],
};

const menuTitulo = {
  id: "admin-menu",
  type: "group",
  title: "Menu Admministrador",
};

export const menuAdmin = [
  {
    id: "admin-divider-1",
    type: "group",
  },
  menuTitulo,
  menuMantenimiento,
];
