import type { UsuarioConRoles } from "#src/types/Prisma.types.js";

export const generarMenuAdmin = (usuario: UsuarioConRoles) => {
  const ispersonavalidated = usuario?.ispersonavalidated;

  const menuMantenimiento = {
    id: "admin-group-mantenimiento",
    title: "Mentenimiento",
    type: "group",
    icon: "ToolOutlined",
    children: [
      {
        id: "admin-factoring-empresa",
        title: "Factoring empresa",
        type: "collapse",
        icon: "ClusterOutlined",
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
        icon: "FundOutlined",
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
        icon: "BuildOutlined",
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
        icon: "TeamOutlined",
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

  const menuPaginas = {
    id: "group-paginas",
    title: "Páginas",
    type: "group",
    children: [
      {
        id: "authentication",
        title: "Autenticación",
        type: "collapse",
        icon: "LoginOutlined",
        children: [
          {
            id: "login",
            title: "Login",
            type: "item",
            url: "/auth/login",
            target: true,
          },
          {
            id: "register",
            title: "Registro",
            type: "item",
            url: "/auth/register",
            target: true,
          },
          {
            id: "Recuperar contraseña",
            title: "forgot-password",
            type: "item",
            url: "/auth/forgot-password",
            target: true,
          },
          {
            id: "Restablecer contraseña",
            title: "reset-password",
            type: "item",
            url: "/auth/reset-password",
            target: true,
          },
          {
            id: "check-mail",
            title: "Revisa tu correo",
            type: "item",
            url: "/auth/check-mail",
            target: true,
          },
          {
            id: "code-verification",
            title: "Código de verificación",
            type: "item",
            url: "/auth/code-verification",
            target: true,
          },
          {
            id: "token-verification-password",
            title: "Token verificación password",
            type: "item",
            url: "/auth/token-verification-password",
            target: true,
          },
          {
            id: "token-invalid-password",
            title: "Token inválido password",
            type: "item",
            url: "/auth/token-invalid-password",
            target: true,
          },
        ],
      },
      {
        id: "maintenance",
        title: "Mantenimiento",
        type: "collapse",
        icon: "RocketOutlined",
        isDropdown: true,
        children: [
          {
            id: "error-404",
            title: "Error 404",
            type: "item",
            url: "/maintenance/404",
            target: true,
          },
          {
            id: "error-500",
            title: "Error 500",
            type: "item",
            url: "/maintenance/500",
            target: true,
          },
          {
            id: "coming-soon",
            title: "Coming soon",
            type: "item",
            url: "/maintenance/coming-soon",
            target: true,
          },
          {
            id: "under-construction",
            title: "Under construction",
            type: "item",
            url: "/maintenance/under-construction",
            target: true,
          },
        ],
      },
    ],
  };

  const menuTitulo = {
    id: "admin-menu",
    type: "group",
    title: "Menu Administrador",
  };

  return [
    ...(ispersonavalidated
      ? [
          {
            id: "admin-divider-1",
            type: "group",
          },
          menuTitulo,
          menuMantenimiento,
          menuPaginas,
        ]
      : []),
  ];
};
