import type { UsuarioConRoles } from "#src/types/Prisma.types.js";

export const generarMenuUsuario = (usuario: UsuarioConRoles) => {
  const ispersonavalidated = usuario?.ispersonavalidated;

  const menuFormulario = {
    id: "usuario-group-formulario",
    title: "Formularios",
    icon: "IdcardOutlined",
    type: "group",
    children: [
      ...(ispersonavalidated
        ? [
            {
              id: "usuario-inicio",
              title: "Inicio",
              type: "item",
              url: "/usuario/inicio",
              icon: "HomeOutlined",
              breadcrumbs: false,
            },
            {
              id: "usuario-servicio-lista",
              title: "Servicios",
              type: "item",
              url: "/usuario/usuarioservicio/lista",
              icon: "AppstoreOutlined",
              breadcrumbs: true,
            },
          ]
        : []),
      // Solo mostrar esta opción si el usuario NO ha sido validado
      ...(!ispersonavalidated
        ? [
            {
              id: "usuario-verificacion-cuenta-usuario",
              title: "Verificación de cuenta",
              type: "item",
              url: "/usuario/persona/verificacion",
              icon: "SafetyCertificateOutlined",
              breadcrumbs: true,
            },
          ]
        : []),
    ],
  };

  const menuTitulo = {
    id: "usuario-menu",
    type: "group",
    title: "Menu Usuario",
  };

  return [
    {
      id: "usuario-divider-1",
      type: "group",
    },
    menuTitulo,
    menuFormulario,
  ];
};
