// useIC.js - Hook para conectar React con backend Motoko en ICP

import { useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/milo_journal_backend';

const canisterId = process.env.REACT_APP_BACKEND_CANISTER_ID || 'rrkah-fqaaa-aaaah-qcaaq-cai';

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

        if (process.env.NODE_ENV !== 'production') {
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

