import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { Authentication } from '../../auth/entities/autentication.entity';
import { User } from '../../user/entities/user.entity';

// Utilitarios de AuthnWeb

// Human-readable title for your website
const rpName = 'Sky Krono App';
// A unique identifier for your website
const rpID = process.env.RP_ID;

const rpIDArray = JSON.parse(process.env.RP_ID_ARRAY);
// The URL at which registrations and authentications should occur
const origin = JSON.parse(process.env.ORIGIN);

export function generateRegistrationOption(user: User, userAuthenticators: Authentication[]) {
  return generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id.toString(),
    userName: user.username,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'direct',
    authenticatorSelection: {
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
    extensions: {
      uvm: true,
    },
    // Prevent users from re-registering existing authenticators
    excludeCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID,
      type: 'public-key',
      transports: ['internal'],
      //   rpID : rpIDArray
    })),
  });
}

export async function verifyAuthWeb(body, expectedChallenge) {
  try {
    return await verifyRegistrationResponse({
      credential: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpIDArray,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function generateAuthenticationOption(userAuthenticators: Authentication[]) {
  return generateAuthenticationOptions({
    rpID,
    // Require users to use a previously-registered authenticator
    allowCredentials: userAuthenticators.map((_authenticator) => ({
      id: _authenticator.credentialID,
      type: 'public-key',
      transports: ['internal'],
      authenticatorSelection: {
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      //  rpID : rpIDArray
    })),
    userVerification: 'preferred',
  });
}

export async function verifyAuthenticationOption(body, expectedChallenge, authenticator) {
  try {
    return verifyAuthenticationResponse({
      credential: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpIDArray,
      authenticator,
    });
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
}
