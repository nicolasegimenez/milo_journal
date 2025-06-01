// useIC.js - Hook para conectar React con backend Motoko en ICP

import { useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../src/declarations/milo_journal_backend';

const useIC = () => {
  const [actor, setActor] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const connect = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: async () => {
        const identity = await authClient.getIdentity();
        const agent = new HttpAgent({ identity });

        if (import.meta.env.DFX_NETWORK !== 'ic') {
          await agent.fetchRootKey(); // Solo en local
        }

        const actor = Actor.createActor(idlFactory, {
          agent,
          canisterId
        });

        setIdentity(identity);
        setActor(actor);
        setIsAuthenticated(true);
      }
    });
  };

  return { actor, identity, isAuthenticated, connect };
};

export default useIC;

