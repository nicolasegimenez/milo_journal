// useIC.js - Hook para conectar React con backend Motoko en ICP

import { useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/milo_journal_backend';

const canisterId = process.env.REACT_APP_BACKEND_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';

const useIC = () => {
  const [actor, setActor] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const connect = async () => {
    try {
      const agent = new HttpAgent({ 
        host: "http://localhost:4943"
      });

      // Siempre fetch root key en desarrollo local
      await agent.fetchRootKey();

      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      setActor(actor);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error connecting to IC:', error);
    }
  };

  return { actor, identity, isAuthenticated, connect };
};

export default useIC;

