const menuMantenimiento = {
  id: "admin-group-mantenimiento",
  title: "Mentenimiento",
  type: "group",
  icon: "dashboard",
  children: [
    {
      id: "admin-factoring-empresa",
      title: "Factoring empresa",
      type: "collapse",
      icon: "dashboard",
      children: [
        {
          id: "admin-factoring-empresa-verificacion-lista",
          title: "Verificación empresa",
          type: "item",
          url: "/admin/servicio/factoring/empresa/verificacion/lista",
          breadcrumbs: true,
        },
        {
          id: "admin-factoring-factoring-lista",
          title: "Operaciones",
          type: "item",
          url: "/admin/servicio/factoring/factoring/lista",
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "admin-factoring-inversionista",
      title: "Factoring inversionista",
      type: "collapse",
      icon: "dashboard",
      children: [
        {
          id: "admin-factoring-inversionista-verificacion-lista",
          title: "Verificación inversionista",
          type: "item",
          url: "/admin/servicio/factoring/inversionista/verificacion/lista",
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "admin-mantenimiento-cuentas-bancarias",
      title: "Mantenimiento",
      type: "collapse",
      icon: "dashboard",
      children: [
        {
          id: "admin-mantenimiento-empresa-cuentas-bancarias",
          title: "Empresas cuentas bancarias",
          type: "item",
          url: "/admin/empresacuentabancaria/lista",
          breadcrumbs: true,
        },
        {
          id: "admin-mantenimiento-inversionista-cuentas-bancarias",
          title: "Inversionistas cuentas bancarias",
          type: "item",
          url: "/admin/inversionistacuentabancaria/lista",
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
          title: "Verificación persona",
          type: "item",
          url: "/admin/personaverificacion/lista",
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
