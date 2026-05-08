import { msg } from '@lingui/core/macro';
import { redirect } from 'react-router';

import {
  IS_GOOGLE_SSO_ENABLED,
  IS_MICROSOFT_SSO_ENABLED,
  IS_OIDC_SSO_ENABLED,
} from '@documenso/lib/constants/auth';
import { env } from '@documenso/lib/utils/env';
import { isValidReturnTo, normalizeReturnTo } from '@documenso/lib/utils/is-valid-return-to';
import { prisma } from '@documenso/prisma';

import { SignUpForm } from '~/components/forms/signup';
import { appMetaTags } from '~/utils/meta';

import type { Route } from './+types/signup';

export function meta() {
  return appMetaTags(msg`Sign Up`);
}

export async function loader({ request }: Route.LoaderArgs) {
  const NEXT_PUBLIC_DISABLE_SIGNUP = env('NEXT_PUBLIC_DISABLE_SIGNUP');

  const url = new URL(request.url);
  const inviteToken = url.searchParams.get('inviteToken') ?? undefined;

  // SSR env variables.
  const isGoogleSSOEnabled = IS_GOOGLE_SSO_ENABLED;
  const isMicrosoftSSOEnabled = IS_MICROSOFT_SSO_ENABLED;
  const isOIDCSSOEnabled = IS_OIDC_SSO_ENABLED;

  // Open registration is gated by NEXT_PUBLIC_DISABLE_SIGNUP, but invitees
  // arriving via /organisation/invite/<token> still need to create an account.
  // Allow the signup flow when the request carries a still-valid invite token;
  // otherwise fall back to the redirect.
  if (NEXT_PUBLIC_DISABLE_SIGNUP === 'true') {
    const invite = inviteToken
      ? await prisma.organisationMemberInvite.findUnique({
          where: { token: inviteToken },
          select: { id: true },
        })
      : null;

    if (!invite) {
      throw redirect('/signin');
    }
  }

  let returnTo = url.searchParams.get('returnTo') ?? undefined;

  returnTo = isValidReturnTo(returnTo) ? normalizeReturnTo(returnTo) : undefined;

  return {
    isGoogleSSOEnabled,
    isMicrosoftSSOEnabled,
    isOIDCSSOEnabled,
    returnTo,
  };
}

export default function SignUp({ loaderData }: Route.ComponentProps) {
  const { isGoogleSSOEnabled, isMicrosoftSSOEnabled, isOIDCSSOEnabled, returnTo } = loaderData;

  return (
    <SignUpForm
      className="w-screen max-w-screen-2xl px-4 md:px-16 lg:-my-16"
      isGoogleSSOEnabled={isGoogleSSOEnabled}
      isMicrosoftSSOEnabled={isMicrosoftSSOEnabled}
      isOIDCSSOEnabled={isOIDCSSOEnabled}
      returnTo={returnTo}
    />
  );
}
