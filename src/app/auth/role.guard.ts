import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { AuthService } from './auth.service';
import { loginRouteForRoles, type AppRole } from './auth-role.util';

/** Solo permite acceso si hay sesión válida y el rol del token está en la lista. */
export function roleGuard(allowedRoles: AppRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const loginUrl = loginRouteForRoles(allowedRoles);

    return auth.loadSession().pipe(
      take(1),
      map((session) => {
        if (!session) {
          return router.createUrlTree([loginUrl]);
        }
        if (allowedRoles.includes(session.rol)) {
          return true;
        }
        return router.createUrlTree([auth.getHomeRoute(session.rol)]);
      }),
    );
  };
}

/** Páginas de login: si ya hay sesión, redirige al home del rol. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.loadSession().pipe(
    take(1),
    map((session) => {
      if (!session) return true;
      return router.createUrlTree([auth.getHomeRoute(session.rol)]);
    }),
  );
};

/** Login admin: si ya es admin, va al panel; si es otro rol, a su home. */
export const adminGuestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.loadSession().pipe(
    take(1),
    map((session) => {
      if (!session) return true;
      return router.createUrlTree([auth.getHomeRoute(session.rol)]);
    }),
  );
};
