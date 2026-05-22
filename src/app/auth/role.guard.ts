import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { AuthService } from './auth.service';
import { loginRouteForRoles, type AppRole } from './auth-role.util';

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
